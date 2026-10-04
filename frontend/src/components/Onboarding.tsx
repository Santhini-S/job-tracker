import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutDashboard, Bell, ArrowRight, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const steps = [
  {
    id: 1,
    title: 'Welcome to JobTracker',
    description: 'Stop using messy spreadsheets. Let\'s get your first job application on the board and organize your career path beautifully.',
    icon: <LayoutDashboard size={40} className="text-emerald-500" />,
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30'
  },
  {
    id: 2,
    title: 'AI-Powered Insights',
    description: 'Paste the job description and your resume. Our AI will give you a match score and instantly tell you what skills you are missing.',
    icon: <Sparkles size={40} className="text-purple-500" />,
    color: 'from-purple-500/20 to-fuchsia-500/20',
    border: 'border-purple-500/30'
  },
  {
    id: 3,
    title: 'Stay on Top',
    description: 'Visualize your progress, track your analytics, and never miss a follow-up with a recruiter again. You got this.',
    icon: <Bell size={40} className="text-rose-500" />,
    color: 'from-rose-500/20 to-orange-500/20',
    border: 'border-rose-500/30'
  }
];

export const Onboarding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#8B5CF6', '#F43F5E']
    });
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="relative bg-white dark:bg-[#111] rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-white/10 font-sans text-center overflow-hidden"
        >
          {/* Background Glow */}
          <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-br ${step.color} blur-[80px] pointer-events-none transition-colors duration-500`} />
          <div className={`absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-tl ${step.color} blur-[80px] pointer-events-none transition-colors duration-500`} />
          
          <button 
            onClick={handleComplete}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full bg-white dark:bg-[#1A1A1A] border-4 ${step.border} flex items-center justify-center mb-6 shadow-xl`}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {step.icon}
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-bold text-[#2C362B] dark:text-white mb-3">{step.title}</h2>
            <p className="text-[#6D776B] dark:text-gray-400 mb-8 leading-relaxed">
              {step.description}
            </p>

            {/* Pagination Dots */}
            <div className="flex gap-2 mb-8">
              {steps.map((s, i) => (
                <div 
                  key={s.id} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-[#2C362B] dark:bg-white' : 'w-2 bg-gray-200 dark:bg-gray-800'}`} 
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="group flex items-center justify-center gap-2 w-full bg-[#2C362B] dark:bg-white text-white dark:text-black py-3.5 rounded-full font-semibold hover:bg-[#1f261e] dark:hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
            >
              {currentStep === steps.length - 1 ? (
                <>Get Started <Check size={18} className="group-hover:scale-110 transition-transform" /></>
              ) : (
                <>Next <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            <button 
              onClick={handleComplete}
              className="mt-4 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
