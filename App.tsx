import React, { useState, useCallback } from 'react';
import { LoadingState, ChartData } from './types';
import { generateMermaidChart } from './services/geminiService';
import MermaidRenderer from './components/MermaidRenderer';
import PromptInput from './components/PromptInput';
import Toolbar from './components/Toolbar';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [currentChart, setCurrentChart] = useState<ChartData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1);

  const handleGenerate = async (prompt: string) => {
    setLoadingState(LoadingState.LOADING);
    setErrorMsg('');
    setCurrentChart(null); // Clear previous to show loading state better

    try {
      const data = await generateMermaidChart(prompt);
      setCurrentChart(data);
      setLoadingState(LoadingState.SUCCESS);
      setZoomScale(1); // Reset zoom on new chart
    } catch (error: any) {
      setLoadingState(LoadingState.ERROR);
      setErrorMsg(error.message || "Something went wrong.");
    }
  };

  const handleError = (msg: string) => {
    if (msg) {
      setErrorMsg(msg);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // --- Export Functions ---

  const getSvgElement = (): SVGSVGElement | null => {
    const container = document.getElementById('chart-container-wrapper');
    return container?.querySelector('svg') || null;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSVG = useCallback(() => {
    const svg = getSvgElement();
    if (!svg) return;
    
    // Clone to manipulate for export
    const svgClone = svg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Use dark background for the SVG file explicitly
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'chart-master.svg');
  }, []);

  const handleDownloadPNG = useCallback(() => {
    const svg = getSvgElement();
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    // Add margin and background for PNG
    const width = svg.viewBox.baseVal.width || svg.clientWidth;
    const height = svg.viewBox.baseVal.height || svg.clientHeight;
    
    // Scale up for better resolution (Retina-like)
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dark background for PNG
    ctx.fillStyle = '#1e293b'; // Matches our UI bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width * scale, height * scale);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, 'chart-master.png');
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  const handleDownloadHTML = useCallback(() => {
    if (!currentChart?.code) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>ChartMaster Export</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  </script>
  <style>
    body { background-color: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .mermaid { background: #1e293b; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  </style>
</head>
<body>
  <div class="mermaid">
${currentChart.code}
  </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadBlob(blob, 'chart-master.html');
  }, [currentChart]);

  const handleCopyCode = () => {
    if (currentChart?.code) {
      navigator.clipboard.writeText(currentChart.code);
      // Optional: Show toast
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              CM
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200">
              ChartMaster AI
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 & Mermaid.js
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Input */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Description
            </h2>
            <PromptInput onGenerate={handleGenerate} isLoading={loadingState === LoadingState.LOADING} />
            
            <div className="mt-6">
               <h3 className="text-xs font-medium text-slate-500 mb-2">TRY THESE PROMPTS:</h3>
               <div className="flex flex-wrap gap-2">
                 <button onClick={() => handleGenerate("Create a mindmap for a marketing strategy")} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700">
                   Marketing Mindmap
                 </button>
                 <button onClick={() => handleGenerate("Sequence diagram for user login API")} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700">
                   Login Sequence
                 </button>
                 <button onClick={() => handleGenerate("Gantt chart for a software project Q1 2024")} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700">
                   Project Gantt
                 </button>
               </div>
            </div>
          </div>

          {currentChart?.explanation && (
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-xl animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                AI Explanation
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentChart.explanation}
              </p>
            </div>
          )}

           {errorMsg && (
            <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg text-red-200 text-sm">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full lg:w-2/3 flex flex-col h-[600px] lg:h-auto min-h-[500px]">
          <div className="flex flex-col h-full bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            <Toolbar 
              onZoomIn={() => setZoomScale(s => Math.min(s + 0.2, 3))}
              onZoomOut={() => setZoomScale(s => Math.max(s - 0.2, 0.5))}
              onResetZoom={() => setZoomScale(1)}
              onDownloadPNG={handleDownloadPNG}
              onDownloadSVG={handleDownloadSVG}
              onDownloadHTML={handleDownloadHTML}
              onCopyCode={handleCopyCode}
              hasContent={!!currentChart?.code}
            />
            
            <div className="flex-1 relative bg-slate-900 overflow-hidden p-1">
              {currentChart?.code ? (
                <MermaidRenderer 
                  code={currentChart.code} 
                  scale={zoomScale} 
                  onError={handleError}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center border-2 border-dashed border-slate-800 rounded-lg m-2">
                  <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-400 mb-1">No Chart Generated Yet</h3>
                  <p className="text-sm max-w-xs mx-auto">
                    Enter a description on the left to generate your first diagram with AI.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;