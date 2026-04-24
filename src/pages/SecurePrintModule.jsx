import React, { useState, useEffect } from 'react';
import { Printer, ShieldCheck, Loader2 } from 'lucide-react';

const SecurePrintModule = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, printed, error
  const [message, setMessage] = useState('');

  // Optional: Disable right click in this component
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleSecurePrint = async () => {
    setStatus('loading');
    setMessage('Fetching and decrypting file securely...');

    try {
      // 1. Fetch file from an API endpoint (Mocking decryption and fetch here)
      // In a real scenario, this would be an actual fetch call:
      // const response = await fetch('/api/file');
      // const arrayBuffer = await response.arrayBuffer();
      // const decryptedBuffer = decrypt(arrayBuffer);
      // const blob = new Blob([decryptedBuffer], { type: 'application/pdf' });

      // Creating a mock PDF blob for demonstration of the isolated feature
      const mockPdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Secure Print Placeholder) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000222 00000 n \n0000000328 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n416\n%%EOF';
      const blob = new Blob([mockPdfContent], { type: 'application/pdf' });

      // 2. Generate temporary URL
      const blobUrl = URL.createObjectURL(blob);

      // 3. Load inside a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      setMessage('Opening secure print dialog...');

      // 4. Trigger print dialog and Cleanup
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error('Print failed:', e);
          setStatus('error');
          setMessage('Failed to trigger print dialog.');
        }

        // Cleanup after print button is pressed / dialog is closed
        // Some browsers block thread until print dialog closes, some don't.
        // We use a timeout to ensure the dialog has time to render before cleanup.
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          setStatus('printed');
          setMessage('Document printed and securely deleted.');
        }, 3000); // Wait 3 seconds to ensure OS spooler grabbed it
      };

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('An error occurred during secure printing.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 select-none font-sans">
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Secure Print</h1>
        <p className="text-sm text-slate-500 mb-8 px-4">
          This document is heavily encrypted. It will be decrypted in-memory, printed directly, and instantly destroyed. No data is saved to disk.
        </p>

        <button
          onClick={handleSecurePrint}
          disabled={status === 'loading'}
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md ${
            status === 'loading' 
              ? 'bg-indigo-400 cursor-not-allowed text-white shadow-indigo-500/20' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
          }`}
        >
          {status === 'loading' ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing securely...</>
          ) : (
            <><Printer className="w-5 h-5" /> Print Securely</>
          )}
        </button>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium border ${
            status === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
            status === 'printed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurePrintModule;
