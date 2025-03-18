import { useState, useEffect } from 'react';

const StatsPanel = ({ entries, habits, currentBranch }) => {
  const [stats, setStats] = useState({
    totalTracked: 0,
    streakDays: 0,
    mostConsistentHabit: null,
    percentageChange: 0,
    habitsStats: []
  });
  
  useEffect(() => {
    // Filter entries for current branch
    const branchEntries = entries.filter(entry => entry.branch === currentBranch);
    
    // Calculate streak
    const calculateStreak = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = new Date(today);
      
      // Check for consecutive days
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if any entries exist for this date
        const hasEntry = branchEntries.some(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === dateStr;
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
    
    // Calculate most consistent habit
    const calculateMostConsistentHabit = () => {
      const habitCounts = {};
      
      habits.forEach(habit => {
        const habitEntries = branchEntries.filter(entry => entry.habitId === habit.id);
        habitCounts[habit.id] = {
          count: habitEntries.length,
          name: habit.name,
          icon: habit.icon,
          color: habit.color
        };
      });
      
      let maxCount = 0;
      let mostConsistentHabit = null;
      
      Object.entries(habitCounts).forEach(([habitId, data]) => {
        if (data.count > maxCount) {
          maxCount = data.count;
          mostConsistentHabit = {
            id: habitId,
            name: data.name,
            icon: data.icon,
            count: data.count,
            color: data.color
          };
        }
      });
      
      return mostConsistentHabit;
    };
    
    // Calculate percentage change from previous week
    const calculatePercentageChange = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Current week
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - 7);
      
      const currentWeekEntries = branchEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= currentWeekStart && entryDate <= today;
      });
      
      // Previous week
      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      
      const previousWeekEnd = new Date(currentWeekStart);
      previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
      
      const previousWeekEntries = branchEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= previousWeekStart && entryDate <= previousWeekEnd;
      });
      
      const currentWeekCount = currentWeekEntries.length;
      const previousWeekCount = previousWeekEntries.length;
      
      if (previousWeekCount === 0) {
        return currentWeekCount > 0 ? 100 : 0;
      }
      
      return Math.round(((currentWeekCount - previousWeekCount) / previousWeekCount) * 100);
    };
    
    // Calculate habit statistics
    const calculateHabitStats = () => {
      return habits
        .filter(habit => habit.active)
        .map(habit => {
          const habitEntries = branchEntries.filter(entry => entry.habitId === habit.id);
          
          // Count total entries
          const totalEntries = habitEntries.length;
          
          // Calculate average intensity
          const totalIntensity = habitEntries.reduce((sum, entry) => sum + entry.intensity, 0);
          const avgIntensity = totalEntries > 0 ? (totalIntensity / totalEntries).toFixed(1) : 0;
          
          // Group by day to count active days
          const uniqueDays = new Set();
          habitEntries.forEach(entry => {
            const day = new Date(entry.date).toISOString().split('T')[0];
            uniqueDays.add(day);
          });
          
          return {
            id: habit.id,
            name: habit.name,
            icon: habit.icon,
            color: habit.color,
            totalEntries,
            avgIntensity,
            activeDays: uniqueDays.size
          };
        })
        .sort((a, b) => b.totalEntries - a.totalEntries);
    };
    
    // Update stats
    setStats({
      totalTracked: branchEntries.length,
      streakDays: calculateStreak(),
      mostConsistentHabit: calculateMostConsistentHabit(),
      percentageChange: calculatePercentageChange(),
      habitsStats: calculateHabitStats()
    });
  }, [entries, habits, currentBranch]);
  
  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">Current Streak</div>
          <div className="stat-value">{stats.streakDays} days</div>
          <div className="stat-icon">🔥</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">Total Tracked</div>
          <div className="stat-value">{stats.totalTracked}</div>
          <div className="stat-icon">📊</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">Weekly Change</div>
          <div className={`stat-value ${stats.percentageChange >= 0 ? 'positive' : 'negative'}`}>
            {stats.percentageChange >= 0 ? '+' : ''}{stats.percentageChange}%
          </div>
          <div className="stat-icon">
            {stats.percentageChange >= 0 ? '📈' : '📉'}
          </div>
        </div>
        
        {stats.mostConsistentHabit && (
          <div className="stat-card">
            <div className="stat-header">Most Consistent</div>
            <div className="stat-value">
              <span 
                className="habit-indicator" 
                style={{backgroundColor: stats.mostConsistentHabit.color}}
              ></span>
              {stats.mostConsistentHabit.icon} {stats.mostConsistentHabit.name}
            </div>
            <div className="stat-detail">
              {stats.mostConsistentHabit.count} entries
            </div>
          </div>
        )}
      </div>
      
      <div className="habits-breakdown">
        <h3>Habits Breakdown</h3>
        <div className="habits-list">
          {stats.habitsStats.map(habit => (
            <div key={habit.id} className="habit-stat-item">
              <div className="habit-stat-header">
                <span 
                  className="habit-color-dot" 
                  style={{backgroundColor: habit.color}}
                ></span>
                <span className="habit-icon">{habit.icon}</span>
                <span className="habit-name">{habit.name}</span>
              </div>
              <div className="habit-stat-details">
                <div className="habit-stat-detail">
                  <span className="detail-label">Days:</span>
                  <span className="detail-value">{habit.activeDays}</span>
                </div>
                <div className="habit-stat-detail">
                  <span className="detail-label">Entries:</span>
                  <span className="detail-value">{habit.totalEntries}</span>
                </div>
                <div className="habit-stat-detail">
                  <span className="detail-label">Avg. Intensity:</span>
                  <span className="detail-value">{habit.avgIntensity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;