import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Sparkles, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] transition-colors duration-500 font-sans text-gray-900 dark:text-gray-100 overflow-hidden relative selection:bg-rose-200 dark:selection:bg-purple-500/30">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-200/40 dark:bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/40 dark:bg-indigo-900/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-rose-400 to-amber-300 dark:from-purple-500 dark:to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-rose-200 dark:shadow-purple-900/50">
            <Briefcase size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#2C362B] dark:text-white">
            JobTracker<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 dark:from-purple-400 dark:to-indigo-400">.ai</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/login" className="px-6 py-2.5 rounded-full bg-[#2C362B] dark:bg-white text-white dark:text-black font-bold shadow-xl shadow-[#2C362B]/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 dark:bg-purple-900/30 dark:border-purple-800 text-rose-600 dark:text-purple-300 font-semibold text-sm mb-8 shadow-sm"
        >
          <Sparkles size={16} /> AI-Powered Resume Scoring Included
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] text-[#2C362B] dark:text-white mb-8 font-serif"
        >
          Land your dream job <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 dark:from-purple-400 dark:to-indigo-400">
            faster than ever.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-[#6D776B] dark:text-gray-400 max-w-3xl mx-auto mb-12"
        >
          Organize your job search with a beautiful Kanban board, get AI feedback on your resume, and track your interview success all in one place.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2C362B] dark:bg-white text-white dark:text-black font-bold text-lg shadow-xl shadow-[#2C362B]/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
            Start Tracking Now <ArrowRight size={20} />
          </Link>
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 max-w-[1400px] mx-auto px-6 py-24 border-t border-gray-200/50 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <Briefcase size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-serif">Visual Pipeline</h3>
            <p className="text-[#6D776B] dark:text-gray-400 leading-relaxed">
              Drag and drop your applications through beautiful Kanban columns. See your entire job hunt status at a single glance.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-purple-500/10 flex items-center justify-center text-rose-600 dark:text-purple-400 mb-6">
              <Sparkles size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-serif">AI Resume Scoring</h3>
            <p className="text-[#6D776B] dark:text-gray-400 leading-relaxed">
              Paste a job description and your resume. Our AI automatically gives you a match score and actionable feedback to improve.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
              <BarChart2 size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-serif">Advanced Analytics</h3>
            <p className="text-[#6D776B] dark:text-gray-400 leading-relaxed">
              Visualize your application volume, response rates, and interview success metrics over time with interactive charts.
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
