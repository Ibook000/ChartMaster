import React, { useState, KeyboardEvent } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onGenerate(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your chart... (e.g., 'Draw a sequence diagram for an ATM withdrawal')"
          className="w-full h-32 bg-[#1e293b] text-slate-200 border border-slate-700 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500 text-sm leading-relaxed"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-500">
          Shift + Enter for new line
        </div>
      </div>
      
      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className={`
          flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all duration-200
          ${isLoading || !input.trim() 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]'
          }
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.25 10.5L19.5 12l-1.25 1.5M16.5 12h3" />
            </svg>
            <span>Generate Diagram</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PromptInput;