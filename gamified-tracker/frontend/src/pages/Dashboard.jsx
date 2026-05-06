import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  FiHome, FiTrendingUp, FiAward, FiSettings, FiLogOut,
  FiZap, FiFire, FiCheckCircle, FiClock, FiStar, FiMenu, FiX
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Mock user data with level and XP
  const userStats = {
    level: user?.level || 1,
    currentXP: user?.xp || 0,
    maxXP: (user?.level || 1) * 50,
    streak: tasks.reduce((acc, curr) => acc + (curr.streak || 0), 0),
    tasksCompleted: tasks.filter(t => t.isCompleted).length,
    tasksPending: tasks.filter(t => !t.isCompleted).length,
    achievements: [
      { id: 1, name: 'First Steps', icon: '👣', earned: true },
      { id: 2, name: 'Week Warrior', icon: '⚔️', earned: true },
      { id: 3, name: 'Perfect Month', icon: '📅', earned: false },
      { id: 4, name: 'Level Master', icon: '👑', earned: false },
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
    hover: { y: -5, transition: { duration: 0.3 } }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/tasks', config);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/tasks', {
        title: newTaskTitle,
        type: 'daily'
      }, config);

      setTasks([...tasks, data]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const handleCompleteTask = async (task) => {
    if (task.isCompleted) return; // Already done

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/tasks/${task._id}`, {
        isCompleted: true
      }, config);

      setTasks(tasks.map(t => t._id === task._id ? data : t));
      // Note: To immediately update navbar XP, the AuthContext user object needs a refresh.
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-all duration-300 fixed h-full md:relative`}
          initial={false}
        >
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            {sidebarOpen && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  LU
                </div>
                <span className="text-white font-bold text-lg">LevelUp</span>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-4">
            {[
              { icon: FiHome, label: 'Dashboard', active: true },
              { icon: FiTrendingUp, label: 'Progress', active: false },
              { icon: FiAward, label: 'Achievements', active: false },
              { icon: FiSettings, label: 'Settings', active: false },
            ].map((item, index) => (
              <motion.button
                key={index}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
                whileHover={{ x: 5 }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </motion.button>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-slate-800">
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              whileHover={{ x: 5 }}
            >
              <FiLogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </motion.button>
          </div>
        </motion.aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 md:hidden z-40"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Main content */}
        <motion.main
          className="flex-1 overflow-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Welcome section */}
            <motion.div
              className="mb-12 space-y-2"
              variants={itemVariants}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-black text-gradient"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Welcome back, {user?.username}!
              </motion.h1>
              <p className="text-gray-400 text-lg">
                Keep grinding, you're on fire! 🔥
              </p>
            </motion.div>

            {/* User level and progress section */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
            >
              {/* Level Card */}
              <motion.div
                className="glass-card-dark p-6 md:p-8 space-y-4 lg:col-span-1"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold uppercase">Current Level</p>
                    <motion.h2
                      className="text-5xl font-black text-gradient mt-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {userStats.level}
                    </motion.h2>
                  </div>
                  <motion.div
                    className="text-6xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    👑
                  </motion.div>
                </div>
              </motion.div>

              {/* XP Progress */}
              <motion.div
                className="glass-card-dark p-6 md:p-8 space-y-4 lg:col-span-2"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm font-semibold uppercase">Experience Progress</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">
                        {userStats.currentXP.toLocaleString()} / {userStats.maxXP.toLocaleString()} XP
                      </span>
                      <span className="text-sm text-purple-400 font-semibold">
                        {Math.round((userStats.currentXP / userStats.maxXP) * 100)}%
                      </span>
                    </div>
                    <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(userStats.currentXP / userStats.maxXP) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
            >
              {/* Streak Card */}
              <motion.div
                className="glass-card-dark p-6 space-y-3 border border-orange-500/20"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center gap-2">
                  <FiFire className="w-5 h-5 text-orange-400" />
                  <p className="text-gray-400 text-sm font-semibold uppercase">Daily Streak</p>
                </div>
                <motion.p
                  className="text-4xl font-black text-orange-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {userStats.streak}
                </motion.p>
                <p className="text-xs text-gray-500">Keep it going!</p>
              </motion.div>

              {/* Tasks Completed */}
              <motion.div
                className="glass-card-dark p-6 space-y-3 border border-green-500/20"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-gray-400 text-sm font-semibold uppercase">Completed</p>
                </div>
                <p className="text-4xl font-black text-green-400">
                  {userStats.tasksCompleted}
                </p>
                <p className="text-xs text-gray-500">All-time achievements</p>
              </motion.div>

              {/* Pending Tasks */}
              <motion.div
                className="glass-card-dark p-6 space-y-3 border border-blue-500/20"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-blue-400" />
                  <p className="text-gray-400 text-sm font-semibold uppercase">Pending</p>
                </div>
                <p className="text-4xl font-black text-blue-400">
                  {userStats.tasksPending}
                </p>
                <p className="text-xs text-gray-500">Tasks waiting</p>
              </motion.div>
            </motion.div>

            {/* Achievements section */}
            <motion.div className="mb-8" variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FiAward className="w-6 h-6 text-yellow-400" />
                Achievement Badges
              </h3>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={containerVariants}
              >
                {userStats.achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`glass-card-dark p-6 text-center space-y-2 cursor-pointer transition-all ${
                      achievement.earned
                        ? 'border border-yellow-500/50'
                        : 'border border-slate-700/50 opacity-50'
                    }`}
                    variants={cardVariants}
                    whileHover={achievement.earned ? "hover" : {}}
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <p className="text-sm font-semibold text-white">{achievement.name}</p>
                    {!achievement.earned && (
                      <p className="text-xs text-gray-500">Locked</p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Recent tasks section */}
            <motion.div className="mb-8" variants={itemVariants}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FiZap className="w-6 h-6 text-purple-400" />
                Today's Quests
              </h3>
              <motion.div
                className="space-y-3"
                variants={containerVariants}
              >
              {tasks.length === 0 ? (
                <p className="text-gray-400">No quests yet. Create one below!</p>
              ) : (
                [...tasks].sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1)).map((task) => (
                  <motion.div
                  key={task._id}
                  onClick={() => handleCompleteTask(task)}
                  className={`glass-card-dark p-4 flex items-center justify-between group hover:border-purple-500/50 transition-all cursor-pointer ${
                    task.isCompleted ? 'border border-green-500/30' : 'border border-slate-700/50'
                    }`}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <motion.div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        task.isCompleted
                            ? 'bg-green-500/20 border-green-500'
                            : 'border-gray-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                      {task.isCompleted && (
                          <motion.span
                            className="text-green-400 font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.div>
                      <div>
                        <p
                          className={`font-semibold ${
                          task.isCompleted
                              ? 'text-gray-400 line-through'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">
                      +{task.type === 'daily' ? 10 : 5} XP
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
              </motion.div>
            </motion.div>

            {/* Call to action */}
            <motion.div
              className="glass-card-dark p-8 text-center space-y-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
              variants={itemVariants}
            >
              <h4 className="text-2xl font-bold text-white">Ready for more challenges?</h4>
              <p className="text-gray-400">
                Create a new task and start earning XP to level up!
              </p>
            <form onSubmit={handleCreateTask} className="flex gap-2 max-w-md mx-auto mt-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter a new habit or task..."
                className="input-field flex-1"
              />
              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </form>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Dashboard;