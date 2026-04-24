import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';
import { Printer, Loader2, CheckCircle2, IndianRupee, Eye, ChevronLeft, ShieldAlert, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '../config';
import PdfCanvasViewer from '../components/PdfCanvasViewer';

const PrintPage = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printResult, setPrintResult] = useState(null);
  
  const [batchInfo, setBatchInfo] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewContentType, setPreviewContentType] = useState('');

  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [isSecureBlanked, setIsSecureBlanked] = useState(false);

  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [isMonochrome, setIsMonochrome] = useState(false);
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || ['Meta', 'Shift', 'Alt', 'Control', 'OS'].includes(e.key)) {
        setIsSecureBlanked(true);
        setTimeout(() => setIsSecureBlanked(false), 3000);
      }
    };
    
    const handleBlur = () => { setIsSecureBlanked(true); };
    const handleFocus = () => { setIsSecureBlanked(false); };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const preventAction = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('cut', preventAction);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('cut', preventAction);
    };
  }, []);

  const previewFile = async (code, index) => {
    try {
      setStatus('Loading preview securely...');
      setSelectedFileIndex(index);
      const response = await axios.get(`${API_BASE_URL}/download/${code}/${index}`);
      setPreviewUrl(`${API_BASE_URL}/download/${code}/${index}`);
      setPreviewContentType(response.headers['content-type'] || 'application/pdf');
      setStatus('Secure Preview loaded.');
    } catch (error) {
      console.error(error);
      setStatus('Failed to load file preview.');
    }
  };

  const triggerNativePrint = (url) => {
    // For web browsers, the most reliable way to trigger the Ctrl+P dialog
    // is to just call window.print().
    window.print();
  };

  const handleFetchInfo = async () => {
    if (!code.trim()) {
      setStatus('Please enter a code.');
      return;
    }

    try {
      setStatus('Fetching file info...');
      setPrintResult(null);
      const response = await axios.get(`${API_BASE_URL}/info/${code}`);
      setBatchInfo(response.data);

      try {
        const pRes = await axios.get(`${API_BASE_URL}/check-printers`);
        if (pRes.data && pRes.data.printers) {
          setPrinters(pRes.data.printers);
          if (pRes.data.printers.length > 0) {
            const firstPrinter = typeof pRes.data.printers[0] === 'string' ? pRes.data.printers[0] : pRes.data.printers[0].name;
            setSelectedPrinter(firstPrinter);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch hardware printers', e);
      }

      setStatus('Info loaded. Ready to print.');
    } catch (error) {
      console.error(error);
      setStatus('Invalid code or files have been deleted.');
      setBatchInfo(null);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      setPrintResult(null);

      setStatus('Sending documents securely to hardware printer...');

      // COMPLETELY BYPASS browser dialog to prevent "Save as PDF" security risk.
      // We directly hit the backend which uses pdf-to-printer to spool directly to hardware!
      
      try {
        await axios.post(`${API_BASE_URL}/print/${code}`, {
          printerName: selectedPrinter,
          settings: {
            monochrome: isMonochrome,
            copies: copies
          }
        });
        
        const baseRate = 2.0;
        const surgeMultiplier = 1.15;
        const assumedPages = batchInfo.files.length * 4;
        const totalAmount = (assumedPages * baseRate * surgeMultiplier).toFixed(2);
        
        const upiId = "partner@upi";
        const upiLink = `upi://pay?pa=${upiId}&pn=SafePrint%20Partner&am=${totalAmount}&cu=INR`;

        setCheckoutData({
          amount: totalAmount,
          upiLink: upiLink,
          pages: assumedPages,
          surgeInfo: "+15% AI Surge Applied"
        });

        setStatus('Print job dispatched to hardware. Awaiting customer payment.');
        setPrintResult('success');
        setCode('');
      } catch (error) {
        console.error("Print API Error Details:", error);
        const msg = error.response?.data?.error || `Error: ${error.message}`;
        setStatus(msg);
        setPrintResult('error');
      } finally {
        setIsPrinting(false);
      }

    } catch (error) {
      setStatus(`Error triggering hardware print: ${error.message}`);
      setPrintResult('error');
      setIsPrinting(false);
    }
  };

  const handleScan = (result, error) => {
    if (!!result) {
      const scannedText = result?.text || '';
      const url = new URL(scannedText);
      const extractedCode = url.searchParams.get('code') || scannedText.split('/').pop();
      setCode(extractedCode);
      setStatus('');
      setPrintResult(null);
      setShowScanner(false);
      setTimeout(() => {
         fetchInfoDirect(extractedCode);
      }, 100);
    }
    if (!!error) console.warn(error);
  };

  const fetchInfoDirect = async (c) => {
    try {
      setStatus('Fetching file info...');
      setPrintResult(null);
      const response = await axios.get(`${API_BASE_URL}/info/${c}`);
      setBatchInfo(response.data);
      
      try {
        const pRes = await axios.get(`${API_BASE_URL}/check-printers`);
        if (pRes.data && pRes.data.printers) {
          setPrinters(pRes.data.printers);
          if (pRes.data.printers.length > 0) {
            const firstPrinter = typeof pRes.data.printers[0] === 'string' ? pRes.data.printers[0] : pRes.data.printers[0].name;
            setSelectedPrinter(firstPrinter);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch hardware printers', e);
      }

      setStatus('Info loaded. Ready to print.');
    } catch (error) {
      console.error(error);
      setStatus('Invalid code or files have been deleted.');
      setBatchInfo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 font-sans print:bg-white print:min-h-0">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
              <Store className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">SafePrint <span className="text-indigo-600">Receiver</span></span>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center p-6 pt-10 print:p-0 print:m-0 print:block">
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl p-8 w-full max-w-2xl relative overflow-hidden print:shadow-none print:border-none print:max-w-full print:p-0 print:overflow-visible">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 print:hidden" />

          <h1 className="text-2xl font-extrabold text-center mb-2 text-slate-900 print:hidden">Print Section</h1>
          <p className="text-sm text-slate-500 text-center mb-6 print:hidden">
            Enter or scan the unique code to securely print the file.
          </p>

          {!batchInfo ? (
            <div className="max-w-md mx-auto print:hidden">
              <input
                type="text"
                placeholder="Enter unique code"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3.5 mb-4 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-center text-xl font-mono uppercase text-slate-800 transition"
                value={code}
                onChange={(e) => { setCode(e.target.value); setPrintResult(null); setStatus(''); }}
              />

              {status && (
                <div className={`mb-4 flex items-center justify-center gap-2 text-sm p-3 rounded-xl font-medium ${
                  printResult === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {status}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFetchInfo}
                  disabled={!code || isPrinting}
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fetch Documents
                </button>

                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition border border-slate-200"
                >
                  {showScanner ? 'Close Scanner' : 'Scan QR Code'}
                </button>
              </div>

              {showScanner && (
                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <QrReader
                    constraints={{ facingMode: 'environment' }}
                    onResult={handleScan}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className={`w-full flex items-center justify-center gap-2 text-sm p-3 rounded-xl font-medium ${
                printResult === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                printResult === 'error'   ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {isPrinting && <Loader2 className="w-4 h-4 animate-spin" />}
                {status}
              </div>

              {checkoutData ? (
                /* --- POINT OF SALE PAYMENT UI --- */
                <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-indigo-400"></div>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Print Successful</h2>
                  <p className="text-slate-500 text-sm mb-8">Please ask the customer to scan to pay.</p>

                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                      <QRCodeSVG 
                        value={checkoutData.upiLink} 
                        size={200}
                        level={"H"}
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-slate-500 text-sm font-medium">Est. Pages Printed</span>
                       <span className="text-slate-800 font-bold">{checkoutData.pages}</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                       <span className="text-slate-500 text-sm font-medium">Pricing Status</span>
                       <span className="text-indigo-700 font-bold text-xs bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200">{checkoutData.surgeInfo}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 font-bold uppercase tracking-wide text-sm">Total Amount</span>
                       <span className="text-3xl font-extrabold text-emerald-600 flex items-center gap-1">
                         <IndianRupee className="w-6 h-6" />{checkoutData.amount}
                       </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 print:hidden">
                    <button
                      onClick={() => { setCheckoutData(null); setBatchInfo(null); setStatus(''); setPrintResult(null); }}
                      className="w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl hover:bg-emerald-100 transition border border-emerald-200"
                    >
                      Paid by Cash
                    </button>
                    <button
                      onClick={() => { setCheckoutData(null); setBatchInfo(null); setStatus(''); setPrintResult(null); }}
                      className="w-full bg-blue-50 text-blue-700 font-bold py-3.5 rounded-xl hover:bg-blue-100 transition border border-blue-200"
                    >
                      Paid by Card
                    </button>
                  </div>
                  <button
                    onClick={() => { setCheckoutData(null); setBatchInfo(null); setStatus(''); setPrintResult(null); }}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 print:hidden"
                  >
                    Complete Transaction & Return
                  </button>
                </div>
              ) : previewUrl ? (
                /* --- SECURE PREVIEW UI --- */
                <div className="w-full flex flex-col gap-4 print:block">
                  <div className="flex justify-between items-center print:hidden">
                    <button
                      onClick={() => { setPreviewUrl(''); setSelectedFileIndex(null); setStatus(''); }}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-bold transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Files
                    </button>
                    
                    <button
                      onClick={() => {
                        setPreviewUrl(''); 
                        setSelectedFileIndex(null); 
                        handlePrint();
                      }}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md"
                    >
                      <Printer className="w-4 h-4" /> Print Document securely to Hardware
                    </button>
                  </div>
                  
                  <div className="w-full h-[500px] border-2 border-slate-200 rounded-xl relative overflow-hidden bg-slate-50 select-none shadow-inner print:border-none print:h-auto print:overflow-visible print:bg-white print:shadow-none">
                    {isSecureBlanked && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 text-red-400 print:hidden">
                         <ShieldAlert className="w-16 h-16 mb-4 animate-pulse" />
                         <p className="font-extrabold text-xl tracking-widest text-white">SCREENSHOT DETECTED</p>
                         <p className="text-sm font-medium mt-2 text-slate-400">Preview locked for privacy.</p>
                      </div>
                    )}
                    <div className={`w-full h-full transition-opacity duration-75 ${isSecureBlanked ? 'opacity-0' : 'opacity-100'} print:opacity-100 print:h-auto`}>
                      {previewContentType.includes('image') ? (
                        <img src={previewUrl} alt="Secure Doc" className="w-full h-auto max-h-full object-contain pointer-events-none print:max-h-none print:block" />
                      ) : (
                        <PdfCanvasViewer url={previewUrl} />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* --- BATCH REVIEW UI --- */
                <div className="w-full flex flex-col items-center print:hidden">
                  <div className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-6">
                     <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                        {batchInfo.files.length} Document{batchInfo.files.length !== 1 ? 's' : ''} Ready for Print
                     </h3>
                     
                     {batchInfo.comment && (
                       <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Message from Customer:</p>
                          <p className="text-sm text-amber-800 whitespace-pre-wrap font-medium">{batchInfo.comment}</p>
                       </div>
                     )}

                     <ul className="space-y-2 mb-2 max-h-60 overflow-y-auto pr-2" style={{scrollbarWidth:'thin'}}>
                       {batchInfo.files.map((f, i) => (
                         <li key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition group">
                            <div className="flex-1 truncate text-sm font-semibold text-slate-700">{f.name}</div>
                            {f.encrypted && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-200">Encrypted</span>}
                            <button 
                              onClick={() => previewFile(code, f.index)}
                              className="p-1.5 text-slate-400 border border-transparent rounded-lg hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition"
                              title="Securely Preview Document"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                         </li>
                       ))}
                     </ul>
                  </div>

                  {printers.length > 0 && (
                    <div className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-6 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Hardware Print Settings
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Target Printer</label>
                          <select 
                            value={selectedPrinter}
                            onChange={(e) => setSelectedPrinter(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                          >
                            {printers.map((p, idx) => {
                              const pName = typeof p === 'string' ? p : p.name;
                              return <option key={idx} value={pName}>{pName}</option>;
                            })}
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-600">Print in Color?</label>
                          <button
                            onClick={() => setIsMonochrome(!isMonochrome)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isMonochrome ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${!isMonochrome ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-600">Copies per Document</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="100" 
                            value={copies}
                            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2 text-center outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-3 max-w-md">
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPrinting
                        ? <><Loader2 className="w-6 h-6 animate-spin" /> Printing...</>
                        : <><Printer className="w-6 h-6" /> Print Document Now</>}
                    </button>
                    
                    <button
                      onClick={() => { setBatchInfo(null); setStatus(''); }}
                      className="w-full bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-xl hover:bg-slate-200 transition border border-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-center text-slate-400 mt-8 font-medium print:hidden">
            🔒 For your security, the document is permanently deleted from our servers immediately after printing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintPage; 