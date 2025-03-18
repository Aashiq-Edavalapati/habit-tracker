import { useState } from 'react';

const HabitPanel = ({ habits, setHabits, trackHabit, entries }) => {
  const [newHabit, setNewHabit] = useState({ name: '', icon: '✅' });
  const [showForm, setShowForm] = useState(false);
  
  const calculateStreak = (habitId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entry.habitId === habitId && entryDate === dateStr;
      });
      if (hasEntry) {
        streak++;
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

  const iconOptions = ['✅', '🏃', '💧', '📚', '🧘', '🍎', '💪', '🧠', '😴', '🚭'];

  return (
    <div className="habit-panel p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 pb-3 border-b">My Habits</h2>
      
      {habits.length === 0 && !showForm && (
        <div className="text-center py-10 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't added any habits yet</p>
          <button 
            className="btn btn-primary add-habit-btn px-5 py-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-md hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md"
            onClick={() => setShowForm(true)}
          >
            + Add Your First Habit
          </button>
        </div>
      )}
      
      <div className="habits-list space-y-4">
        {habits.map(habit => {
          const streak = calculateStreak(habit.id);
          return (
            <div 
              key={habit.id} 
              className={`habit-item flex flex-col p-5 rounded-lg transition-all duration-200 ${!habit.active ? 'opacity-60 bg-gray-50' : 'bg-gradient-to-r from-white to-gray-50 hover:shadow-md'}`}
            >
              <div className="habit-header flex justify-between items-center">
                <div className="habit-info flex items-center space-x-3">
                  <span className="habit-icon text-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-full shadow-sm">{habit.icon}</span>
                  <span className="habit-name font-medium text-lg">{habit.name}</span>
                </div>
                <div className={`habit-streak text-sm px-4 py-1 rounded-full ${streak > 2 ? 'bg-gradient-to-r from-green-100 to-green-200' : 'bg-gradient-to-r from-gray-100 to-gray-200'}`}>
                  <span className={`streak-count font-bold text-lg ${streak > 2 ? 'text-green-600' : 'text-gray-600'}`}>
                    {streak}
                  </span> {streak === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="mt-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <div className="habit-actions mt-4 flex justify-between items-center">
                <div className="track-buttons flex space-x-2">
                  {[1, 2, 3].map(intensity => (
                    <button 
                      key={intensity}
                      className={`px-3 py-2 rounded-md text-white transition-all duration-200 ${!habit.active ? 'bg-gray-300 cursor-not-allowed' : `bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-sm`}`}
                      onClick={() => handleTrackHabit(habit.id, intensity)}
                      disabled={!habit.active}
                      title={`Track with intensity ${intensity}`}
                    >
                      {Array(intensity).fill(habit.icon).join('')}
                    </button>
                  ))}
                </div>
                <button 
                  className={`px-4 py-2 rounded-md transition-all duration-200 shadow-sm ${habit.active ? 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white' : 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white'}`}
                  onClick={() => toggleHabitActive(habit.id)}
                >
                  {habit.active ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {showForm ? (
        <form onSubmit={handleAddHabit} className="habit-form mt-6 bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">New Habit</h3>
          <div className="form-row flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
              <input
                type="text"
                value={newHabit.name}
                onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="What habit would you like to track?"
                className="w-full p-3 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-gray-200 ${newHabit.icon === icon ? 'bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm' : 'bg-white shadow-sm'}`}
                    onClick={() => setNewHabit({ ...newHabit, icon })}
                  >
                    {icon}
                  </button>
                ))}
                <input
                  type="text"
                  value={newHabit.icon}
                  onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })}
                  placeholder="🔍"
                  className="w-10 h-10 p-2 rounded-md text-center bg-white shadow-sm"
                  maxLength={2}
                  title="Enter a custom emoji"
                />
              </div>
            </div>
          </div>
          <div className="form-actions mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              className="px-4 py-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md hover:from-gray-300 hover:to-gray-400 transition-all duration-200" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-md hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-sm"
              disabled={!newHabit.name.trim()}
            >
              Add Habit
            </button>
          </div>
        </form>
      ) : (
        habits.length > 0 && (
          <button 
            className="btn btn-primary add-habit-btn mt-6 px-5 py-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-md hover:from-green-500 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-md"
            onClick={() => setShowForm(true)}
          >
            <span className="text-lg">+</span> Add Habit
          </button>
        )
      )}
    </div>
  );
};

export default HabitPanel;