import { useState, useEffect } from 'react';

const ContributionGrid = ({ entries, habits, currentBranch }) => {
  const [gridData, setGridData] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // Generate grid data for the last 365 days
    const generateGridData = () => {
      const today = new Date();
      const days = [];
      
      // Generate days
      for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Filter entries for this date and current branch
        const dayEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === dateStr && entry.branch === currentBranch;
        });
        
        // Calculate activity level (0-4)
        let activityLevel = 0;
        if (dayEntries.length > 0) {
          // Sum up intensities
          const totalIntensity = dayEntries.reduce((sum, entry) => sum + entry.intensity, 0);
          
          // Scale to 0-4 range
          if (totalIntensity >= 10) activityLevel = 4;
          else if (totalIntensity >= 7) activityLevel = 3;
          else if (totalIntensity >= 4) activityLevel = 2;
          else if (totalIntensity > 0) activityLevel = 1;
        }
        
        days.push({
          date: dateStr,
          entries: dayEntries,
          activityLevel,
          dayOfWeek: date.getDay(),
          formattedDate: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric'
          })
        });
      }
      
      return days;
    };
    
    setGridData(generateGridData());
  }, [entries, currentBranch]);
  
  const handleCellMouseEnter = (day, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 5
    });
    
    // Create tooltip content
    if (day.entries.length === 0) {
      setTooltipContent({
        date: day.formattedDate,
        message: 'No habits tracked'
      });
    } else {
      // Group entries by habit
      const habitCounts = day.entries.reduce((acc, entry) => {
        const habit = habits.find(h => h.id === entry.habitId);
        if (habit) {
          if (!acc[habit.name]) {
            acc[habit.name] = {
              icon: habit.icon,
              count: 0,
              intensity: 0
            };
          }
          acc[habit.name].count += 1;
          acc[habit.name].intensity += entry.intensity;
        }
        return acc;
      }, {});
      
      setTooltipContent({
        date: day.formattedDate,
        habits: habitCounts
      });
    }
  };
  
  const handleCellMouseLeave = () => {
    setTooltipContent(null);
  };
  
  // Helper for CSS class based on activity level
  const getActivityClass = (level) => {
    switch (level) {
      case 0: return 'activity-none';
      case 1: return 'activity-low';
      case 2: return 'activity-medium';
      case 3: return 'activity-high';
      case 4: return 'activity-very-high';
      default: return 'activity-none';
    }
  };
  
  return (
    <div className="contribution-container">
      <div className="contribution-grid-wrapper">
        <div className="contribution-grid">
          {gridData.map((day) => (
            <div
              key={day.date}
              className={`contribution-cell ${getActivityClass(day.activityLevel)}`}
              data-date={day.date}
              onMouseEnter={(e) => handleCellMouseEnter(day, e)}
              onMouseLeave={handleCellMouseLeave}
            ></div>
          ))}
        </div>
        
        {tooltipContent && (
          <div 
            className="tooltip fade-in"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y
            }}
          >
            <div className="tooltip-date">{tooltipContent.date}</div>
            {tooltipContent.message ? (
              <div className="tooltip-message">{tooltipContent.message}</div>
            ) : (
              <div className="tooltip-habits">
                {Object.entries(tooltipContent.habits).map(([name, data]) => (
                  <div key={name} className="tooltip-habit">
                    <span>{data.icon} {name}: </span>
                    <span className="tooltip-intensity">
                      {Array(Math.min(data.intensity, 5)).fill('●').join('')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="contribution-legend">
        <span>Less</span>
        <div className={`contribution-cell activity-none`}></div>
        <div className={`contribution-cell activity-low`}></div>
        <div className={`contribution-cell activity-medium`}></div>
        <div className={`contribution-cell activity-high`}></div>
        <div className={`contribution-cell activity-very-high`}></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionGrid;