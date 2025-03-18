import { useState } from 'react';

const HabitPanel = ({ habits, setHabits, trackHabit, entries }) => {
  const [newHabit, setNewHabit] = useState({ name: '', icon: '✅' });
  const [showForm, setShowForm] = useState(false);
  
  // Calculate habit streaks
  const calculateStreak = (habitId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check for consecutive days
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if any entries exist for this habit on this date
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entry.habitId === habitId && entryDate === dateStr;
      });
      
      if (hasEntry) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (newHabit.name.trim()) {
      const newId = habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1;
      setHabits([...habits, { ...newHabit, id: newId, active: true }]);
      setNewHabit({ name: '', icon: '✅' });
      setShowForm(false);
    }
  };
  
  const toggleHabitActive = (id) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, active: !habit.active } : habit
    ));
  };
  
  const handleTrackHabit = (habitId, intensity = 1) => {
    trackHabit(habitId, new Date().toISOString(), intensity);
  };
  
  return (
    <div className="habit-panel">
      <div className="habits-list">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className={`habit-item ${!habit.active ? 'habit-inactive' : ''}`}
          >
            <div className="habit-header">
              <div className="habit-info">
                <span className="habit-icon">{habit.icon}</span>
                <span className="habit-name">{habit.name}</span>
              </div>
              <div className="habit-streak">
                <span className="streak-count">{calculateStreak(habit.id)}</span>
                <span className="streak-label">day streak</span>
              </div>
            </div>
            
            <div className="habit-actions">
              <div className="track-buttons">
                {[1, 2, 3].map(intensity => (
                  <button 
                    key={intensity}
                    className="btn track-btn"
                    onClick={() => handleTrackHabit(habit.id, intensity)}
                    disabled={!habit.active}
                  >
                    {Array(intensity).fill('✅').join('')}
                  </button>
                ))}
              </div>
              
              <button 
                className={`btn toggle-btn ${!habit.active ? 'btn-inactive' : ''}`}
                onClick={() => toggleHabitActive(habit.id)}
              >
                {habit.active ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showForm ? (
        <form onSubmit={handleAddHabit} className="habit-form">
          <div className="form-row">
            <input
              type="text"
              value={newHabit.name}
              onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              placeholder="Habit name"
              className="habit-input"
              autoFocus
            />
            <input
              type="text"
              value={newHabit.icon}
              onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })}
              placeholder="Icon"
              className="icon-input"
              maxLength={2}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Add Habit</button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button 
          className="btn btn-primary add-habit-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Habit
        </button>
      )}
    </div>
  );
};

export default HabitPanel;