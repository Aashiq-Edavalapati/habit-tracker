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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mergeConflicts, setMergeConflicts] = useState([]);
  
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
        // Toggle quick log functionality
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
  };

  return (
    <div className="App">
      <header className="app-header glass-panel">
        <h1><span className="text-primary">{"<"}</span>CodeHabit<span className="text-primary">{"/>"}</span></h1>
        <div className="header-controls">
          <button 
            className="btn btn-icon" 
            onClick={() => setShowCommandPalette(true)}
            title="Command Palette (Ctrl+P)"
          >
            Ctrl + P
          </button>
        </div>
      </header>
      
      <main className="app-content">
        <div className="dashboard-container">
          <section className="dashboard-section glass-panel">
            <h2>Contribution Graph <span className="branch-indicator">@{currentBranch}</span></h2>
            <ContributionGrid 
              entries={entries} 
              habits={habits}
              currentBranch={currentBranch}
            />
          </section>
          
          <section className="habits-section glass-panel">
            <h2>Habits</h2>
            <HabitPanel 
              habits={habits} 
              setHabits={setHabits}
              trackHabit={trackHabit}
              entries={entries}
            />
          </section>
          
          {mergeConflicts.filter(c => !c.resolved).length > 0 && (
            <section className="conflicts-section glass-panel neon-border">
              <h2>Merge Conflicts</h2>
              <div className="merge-conflicts">
                {mergeConflicts.filter(c => !c.resolved).map(conflict => (
                  <div key={conflict.date} className="merge-conflict-item">
                    <p>Missed tracking on {new Date(conflict.date).toLocaleDateString()}</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        // Show a UI to resolve this conflict
                        // For MVP, we'll just resolve with default values
                        const defaultResolutions = habits
                          .filter(h => h.active)
                          .map(h => ({ habitId: h.id, intensity: 1 }));
                        resolveMergeConflict(conflict.date, defaultResolutions);
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      {showCommandPalette && (
        <CommandPalette 
          onClose={() => setShowCommandPalette(false)}
          onCommand={handleCommand}
        />
      )}
      
      <div className="quick-log-btn">
        <button 
          className="btn btn-primary btn-circle"
          onClick={() => setShowCommandPalette(true)}
          title="Quick Log (Ctrl+L)"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default App;