import { useState, useEffect } from 'react';

const CLIMode = ({ entries, habits, currentBranch }) => {
  const [asciiGraph, setAsciiGraph] = useState('');
  
  useEffect(() => {
    // Generate ASCII representation of the habit graph
    const generateAsciiGraph = () => {
      // Get data for the last 30 days
      const days = 30;
      const today = new Date();
      let graph = '';
      
      // Header
      graph += '  CodeHabit Tracker - Branch: ' + currentBranch + '\n';
      graph += '  ' + '─'.repeat(50) + '\n';
      
      // Date labels
      graph += '  ';
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (i % 5 === 0) {
          graph += date.getDate().toString().padStart(2, '0') + ' ';
        } else {
          graph += '   ';
        }
      }
      graph += '\n';
      
      // Graph lines for each habit
      habits.filter(h => h.active).forEach(habit => {
        graph += habit.icon + ' ';
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Find entries for this habit and date
          const dayEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entry.habitId === habit.id && 
                   entryDate === dateStr && 
                   entry.branch === currentBranch;
          });
          
          // Calculate intensity
          const totalIntensity = dayEntries.reduce((sum, entry) => sum + entry.intensity, 0);
          
          // Choose character based on intensity
          let char = ' ';
          if (totalIntensity > 0) {
            if (totalIntensity >= 5) char = '█';
            else if (totalIntensity >= 3) char = '▓';
            else if (totalIntensity >= 2) char = '▒';
            else char = '░';
          }
          
          graph += char + '  ';
        }
        
        graph += habit.name + '\n';
      });
      
      // Footer
      graph += '  ' + '─'.repeat(50) + '\n';
      graph += '  ' + habits.filter(h => h.active).length + ' active habits | ' + 
               entries.filter(e => e.branch === currentBranch).length + ' total entries\n';
      
      return graph;
    };
    
    setAsciiGraph(generateAsciiGraph());
  }, [entries, habits, currentBranch]);
  
  return (
    <div className="cli-mode">
      <pre>{asciiGraph}</pre>
    </div>
  );
};

export default CLIMode;