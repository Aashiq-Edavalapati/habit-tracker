import { useState, useEffect } from 'react';
import ContributionGrid from './components/ContributionGrid';
import HabitPanel from './components/HabitPanel';
import CommandPalette from './components/CommandPalette';
import './App.css';

function App() {
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem('habits');
    return savedHabits ? JSON.parse(savedHabits) : [
      { id: 1, name: 'Coding', icon: '💻', active: true },
      { id: 2, name: 'Exercise', icon: '🏋️', active: true },
      { id: 3, name: 'Reading', icon: '📚', active: true }
    ];
  });
  
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('entries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [mergeConflicts, setMergeConflicts] = useState([]);
  const [activeMergeConflict, setActiveMergeConflict] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);
  
  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command palette - Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      
      // Quick log - Ctrl+L or Cmd+L
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setShowQuickActions(prev => !prev);
      }
      
      // Escape key to close modals
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowQuickActions(false);
        setActiveMergeConflict(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Check for merge conflicts (missed days)
  useEffect(() => {
    const checkMergeConflicts = () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if any entries exist for yesterday
      const hasYesterdayEntries = entries.some(entry => 
        entry.date.split('T')[0] === yesterdayStr
      );
      
      if (!hasYesterdayEntries) {
        // Create merge conflict for yesterday
        setMergeConflicts(prev => {
          if (!prev.some(conflict => conflict.date.split('T')[0] === yesterdayStr)) {
            return [...prev, { date: `${yesterdayStr}T12:00:00Z`, resolved: false }];
          }
          return prev;
        });
      }
    };
    
    checkMergeConflicts();
  }, [entries]);
  
  const addHabit = (habit) => {
    const newHabit = {
      id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
      name: habit.name,
      icon: habit.icon || '✅',
      active: true
    };
    setHabits([...habits, newHabit]);
  };
  
  const trackHabit = (habitId, date = new Date().toISOString(), intensity = 1) => {
    const newEntry = {
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
      habitId,
      date,
      intensity,
      branch: currentBranch
    };
    setEntries([...entries, newEntry]);
  };
  
  const handleCommand = (command) => {
    const cmdParts = command.split(' ');
    const cmdAction = cmdParts[0].toLowerCase();
    
    switch (cmdAction) {
      case '/track':
        if (cmdParts.length >= 2) {
          const habitName = cmdParts[1];
          const habit = habits.find(h => h.name.toLowerCase() === habitName.toLowerCase());
          
          if (habit) {
            // Check for intensity indicator
            let intensity = 1;
            const lastPart = cmdParts[cmdParts.length - 1];
            if (['✅', '✅✅', '✅✅✅'].includes(lastPart)) {
              intensity = lastPart.length;
            } else if (['1', '2', '3', '4', '5'].includes(lastPart)) {
              intensity = parseInt(lastPart);
            }
            
            trackHabit(habit.id, new Date().toISOString(), intensity);
            return `Tracked ${habit.name} with intensity ${intensity}`;
          } else {
            return `Habit "${habitName}" not found`;
          }
        }
        return 'Usage: /track [habit name] [intensity]';
        
      case '/add':
        if (cmdParts.length >= 2) {
          const habitName = cmdParts[1];
          let icon = '✅';
          
          // Check if an icon was provided
          if (cmdParts.length >= 3 && cmdParts[2].match(/\p{Emoji}/u)) {
            icon = cmdParts[2];
          }
          
          addHabit({ name: habitName, icon });
          return `Added new habit: ${habitName} ${icon}`;
        }
        return 'Usage: /add [habit name] [emoji icon]';
        
      case '/branch':
        if (cmdParts.length >= 2) {
          const branchName = cmdParts[1];
          setCurrentBranch(branchName);
          return `Switched to branch: ${branchName}`;
        }
        return 'Usage: /branch [branch name]';
        
      case '/help':
        return `
Available commands:
/track [habit] [intensity] - Track a habit (intensity: 1-5 or ✅)
/add [habit] [icon] - Add a new habit with optional icon
/branch [name] - Switch to a different habit branch
/help - Show this help message
        `;
        
      default:
        return `Unknown command: ${cmdAction}`;
    }
  };
  
  const resolveMergeConflict = (conflictDate, resolutions) => {
    // Add entries for the resolved conflict
    resolutions.forEach(resolution => {
      trackHabit(resolution.habitId, conflictDate, resolution.intensity);
    });
    
    // Mark conflict as resolved
    setMergeConflicts(prev => 
      prev.map(conflict => 
        conflict.date === conflictDate ? { ...conflict, resolved: true } : conflict
      )
    );
    
    setActiveMergeConflict(null);
  };

  const renderMergeConflictModal = () => {
    if (!activeMergeConflict) return null;
    
    return (
      <div className="modal-backdrop">
        <div className="modal-content glass-panel">
          <h2>Resolve Missed Day</h2>
          <p>What did you accomplish on {new Date(activeMergeConflict.date).toLocaleDateString()}?</p>
          
          <div className="conflict-habits-grid">
            {habits.filter(h => h.active).map(habit => (
              <div key={habit.id} className="conflict-habit-item">
                <div className="habit-header">
                  <span className="habit-icon">{habit.icon}</span>
                  <span className="habit-name">{habit.name}</span>
                </div>
                <div className="intensity-selector">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button 
                      key={level}
                      className={`intensity-btn intensity-${level}`}
                      onClick={() => {
                        resolveMergeConflict(activeMergeConflict.date, [{
                          habitId: habit.id,
                          intensity: level
                        }]);
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveMergeConflict(null)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                const defaultResolutions = habits
                  .filter(h => h.active)
                  .map(h => ({ habitId: h.id, intensity: 1 }));
                resolveMergeConflict(activeMergeConflict.date, defaultResolutions);
              }}
            >
              Mark All as Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickActionsMenu = () => {
    if (!showQuickActions) return null;
    
    return (
      <div className="quick-actions-menu glass-panel">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {habits.filter(h => h.active).map(habit => (
            <div key={habit.id} className="quick-action-item">
              <div className="habit-icon-large">{habit.icon}</div>
              <div className="habit-name">{habit.name}</div>
              <div className="intensity-buttons">
                {[1, 2, 3].map(intensity => (
                  <button
                    key={intensity}
                    className={`intensity-btn intensity-${intensity}`}
                    onClick={() => {
                      trackHabit(habit.id, new Date().toISOString(), intensity);
                      setShowQuickActions(false);
                    }}
                  >
                    {Array(intensity).fill('✅').join('')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button 
          className="btn btn-close"
          onClick={() => setShowQuickActions(false)}
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="app-header glass-panel">
        <h1><span className="text-primary">{"<"}</span>CodeHabit<span className="text-primary">{"/>"}</span></h1>
        <div className="header-controls">
          <div className="branch-selector">
            <span className="branch-label">Branch:</span>
            <select 
              value={currentBranch}
              onChange={(e) => setCurrentBranch(e.target.value)}
              className="branch-select"
            >
              <option value="main">main</option>
              <option value="work">work</option>
              <option value="personal">personal</option>
              <option value="health">health</option>
            </select>
          </div>
          <button 
            className="btn btn-icon" 
            onClick={() => setShowCommandPalette(true)}
            title="Command Palette (Ctrl+P)"
          >
            <span className="shortcut-key">⌘P</span>
          </button>
        </div>
      </header>
      
      <main className="app-content">
        <div className="dashboard-container">
          <section className="dashboard-section glass-panel">
            <div className="section-header">
              <h2>Contribution Graph</h2>
              <div className="section-controls">
                <span className="branch-indicator">@{currentBranch}</span>
              </div>
            </div>
            <ContributionGrid 
              entries={entries} 
              habits={habits}
              currentBranch={currentBranch}
            />
          </section>
          
          <div className="side-panels">
            <section className="habits-section glass-panel">
              <div className="section-header">
                <h2>Habits</h2>
                <div className="section-controls">
                  <button 
                    className="btn btn-small"
                    onClick={() => setShowCommandPalette(true)}
                    title="Add New Habit"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <HabitPanel 
                habits={habits} 
                setHabits={setHabits}
                trackHabit={trackHabit}
                entries={entries}
              />
            </section>
            
            {mergeConflicts.filter(c => !c.resolved).length > 0 && (
              <section className="conflicts-section glass-panel pulse-animation">
                <h2>Missed Days</h2>
                <div className="merge-conflicts">
                  {mergeConflicts.filter(c => !c.resolved).map(conflict => (
                    <div key={conflict.date} className="merge-conflict-item">
                      <div className="conflict-date">
                        <span className="conflict-icon">⚠️</span>
                        <span>{new Date(conflict.date).toLocaleDateString()}</span>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setActiveMergeConflict(conflict)}
                      >
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            <section className="stats-section glass-panel">
              <h2>Stats</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{entries.length}</div>
                  <div className="stat-label">Total Entries</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {entries.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length}
                  </div>
                  <div className="stat-label">Today</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{habits.filter(h => h.active).length}</div>
                  <div className="stat-label">Active Habits</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {showCommandPalette && (
        <CommandPalette 
          onClose={() => setShowCommandPalette(false)}
          onCommand={handleCommand}
        />
      )}
      
      {renderMergeConflictModal()}
      {renderQuickActionsMenu()}
      
      <div className="quick-log-btn">
        <button 
          className="btn btn-primary btn-circle pulse-animation"
          onClick={() => setShowQuickActions(true)}
          title="Quick Log (Ctrl+L)"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default App;