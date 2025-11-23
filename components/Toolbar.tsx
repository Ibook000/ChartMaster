import React from 'react';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;
  onDownloadHTML: () => void;
  onCopyCode: () => void;
  hasContent: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onResetZoom,
  onDownloadPNG,
  onDownloadSVG,
  onDownloadHTML,
  onCopyCode,
  hasContent
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-[#1e293b] border-b border-slate-700 rounded-t-lg w-full">
      <div className="flex items-center gap-1 mr-auto">
        <button 
          onClick={onZoomOut} 
          disabled={!hasContent}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50" 
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13 10H7" />
          </svg>
        </button>
        <button 
          onClick={onResetZoom} 
          disabled={!hasContent}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50 text-xs font-mono"
          title="Reset Zoom"
        >
          100%
        </button>
        <button 
          onClick={onZoomIn} 
          disabled={!hasContent}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
        </button>
      </div>

      <div className="h-6 w-px bg-slate-700 mx-2 hidden sm:block"></div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onCopyCode} 
          disabled={!hasContent}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          Copy Code
        </button>

        <div className="relative group">
           <button 
            disabled={!hasContent}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50 disabled:bg-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
          
          <div className="absolute right-0 mt-1 w-32 bg-[#1e293b] border border-slate-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button onClick={onDownloadPNG} className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white first:rounded-t-md">PNG Image</button>
            <button onClick={onDownloadSVG} className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">SVG Vector</button>
            <button onClick={onDownloadHTML} className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white last:rounded-b-md">HTML Page</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;