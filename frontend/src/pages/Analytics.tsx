import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityCalendar } from 'react-activity-calendar';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jobs';

const Analytics: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(API_URL);
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  const statusCount = {
    Applied: jobs.filter(j => j.status === 'Applied').length,
    Interview: jobs.filter(j => j.status === 'Interview').length,
    Offer: jobs.filter(j => j.status === 'Offer').length,
    Rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  const pieData = [
    { name: 'Applied', value: statusCount.Applied, color: '#3b82f6' },
    { name: 'Interviewing', value: statusCount.Interview, color: '#f59e0b' },
    { name: 'Offers', value: statusCount.Offer, color: '#10b981' },
    { name: 'Rejected', value: statusCount.Rejected, color: '#f43f5e' },
  ];

  const barData = [
    { name: 'Applied', count: statusCount.Applied },
    { name: 'Interviewing', count: statusCount.Interview },
    { name: 'Offers', count: statusCount.Offer },
    { name: 'Rejected', count: statusCount.Rejected },
  ];

  // Prepare Activity Calendar Data
  const calendarData = useMemo(() => {
    // Generate empty data for the last 6 months to ensure the graph looks full
    const dataMap = new Map<string, { date: string; count: number; level: number }>();
    const today = new Date();
    
    // Fill last 180 days with 0
    for (let i = 180; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dataMap.set(dateStr, { date: dateStr, count: 0, level: 0 });
    }

    // Populate actual counts
    jobs.forEach(job => {
      const dateStr = new Date(job.appliedDate || job.createdAt).toISOString().split('T')[0];
      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        current.count += 1;
        // Determine level (1-4)
        if (current.count >= 4) current.level = 4;
        else if (current.count >= 3) current.level = 3;
        else if (current.count >= 2) current.level = 2;
        else current.level = 1;
        
        dataMap.set(dateStr, current);
      }
    });

    return Array.from(dataMap.values());
  }, [jobs]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 font-sans">
      <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-purple-500/20">
                  <Briefcase size={20} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                  Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Application Insights</h1>
        
        {/* Activity Heatmap */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl w-full overflow-x-auto">
          <h2 className="text-lg font-bold mb-6 text-gray-700 dark:text-gray-300">Application Activity</h2>
          <div className="min-w-[800px] flex justify-center py-4">
            <ActivityCalendar 
              data={calendarData} 
              theme={{
                light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              colorScheme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              labels={{
                totalCount: `{{count}} applications submitted in the last half year`,
              }}
              blockSize={14}
              blockRadius={4}
              blockMargin={4}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-6 text-gray-700 dark:text-gray-300">Conversion Funnel</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-6 text-gray-700 dark:text-gray-300">Application Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 flex-wrap">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
