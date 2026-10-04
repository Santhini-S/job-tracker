import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Job } from '../pages/Dashboard';

interface CalendarViewProps {
  jobs: Job[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ jobs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const statusColors: Record<string, string> = {
    'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Interview': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Offer': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Rejected': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  return (
    <div className="bg-white/40 dark:bg-white/[0.02] rounded-[2rem] border border-rose-900/5 dark:border-white/5 p-6 backdrop-blur-xl shadow-sm w-full font-sans overflow-x-auto min-h-[calc(100vh-240px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2C362B] dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 transition-colors">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 transition-colors">
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="min-w-[800px] flex flex-col flex-1">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="rounded-2xl bg-transparent" />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const jobsOnDay = jobs.filter(j => {
              const date = j.appliedDate || j.createdAt;
              if (!date) return false;
              return date.startsWith(dateStr);
            });

            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <motion.div 
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.01 }}
                className={`rounded-2xl p-2 min-h-[100px] border transition-colors ${
                  isToday 
                    ? 'bg-rose-50 dark:bg-purple-900/20 border-rose-200 dark:border-purple-500/30' 
                    : 'bg-white/60 dark:bg-[#111]/60 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                }`}
              >
                <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-rose-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {jobsOnDay.map(job => (
                    <div 
                      key={job._id} 
                      className={`text-xs px-2 py-1 rounded-md border truncate font-medium cursor-default hover:opacity-80 transition-opacity ${statusColors[job.status] || statusColors['Applied']}`}
                      title={`${job.company} - ${job.position}`}
                    >
                      {job.company}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
