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
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">My Habits</h2>
      
      {habits.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't added any habits yet</p>
          <button 
            className="btn btn-primary add-habit-btn px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-md"
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
              className={`habit-item flex flex-col p-4 border rounded-lg transition-all duration-200 ${!habit.active ? 'opacity-60 bg-gray-50' : 'bg-white hover:shadow-md'}`}
            >
              <div className="habit-header flex justify-between items-center">
                <div className="habit-info flex items-center space-x-3">
                  <span className="habit-icon text-2xl bg-gray-100 p-2 rounded-full">{habit.icon}</span>
                  <span className="habit-name font-medium text-lg">{habit.name}</span>
                </div>
                <div className="habit-streak text-sm bg-gray-100 px-3 py-1 rounded-full">
                  <span className={`streak-count font-bold text-lg ${streak > 2 ? 'text-green-600' : 'text-gray-600'}`}>
                    {streak}
                  </span> {streak === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="habit-actions mt-4 flex justify-between items-center">
                <div className="track-buttons flex space-x-2">
                  {[1, 2, 3].map(intensity => (
                    <button 
                      key={intensity}
                      className={`px-3 py-1 rounded-md text-white transition-colors duration-200 ${!habit.active ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 shadow-sm'}`}
                      onClick={() => handleTrackHabit(habit.id, intensity)}
                      disabled={!habit.active}
                      title={`Track with intensity ${intensity}`}
                    >
                      {Array(intensity).fill(habit.icon).join('')}
                    </button>
                  ))}
                </div>
                <button 
                  className={`px-3 py-1 rounded-md transition-colors duration-200 ${habit.active ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} shadow-sm`}
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
        <form onSubmit={handleAddHabit} className="habit-form mt-6 bg-gray-50 p-5 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">New Habit</h3>
          <div className="form-row flex flex-col space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
              <input
                type="text"
                value={newHabit.name}
                onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="What habit would you like to track?"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-gray-200 ${newHabit.icon === icon ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white border'}`}
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
                  className="w-10 h-10 p-2 border rounded-md text-center"
                  maxLength={2}
                  title="Enter a custom emoji"
                />
              </div>
            </div>
          </div>
          <div className="form-actions mt-5 flex justify-end space-x-3">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors duration-200" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm"
              disabled={!newHabit.name.trim()}
            >
              Add Habit
            </button>
          </div>
        </form>
      ) : (
        habits.length > 0 && (
          <button 
            className="btn btn-primary add-habit-btn mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 shadow-md"
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