import { useState } from 'react';

const QuickLogModal = ({ onClose, habits, onTrack }) => {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [intensity, setIntensity] = useState(1);
  
  const handleTrack = () => {
    if (selectedHabit) {
      onTrack(selectedHabit, new Date().toISOString(), intensity);
    }
  };
  
  const handleKeyDown = (e) => {
    // Close on Escape
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Submit on Enter
    if (e.key === 'Enter' && selectedHabit) {
      handleTrack();
    }
    
    // Number keys for intensity
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      setIntensity(parseInt(e.key));
    }
  };
  
  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="quick-log-modal slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Quick Log</h3>
          <button 
            className="btn btn-icon" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="habit-selector">
          {habits.map(habit => (
            <button
              key={habit.id}
              className={`habit-button ${selectedHabit === habit.id ? 'selected' : ''}`}
              onClick={() => setSelectedHabit(habit.id)}
            >
              <span className="habit-icon">{habit.icon}</span>
              <span className="habit-name">{habit.name}</span>
            </button>
          ))}
        </div>
        
        <div className="intensity-selector">
          <p>Intensity:</p>
          <div className="intensity-buttons">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                className={`intensity-button ${intensity === level ? 'selected' : ''}`}
                onClick={() => setIntensity(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleTrack}
            disabled={!selectedHabit}
          >
            Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLogModal;