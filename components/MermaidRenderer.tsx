import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
  scale: number;
  onError: (error: string) => void;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, scale, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isRendered, setIsRendered] = useState(false);

  // Initialize mermaid config
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark', // Fits our dark UI
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      // Improve layout for some charts
      flowchart: { curve: 'basis' },
      maxTextSize: 50000,
    });
  }, []);

  const renderChart = useCallback(async () => {
    if (!code) {
      setSvgContent('');
      setIsRendered(false);
      return;
    }
    
    // Reset state before new render
    setIsRendered(false);
    onError('');

    // Clean code: remove markdown blocks, trim, and handle potential separators
    let cleanedCode = code
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Safety check: remove semicolons at end of lines
    cleanedCode = cleanedCode.replace(/;\s*$/gm, '');

    // For mindmaps, strip any classDef/style lines that might have crept in
    if (cleanedCode.startsWith('mindmap')) {
       cleanedCode = cleanedCode
         .split('\n')
         .filter(line => !line.trim().startsWith('classDef') && !line.trim().startsWith('style'))
         .join('\n');
    }

    // Generate a unique ID to prevent conflicts in DOM
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Mermaid render returns the SVG string
      const { svg } = await mermaid.render(id, cleanedCode);
      
      // Use DOMParser to safely manipulate the SVG without regex fragility
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svg, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      if (svgElement) {
        // Remove fixed dimensions to allow scaling via CSS/Container
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');
        
        // Ensure it fits the container
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        
        // Serialize back to string
        const responsiveSvg = new XMLSerializer().serializeToString(svgElement);
        
        setSvgContent(responsiveSvg);
        setIsRendered(true);
      } else {
        throw new Error("Failed to parse SVG");
      }

    } catch (err: any) {
      console.error("Mermaid Render Error:", err);
      setIsRendered(false);
      setSvgContent('');
      
      // Parse error to give better feedback
      let msg = "Syntax Error: The AI generated invalid diagram code.";
      if (err.message && typeof err.message === 'string') {
         if (err.message.includes('Parse error')) {
           msg = "Syntax Error: Failed to parse diagram structure.";
         } else {
           msg = `Render Error: ${err.message}`;
         }
      }
      onError(msg);
    }
  }, [code, onError]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-auto bg-[#1e293b] rounded-lg border border-slate-700 p-4 relative"
      id="chart-container-wrapper"
    >
      {!isRendered && !svgContent && code && (
        <div className="text-slate-500 text-sm animate-pulse flex flex-col items-center gap-2">
           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
           </svg>
           Rendering...
        </div>
      )}
      
      {svgContent && (
        <div 
          ref={containerRef}
          className="transition-transform duration-200 ease-out origin-center flex justify-center items-center"
          style={{ transform: `scale(${scale})`, width: '100%' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};

export default MermaidRenderer;