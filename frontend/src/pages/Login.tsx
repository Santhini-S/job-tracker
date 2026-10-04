import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Briefcase, ArrowLeft, Flower2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name };
      
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] dark:bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-rose-200 transition-colors duration-500">
      
      {/* Background Floral Accents */}
      <div className="absolute top-[-10%] right-[-10%] text-rose-100 dark:text-purple-900/30 opacity-60 rotate-45 pointer-events-none">
        <Flower2 size={500} strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-[-10%] left-[-10%] text-emerald-100 dark:text-indigo-900/30 opacity-50 -rotate-12 pointer-events-none">
        <Flower2 size={400} strokeWidth={0.5} />
      </div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#6D776B] dark:text-gray-400 hover:text-[#2C362B] dark:hover:text-white transition-colors font-medium z-10">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 p-10 bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-rose-900/5 dark:shadow-none border border-rose-900/10 dark:border-white/5 relative z-10"
      >
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-tr from-rose-400 to-amber-300 dark:from-purple-500 dark:to-indigo-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-200 dark:shadow-purple-900/50 mb-6">
            <Briefcase size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-center text-3xl font-black text-[#2C362B] dark:text-white font-serif">
            {isLogin ? 'Welcome back' : 'Join JobTracker.ai'}
          </h2>
          <p className="mt-2 text-center text-sm text-[#6D776B] dark:text-gray-400">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start tracking your applications.'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-rose-600 dark:text-red-400 text-sm font-semibold text-center bg-rose-50 dark:bg-red-900/20 border border-rose-100 dark:border-red-900/50 p-3 rounded-xl">
              {error}
            </motion.div>
          )}
          
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-3.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-3.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-base font-bold text-white bg-[#2C362B] dark:bg-white dark:text-black hover:bg-[#1f261e] dark:hover:bg-gray-200 rounded-2xl transition-all shadow-xl shadow-[#2C362B]/20 dark:shadow-white/10 active:scale-95 flex justify-center items-center"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
