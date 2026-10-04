import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

import type { Job } from '../pages/Dashboard';

interface StreakBannerProps {
  jobs: Job[];
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ jobs }) => {
  const streak = useMemo(() => {
    if (!jobs || jobs.length === 0) return 0;
    
    // Get unique dates
    const dates = jobs
      .map(j => (j.appliedDate || j.createdAt)?.split('T')[0])
      .filter(Boolean) as string[];
      
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (uniqueDates.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent application was today or yesterday
    const mostRecent = new Date(uniqueDates[0]);
    mostRecent.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - mostRecent.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0; // Streak broken

    let expectedDate = mostRecent;
    for (const dateStr of uniqueDates) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      
      if (date.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate = new Date(expectedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    return currentStreak;
  }, [jobs]);

  if (streak < 2) return null; // Only show for streaks of 2 or more

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-500/20 mb-6"
    >
      <div className="bg-white/20 p-1.5 rounded-full">
        <Flame size={18} className="text-white" />
      </div>
      <div>
        <p className="font-bold text-sm">You're on fire! 🔥</p>
        <p className="text-xs text-orange-50 font-medium">You've applied to jobs {streak} days in a row. Keep the momentum going!</p>
      </div>
    </motion.div>
  );
};
