import { useState, useEffect, useRef } from 'react';

const CommandPalette = ({ onClose, onCommand }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
    
    // Close on escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const commandResult = onCommand(input);
      setResult(commandResult);
      setInput('');
      
      // Auto close after a delay if not an error
      if (!commandResult.startsWith('Unknown') && !commandResult.startsWith('Usage:')) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    }
  };
  
  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div 
        className="command-palette-container glass-panel"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="/track gym ✅ or /help"
            className="cmd-palette"
          />
        </form>
        
        {result && (
          <div className="command-result">
            {result}
          </div>
        )}
        
        <div className="command-hints">
          <div className="hint-item">
            <span className="hint-key">/track</span>
            <span className="hint-desc">Track a habit</span>
          </div>
          <div className="hint-item">
            <span className="hint-key">/add</span>
            <span className="hint-desc">Add a new habit</span>
          </div>
          <div className="hint-item">
            <span className="hint-key">/branch</span>
            <span className="hint-desc">Switch branch</span>
          </div>
          <div className="hint-item">
            <span className="hint-key">/help</span>
            <span className="hint-desc">Show help</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;