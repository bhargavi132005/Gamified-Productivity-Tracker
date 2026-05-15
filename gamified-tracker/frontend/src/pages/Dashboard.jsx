import { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiHome, FiTrendingUp, FiAward, FiSettings, FiLogOut,
  FiZap, FiCheckCircle, FiClock, FiStar, FiMenu, FiX, FiTrash2,
  FiUser, FiMail, FiLock, FiShield, FiCamera, FiEdit2
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [profileData, setProfileData] = useState({ username: '', email: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const navigate = useNavigate();

  // Dynamic user data with level and XP
  const userStats = {
    level: user?.level || 1,
    currentXP: user?.xp || 0,
    maxXP: (user?.level || 1) * 50,
    streak: user?.streak || 1,
    tasksCompleted: tasks.filter(t => t.isCompleted).length,
    tasksPending: tasks.filter(t => !t.isCompleted).length,
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

  const fetchTasks = useCallback(async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/tasks', config);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      setProfileData({ username: user.username, email: user.email, avatar: user.avatar || '' });
    }
  }, [user, fetchTasks]);

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
    const newStatus = !task.isCompleted;

    // Optimistic UI update instantly
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, isCompleted: newStatus } : t));

    try {
      // Optimistic global XP update for instant aesthetic feedback!
      if (newStatus) {
        // Fire confetti on completion!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b']
        });

        const xpToAdd = task.type === 'daily' ? 10 : 5;
        
        let newXp = (user?.xp || 0) + xpToAdd;
        let newLevel = user?.level || 1;
        const maxXP = newLevel * 50;
        if (newXp >= maxXP) {
          newLevel += 1;
          newXp -= maxXP;
        }
        // Update user in global context
        updateUser({ xp: newXp, level: newLevel });
      } else {
        // Subtract XP if unchecked
        const xpToRemove = task.type === 'daily' ? 10 : 5;
        let newXp = (user?.xp || 0) - xpToRemove;
        let newLevel = user?.level || 1;
        if (newXp < 0) {
          if (newLevel > 1) {
            newLevel -= 1;
            newXp += newLevel * 50;
          } else {
            newXp = 0;
          }
        }
        updateUser({ xp: newXp, level: newLevel });
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, {
        isCompleted: newStatus
      }, config);
    } catch (error) {
      console.error('Error updating task', error);
      fetchTasks(); // Revert on failure
    }
  };

  const startEditing = (task, e) => {
    e.stopPropagation();
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
  };

  const cancelEditing = (e) => {
    e?.stopPropagation();
    setEditingTaskId(null);
    setEditTaskTitle('');
  };

  const saveEdit = async (task, e) => {
    e?.stopPropagation();
    if (!editTaskTitle.trim() || editTaskTitle === task.title) {
      setEditingTaskId(null);
      return;
    }
    const updatedTitle = editTaskTitle.trim();
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, title: updatedTitle } : t));
    setEditingTaskId(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`, { title: updatedTitle }, config);
    } catch (error) {
      console.error('Error updating task title', error);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation(); // prevent triggering complete task toggle
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, config);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', profileData, config);
      updateUser(data);
      setSettingsMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setSettingsMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return setSettingsMessage({ type: 'error', text: 'Please fill in all password fields' });
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/auth/profile', {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      }, config);
      setPasswordData({ currentPassword: '', newPassword: '' });
      setSettingsMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (error) {
      setSettingsMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    }
  };

  const pendingQuests = tasks.filter(t => !t.isCompleted);
  const completedQuests = tasks.filter(t => t.isCompleted);

  // Calculate chart data from actual tasks (last 7 days)
  const chartData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateString = d.toISOString().split('T')[0];
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateString,
      completed: 0,
      added: 0
    };
  });

  tasks.forEach(task => {
    const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
    const updatedDate = new Date(task.updatedAt).toISOString().split('T')[0];
    const addedDay = chartData.find(d => d.date === createdDate);
    if (addedDay) addedDay.added += 1;
    if (task.isCompleted) {
      const completedDay = chartData.find(d => d.date === updatedDate);
      if (completedDay) completedDay.completed += 1;
    }
  });

  const badges = [
    { id: 1, name: 'First Blood', description: 'Conquer 1 quest', icon: '🩸', isUnlocked: userStats.tasksCompleted >= 1 },
    { id: 2, name: 'Consistency', description: '3-day streak', icon: '🔥', isUnlocked: userStats.streak >= 3 },
    { id: 3, name: 'Novice', description: 'Reach Level 5', icon: '🎒', isUnlocked: userStats.level >= 5 },
    { id: 4, name: 'Quest Master', description: 'Conquer 10 quests', icon: '🗡️', isUnlocked: userStats.tasksCompleted >= 10 },
    { id: 5, name: 'XP Hoarder', description: 'Earn 500 XP', icon: '💎', isUnlocked: userStats.currentXP >= 500 },
    { id: 6, name: 'Legendary', description: 'Reach Level 10', icon: '👑', isUnlocked: userStats.level >= 10 },
  ];

  const renderTaskCard = (task) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      key={task._id}
      onClick={() => handleCompleteTask(task)}
      className={`glass-card-dark p-4 flex items-center justify-between group transition-all cursor-pointer ${
        task.isCompleted ? 'border border-green-500/30 bg-green-900/10' : 'border border-slate-700/50 hover:border-purple-500/50'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <motion.div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.isCompleted
              ? 'bg-green-500/20 border-green-500'
              : 'border-gray-600 group-hover:border-purple-400'
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
          {editingTaskId === task._id ? (
            <input
              type="text"
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(task, e);
                if (e.key === 'Escape') cancelEditing(e);
              }}
              onBlur={(e) => saveEdit(task, e)}
              autoFocus
              className="bg-slate-800 text-white px-3 py-1 rounded-lg border border-purple-500 focus:outline-none w-full"
            />
          ) : (
            <p
              className={`font-semibold transition-all ${
              task.isCompleted
                  ? 'text-gray-500 line-through'
                  : 'text-white'
              }`}
            >
              {task.title}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <FiStar className={`w-4 h-4 ${task.isCompleted ? 'text-gray-600' : 'text-yellow-400'}`} />
          <span className={`text-sm font-semibold ${task.isCompleted ? 'text-gray-600' : 'text-yellow-400'}`}>
            +{task.type === 'daily' ? 10 : 5} XP
          </span>
        </div>
        {editingTaskId !== task._id && (
          <>
            <button
              onClick={(e) => startEditing(task, e)}
              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
              title="Edit Quest"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDeleteTask(task._id, e)}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Quest"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );

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
              { icon: FiSettings, label: 'Settings', active: false },
            ].map((item, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.label
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
            {activeTab === 'Dashboard' && (
              <>
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
                  <FaFire className="w-5 h-5 text-orange-400" />
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

            {/* Layout for Quests and Call to Action */}
            <div className="space-y-8 mb-8">
                {/* Call to action */}
                <motion.div
                  className="glass-card-dark p-5 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20"
                  variants={itemVariants}
                >
                  <p className="text-purple-300/80 text-sm font-semibold mb-3 flex items-center gap-2">
                    <FiZap className="w-4 h-4" />
                    Create a new task and start earning XP to level up!
                  </p>
                  <form onSubmit={handleCreateTask} className="flex gap-3">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter a new habit or task..."
                      className="input-field flex-1"
                    />
                    <motion.button
                      type="submit"
                      className="btn-primary px-6"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add
                    </motion.button>
                  </form>
                </motion.div>

                {/* Active tasks section */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <FiClock className="w-6 h-6 text-blue-400" />
                    Active Quests
                  </h3>
                  <motion.div
                    className="space-y-3"
                    variants={containerVariants}
                  >
                  {pendingQuests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 border border-dashed border-slate-700 rounded-xl bg-slate-800/30"
                    >
                      <div className="text-4xl mb-3">🎯</div>
                      <p className="text-gray-400 font-medium">No active quests.</p>
                      <p className="text-sm text-gray-500 mt-1">Time to forge your destiny!</p>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {pendingQuests.map(renderTaskCard)}
                    </AnimatePresence>
                  )}
                  </motion.div>
                </motion.div>

                {/* Completed tasks section */}
                {completedQuests.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-2xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                      <FiCheckCircle className="w-6 h-6 text-green-500" />
                      Completed Quests
                    </h3>
                    <motion.div className="space-y-3" variants={containerVariants}>
                      <AnimatePresence>
                        {completedQuests.map(renderTaskCard)}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
            </div>
            </>
            )}

            {/* Placeholders for other tabs */}
            {activeTab === 'Progress' && (
              <motion.div variants={containerVariants} className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <FiTrendingUp className="w-8 h-8 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">Your Progress Analytics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Achievement Vault */}
                  <motion.div variants={itemVariants} className="glass-card-dark p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-400 mb-6 uppercase flex items-center gap-2">
                      <FiAward className="text-yellow-400" /> Achievement Vault
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {badges.map(badge => (
                        <div key={badge.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${badge.isUnlocked ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-800/30 border-slate-700/50 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 cursor-help'}`}>
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <p className={`text-sm font-bold ${badge.isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>{badge.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                          {!badge.isUnlocked && <div className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1"><FiLock /> Locked</div>}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Activity Chart */}
                  <motion.div variants={itemVariants} className="glass-card-dark p-6 md:col-span-2 h-80">
                    <h3 className="text-lg font-semibold text-gray-400 mb-6 uppercase flex items-center gap-2">
                      <FiTrendingUp className="text-blue-400" /> 7-Day Quest Activity
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                          itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Area type="monotone" dataKey="completed" name="Quests Conquered" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                        <Area type="monotone" dataKey="added" name="Quests Added" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAdded)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Overview Card */}
                  <motion.div variants={itemVariants} className="glass-card-dark p-6">
                    <h3 className="text-lg font-semibold text-gray-400 mb-4 uppercase">Overall Completion</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-5xl font-black text-blue-400">
                        {tasks.length > 0 ? Math.round((userStats.tasksCompleted / tasks.length) * 100) : 0}%
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Total Quests</p>
                        <p className="text-2xl font-bold text-white">{tasks.length}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${tasks.length > 0 ? (userStats.tasksCompleted / tasks.length) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </motion.div>

                  {/* XP Card */}
                  <motion.div variants={itemVariants} className="glass-card-dark p-6">
                    <h3 className="text-lg font-semibold text-gray-400 mb-4 uppercase">Experience Journey</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <span className="text-gray-400">Current Level</span>
                        <span className="text-white font-bold text-xl">{userStats.level}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <span className="text-gray-400">Current XP</span>
                        <span className="text-purple-400 font-bold text-xl">{userStats.currentXP}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <span className="text-gray-400">XP to Next Level</span>
                        <span className="text-green-400 font-bold text-xl">{userStats.maxXP - userStats.currentXP} XP</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Task Breakdown */}
                  <motion.div variants={itemVariants} className="glass-card-dark p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-400 mb-4 uppercase">Quest Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <FiCheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-white">{userStats.tasksCompleted}</p>
                        <p className="text-sm text-gray-400 mt-1">Conquered</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <FiClock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-white">{userStats.tasksPending}</p>
                        <p className="text-sm text-gray-400 mt-1">Active</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
            {activeTab === 'Settings' && (
              <motion.div variants={containerVariants} className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <FiSettings className="w-8 h-8 text-gray-400" />
                  <h2 className="text-3xl font-bold text-white">Account Settings</h2>
                </div>

                {settingsMessage.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm font-semibold border ${settingsMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                  >
                    {settingsMessage.text}
                  </motion.div>
                )}

                {/* Profile Section */}
                <motion.div variants={itemVariants} className="glass-card-dark p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FiUser className="text-purple-400" /> Edit Profile
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                      <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      <label htmlFor="avatarUpload" className="relative group cursor-pointer block">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-slate-800 shadow-xl">
                          {profileData.avatar ? (
                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user?.username?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <FiCamera className="w-8 h-8 text-white" />
                        </div>
                      </label>
                      <label htmlFor="avatarUpload" className="text-sm text-purple-400 font-semibold hover:text-purple-300 transition-colors cursor-pointer">
                        Change Avatar
                      </label>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase">Username</label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} className="input-field pl-12 w-full bg-slate-900/50 border-slate-700" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase">Email</label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="input-field pl-12 w-full bg-slate-900/50 border-slate-700" />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary mt-4 py-2 px-6">Save Changes</button>
                    </form>
                  </div>
                </motion.div>

                {/* Security Section */}
                <motion.div variants={itemVariants} className="glass-card-dark p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FiShield className="text-blue-400" /> Security & Password
                  </h3>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-400 uppercase">Current Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="password" placeholder="••••••••" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="input-field pl-12 w-full bg-slate-900/50 border-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-400 uppercase">New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="password" placeholder="••••••••" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="input-field pl-12 w-full bg-slate-900/50 border-slate-700" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary mt-4 py-2 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">Update Password</button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Dashboard;