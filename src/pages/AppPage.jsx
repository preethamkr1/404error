import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { Upload, ShieldCheck, Lock, Unlock, FileText, MessageSquare, Check, Copy, Loader2, X, ArrowRight, Printer } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AppPage = () => {
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newEntries = selectedFiles.map(f => ({
      file: f,
      encrypt: true,
      isPasswordProtected: false,
      password: '',
    }));
    setFiles(prev => [...prev, ...newEntries]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileOption = (index, key, value) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== index) return f;
      const updated = { ...f, [key]: value };
      if (key === 'isPasswordProtected' && !value) updated.password = '';
      return updated;
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select at least one file.');
      return;
    }

    const formData = new FormData();
    files.forEach(entry => formData.append('files', entry.file));

    const metadata = {
      encryptionPrefs: files.map(f => ({
        encrypt: f.encrypt,
        isPasswordProtected: f.isPasswordProtected,
        password: f.password,
      })),
      comment,
    };
    formData.append('metadata', JSON.stringify(metadata));

    try {
      setIsUploading(true);
      setUploadStatus('Securing and transferring files...');
      const res = await axios.post(`${API_BASE_URL}/upload`, formData);
      setUploadCode(res.data.code);
      const baseUrl = window.location.origin;
      setDownloadUrl(`${baseUrl}/print?code=${res.data.code}`);
      setUploadStatus('Transfer Complete');
    } catch (err) {
      console.error(err);
      setUploadStatus('Something went wrong during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetUpload = () => {
    setFiles([]);
    setComment('');
    setUploadCode('');
    setUploadStatus('');
    setDownloadUrl('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-slate-800 font-sans relative overflow-hidden flex flex-col">
      {/* Subtle Background Orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="w-full px-8 py-5 flex items-center justify-between z-10 border-b border-slate-200/60 bg-white/60 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Safe<span className="text-indigo-600">Print</span></span>
        </div>
        <div className="flex items-center gap-4">
           <a href="/nearby" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition">Find Shops</a>
           <a href="/business" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20">Partner Login</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 pb-20">
        {!uploadCode && (
          <div className="text-center max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-200">
               <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Print your documents <span className="text-indigo-600">securely.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
              Upload your sensitive files below. We encrypt them with AES-256, generate a one-time secure code, and destroy them immediately after printing at any local partner shop.
            </p>
          </div>
        )}

        <div className="w-full max-w-xl">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden transition-all duration-500">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400" />

            {!uploadCode ? (
              <div className="space-y-7">
                {/* Drop zone */}
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group outline-none overflow-hidden relative">
                  <input type="file" className="hidden" multiple onChange={handleFilesSelected} />
                  <Upload className="w-10 h-10 text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors group-hover:-translate-y-1 duration-300" />
                  <p className="text-base font-semibold text-slate-700 mb-1">Drag & Drop or Click to Select</p>
                  <p className="text-sm text-slate-400">Supports PDF, JPG, PNG, DOCX (Max 50MB)</p>
                </label>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2" style={{scrollbarWidth:'thin'}}>
                    {files.map((entry, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 transition hover:border-indigo-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2.5 bg-indigo-100 rounded-lg text-indigo-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{entry.file.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatSize(entry.file.size)}</p>
                          </div>
                          <button onClick={() => removeFile(i)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Remove file">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-600">
                               {entry.encrypt ? <Lock className="w-3.5 h-3.5 text-indigo-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                               Server-Side Encryption
                            </span>
                            <button
                              type="button"
                              onClick={() => updateFileOption(i, 'encrypt', !entry.encrypt)}
                              className={`w-10 h-5.5 rounded-full relative transition duration-300 ${entry.encrypt ? 'bg-indigo-500' : 'bg-slate-300'}`}
                            >
                              <span className={`block w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform duration-300 ${entry.encrypt ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          
                          <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-100">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition accent-indigo-600"
                              checked={entry.isPasswordProtected}
                              onChange={(e) => updateFileOption(i, 'isPasswordProtected', e.target.checked)}
                            />
                            <span className="text-xs font-medium text-slate-600">Has existing PDF password?</span>
                          </label>

                          {entry.isPasswordProtected && (
                            <input
                              type="password"
                              placeholder="Enter document password"
                              value={entry.password}
                              onChange={(e) => updateFileOption(i, 'password', e.target.value)}
                              className="w-full mt-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment */}
                <div className="space-y-2">
                   <div className="flex items-center gap-2 pl-1 mb-1">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-slate-700">Instructions for Print Shop</span>
                   </div>
                   <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="E.g. Print 3 copies, double sided, color ink..."
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none h-24"
                   />
                </div>

                <div className="pt-1">
                    <button
                      onClick={handleUpload}
                      disabled={files.length === 0 || isUploading}
                      className="w-full group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 rounded-2xl bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30"
                    >
                      {isUploading ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin mr-3" /> Processing...
                        </>
                      ) : (
                        <>
                           Secure & Upload {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : ''}
                           <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    {uploadStatus && !isUploading && (
                      <p className="mt-4 text-center text-sm font-medium text-red-500">{uploadStatus}</p>
                    )}
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Ready to Print</h2>
                  <p className="text-slate-500 text-center mb-8 max-w-xs leading-relaxed">
                     Provide this code or QR to the print shop operator to retrieve your files.
                  </p>

                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col items-center relative">
                    <button 
                      onClick={copyToClipboard}
                      className="absolute top-4 right-4 p-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg transition text-slate-500 hover:text-indigo-600 flex items-center gap-2 shadow-sm"
                    >
                      {copied ? <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3 h-3"/> Copied</span> : <Copy className="w-4 h-4" />}
                    </button>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Secure Code</span>
                    <span className="text-4xl sm:text-5xl font-mono font-black text-indigo-700 tracking-[0.2em]">{uploadCode}</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 mb-8 transform transition hover:scale-105 duration-300">
                    <QRCodeCanvas value={downloadUrl} size={180} level={"H"} />
                  </div>

                  <button 
                    onClick={resetUpload} 
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition bg-indigo-50 hover:bg-indigo-100 px-6 py-3 rounded-xl border border-indigo-200"
                  >
                    <Upload className="w-4 h-4" /> Upload more files
                  </button>
               </div>
            )}
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
             <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-slate-400" /> AES-256</div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-400" /> Zero Knowledge</div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-2"><Printer className="w-4 h-4 text-slate-400" /> Auto-Wipe</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppPage; 