import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/20 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Glowing border effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Card */}
        <motion.div
          className="glass-card-dark p-8 md:p-10 space-y-6 relative z-10"
          variants={itemVariants}
        >
          {/* Header */}
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <motion.div
              className="inline-block text-4xl mb-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚀
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gradient">
              Start Your Journey
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Create your hero and begin your quest to become legendary!
            </p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username input */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-300">
                Gamer Tag
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="Choose your hero name"
                  className="input-field pl-12"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Email input */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="input-field pl-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password input */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field pl-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Creating Account...' : 'Start Your Quest'}
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div className="flex items-center gap-4" variants={itemVariants}>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent flex-1" />
            <span className="text-gray-500 text-xs">OR</span>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent flex-1" />
          </motion.div>

          {/* Login link */}
          <motion.p className="text-center text-gray-400 text-sm" variants={itemVariants}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline"
            >
              Resume Your Quest
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;