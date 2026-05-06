import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <motion.nav
      className="glass-card-dark border-b border-slate-700 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
              <FiZap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gradient">LevelUp</span>
          </Link>
        </motion.div>

        {user && (
          <motion.div
            className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-full border border-slate-700 hover:border-purple-500/50 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xs font-semibold text-gray-400 uppercase">Level</span>
            <span className="text-lg font-black text-gradient">{user.level}</span>
            <div className="w-px h-4 bg-slate-600 mx-2" />
            <span className="text-xs font-semibold text-gray-400 uppercase">XP</span>
            <span className="text-lg font-bold text-yellow-400">{user.xp}</span>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;