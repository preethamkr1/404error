import React, { useEffect, useRef, useState } from 'react';

const PdfCanvasViewer = ({ url }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [password, setPassword] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js from CDN if not already loaded
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load PDF.js'));
          });
        }

        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        // Fetch PDF and render, passing password if provided
        const loadingTask = pdfjsLib.getDocument({ url, password: password || undefined });
        let pdf;
        try {
          pdf = await loadingTask.promise;
        } catch (pdfErr) {
          if (pdfErr.name === 'PasswordException') {
            if (isMounted) {
              setIsPasswordRequired(true);
              setLoading(false);
              if (password) setError('Incorrect password. Please try again.');
            }
            return;
          }
          throw pdfErr; // Re-throw other errors
        }
        
        if (!isMounted) return;
        setIsPasswordRequired(false);
        setError(null);
        setNumPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;

        // Clear previous canvases if any
        container.innerHTML = '';

        // Render all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          if (!isMounted) break;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          // Added print utilities to ensure it fills the page on paper and hides shadows
          canvas.className = 'shadow-2xl max-w-full my-4 bg-white print:shadow-none print:m-0 print:w-full print:max-w-none print:block page-break-after-always';
          canvas.style.pointerEvents = 'none'; // Prevent interaction
          
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          container.appendChild(canvas);

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
        }

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error('PDF Render Error:', err);
        if (isMounted) {
          setError('Failed to render preview.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [url, retryTrigger]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRetryTrigger(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full bg-slate-800 rounded-lg overflow-auto no-scrollbar print:bg-white print:h-auto print:overflow-visible print:block"
         onContextMenu={(e) => e.preventDefault()} // Disable right-click
    >
      <div 
        ref={containerRef}
        className="flex flex-col items-center py-4 w-full print:p-0 print:block"
      />

      {loading && !isPasswordRequired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-800/80 z-20 print:hidden">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Rendering secure preview...</p>
        </div>
      )}
      
      {isPasswordRequired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/95 z-30 p-6 print:hidden">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Password Protected PDF</h3>
            <p className="text-sm text-slate-500 mb-4">Please enter the password to unlock and preview this document.</p>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <input 
                type="password" 
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Unlock Document
              </button>
            </form>
          </div>
        </div>
      )}

      {error && !isPasswordRequired && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm print:hidden">{error}</div>
      )}

      {/* Security Overlay - Prevents touch-hold/drag on mobile */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none print:hidden" 
        style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none' 
        }} 
      />
    </div>
  );
};

export default PdfCanvasViewer; 