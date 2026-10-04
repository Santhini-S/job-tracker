import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Briefcase, MapPin, DollarSign, MoreVertical, Sparkles, BarChart2, Flower2, Sun, Moon, Inbox, Calendar, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import axios from 'axios';

import { Onboarding } from '../components/Onboarding';
import { CalendarView } from '../components/CalendarView';
import { StreakBanner } from '../components/StreakBanner';

export interface Job {
  _id: string;
  company: string;
  position: string;
  status: string;
  location?: string;
  salary?: string;
  priority?: 'Dream Job' | 'Backup' | 'On a whim';
  resumeScore?: number;
  aiFeedback?: string;
  appliedDate?: string;
  createdAt?: string;
}

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 10;
  const stroke = 2.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle stroke="currentColor" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} className="text-gray-200 dark:text-gray-800" />
      <circle stroke="currentColor" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} className="text-emerald-500 transition-all duration-1000 ease-out" />
    </svg>
  );
};

const API_URL = 'http://localhost:5000/api/jobs';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { width, height } = useWindowSize();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ company: '', position: '', location: '', salary: '', status: 'Applied', jobDescription: '', priority: 'Backup' });
  const [scoringJobId, setScoringJobId] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
  
  const defaultColumns = [
    { id: 'Applied', title: 'Applied', color: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20', badge: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20' },
    { id: 'Interview', title: 'Interviewing', color: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', badge: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20' },
    { id: 'Offer', title: 'Offers', color: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20', badge: 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20' },
    { id: 'Rejected', title: 'Rejected', color: 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10', badge: 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-white/10' },
  ];
  
  const [columns, setColumns] = useState<{ id: string; title: string; color: string; badge: string }[]>(() => {
    const saved = localStorage.getItem('boardColumns');
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem('boardColumns', JSON.stringify(columns));
  }, [columns]);
  
  const [editingJob, setEditingJob] = useState<{ id: string, field: 'company' | 'position' | 'col-title' } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.getElementsByClassName('glow-card');
    for (const card of Array.from(cards)) {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Setup Socket.io for Real-time Notifications
    const socket = io('http://localhost:5000');
    
    socket.on('job-added', (job: Job) => {
      setJobs(prev => {
        if (prev.find(j => j._id === job._id)) return prev;
        return [job, ...prev];
      });
    });

    socket.on('job-updated', (updatedJob: Job) => {
      setJobs(prev => prev.map(job => job._id === updatedJob._id ? updatedJob : job));
    });

    socket.on('job-deleted', (id: string) => {
      setJobs(prev => prev.filter(job => job._id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newJob);
      setIsModalOpen(false);
      setNewJob({ company: '', position: '', location: '', salary: '', status: 'Applied', jobDescription: '', priority: 'Backup' });
      toast.success('Application added successfully!');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add application');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    // Optimistic Update
    const updatedJobs = Array.from(jobs);
    const jobIndex = updatedJobs.findIndex(j => j._id === draggableId);
    
    if (jobIndex > -1) {
      const newStatus = destination.droppableId as Job['status'];
      updatedJobs[jobIndex].status = newStatus;
      setJobs(updatedJobs);
      
      if (newStatus === 'Offer') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000);
      }

      try {
        await axios.patch(`${API_URL}/${draggableId}`, { status: newStatus });
        // The server will emit 'job-updated', which will sync other clients.
      } catch (error) {
        console.error('Error updating job status:', error);
        fetchJobs(); // Revert on error
      }
    }
  };

  const handleEditSubmit = async (jobId: string, field: string) => {
    if (!editValue.trim()) {
      setEditingJob(null);
      return;
    }
    
    // Optimistic update
    const updatedJobs = Array.from(jobs);
    const jobIndex = updatedJobs.findIndex(j => j._id === jobId);
    if (jobIndex > -1) {
      updatedJobs[jobIndex] = { ...updatedJobs[jobIndex], [field]: editValue };
      setJobs(updatedJobs);
    }
    
    setEditingJob(null);
    
    try {
      await axios.patch(`${API_URL}/${jobId}`, { [field]: editValue });
      toast.success('Updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update');
      fetchJobs(); // Revert on failure
    }
  };

  const handleEditColumn = (colId: string) => {
    if (!editValue.trim()) {
      setEditingJob(null);
      return;
    }
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, title: editValue, id: editValue } : c));
    setJobs(prev => prev.map(j => j.status === colId ? { ...j, status: editValue } : j));
    setEditingJob(null);
    toast.success('Column updated!');
  };

  const handleAddColumn = () => {
    const newId = `Stage ${columns.length + 1}`;
    setColumns([...columns, { 
      id: newId, 
      title: newId, 
      color: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20', 
      badge: 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20' 
    }]);
    toast.success('New column added!');
  };

  const handleScoreResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringJobId) return;
    setIsScoring(true);
    try {
      await axios.post(`${API_URL}/${scoringJobId}/score`, { resume: resumeText });
      setScoringJobId(null);
      setResumeText('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to score resume. Did you add a Job Description?');
    } finally {
      setIsScoring(false);
    }
  };

  const getProgress = (status: string) => {
    if (status === 'Applied') return 25;
    if (status === 'Interview') return 60;
    if (status === 'Offer') return 100;
    return 0;
  };

  const priorityStyles: Record<string, string> = {
    'Dream Job': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    'Backup': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    'On a whim': 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 border-gray-200 dark:border-white/10'
  };

  return (
    <div onMouseMove={handleMouseMove} className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] transition-colors duration-500 relative overflow-hidden font-serif selection:bg-rose-200 dark:selection:bg-purple-500/30">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      {/* Floral Background Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 text-rose-100 dark:text-purple-900/20 opacity-60 rotate-45 pointer-events-none">
        <Flower2 size={400} strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 text-emerald-100 dark:text-indigo-900/20 opacity-50 -rotate-12 pointer-events-none">
        <Flower2 size={300} strokeWidth={0.5} />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl border-b border-rose-900/5 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-rose-400 to-amber-300 dark:from-purple-500 dark:to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-rose-200 dark:shadow-purple-900/50">
                <Briefcase size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-2xl text-[#2C362B] dark:text-white tracking-tight">
                JobTracker<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 dark:from-purple-400 dark:to-indigo-400">.ai</span>
              </span>
            </div>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => setIsDark(!isDark)}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-sm"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/analytics" className="hidden sm:flex items-center gap-2 text-sm font-sans font-medium text-rose-600 dark:text-purple-400 hover:text-rose-700 dark:hover:text-purple-300 bg-rose-50 dark:bg-purple-900/30 border border-rose-100 dark:border-purple-800 px-4 py-2.5 rounded-full transition-all shadow-sm">
                <BarChart2 size={16} /> Analytics
              </Link>
              <Link to="/profile" className="hidden sm:flex items-center gap-2.5 px-2 py-1 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 transition-colors shadow-sm cursor-pointer">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${localStorage.getItem('avatarGradient') || 'from-rose-200 to-amber-100 dark:from-rose-500 dark:to-orange-400'} flex items-center justify-center text-sm font-bold text-rose-900 dark:text-white shadow-inner`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-sans font-medium text-gray-700 dark:text-gray-300 pr-3">{user?.name}</span>
              </Link>
              <button onClick={logout} className="text-sm font-sans font-medium text-gray-400 hover:text-rose-600 dark:hover:text-white transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <Onboarding />
        <StreakBanner jobs={jobs} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#2C362B] dark:text-white mb-2">Your Applications</h1>
            <p className="text-[#6D776B] dark:text-gray-400 text-lg font-sans">Cultivate your career path.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-white/60 dark:bg-[#111]/60 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/10 p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('board')}
                className={`p-2.5 rounded-full transition-all ${viewMode === 'board' ? 'bg-[#2C362B] dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
                title="Board View"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2.5 rounded-full transition-all ${viewMode === 'calendar' ? 'bg-[#2C362B] dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
                title="Calendar View"
              >
                <Calendar size={18} />
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Search by company or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#111]/60 backdrop-blur-md outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-purple-500 text-sm w-full sm:w-64 transition-all shadow-sm"
            />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-[#2C362B] dark:bg-white hover:bg-[#1f261e] dark:hover:bg-gray-200 text-white dark:text-black px-7 py-3.5 rounded-full font-sans font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Application
            </button>
          </div>
        </div>
        
        {viewMode === 'calendar' ? (
          <CalendarView jobs={jobs} />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto gap-6 h-[calc(100vh-240px)] font-sans pb-4 snap-x snap-mandatory hide-scrollbar">
            {columns.map((col) => {
              const filteredJobs = jobs.filter(j => 
                j.status === col.id && 
                (j.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 j.position.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              return (
              <div key={col.id} className="flex-none w-[85vw] sm:w-[320px] lg:w-[350px] flex flex-col h-full bg-white/40 dark:bg-white/[0.02] rounded-[2rem] border border-rose-900/5 dark:border-white/5 p-4 backdrop-blur-xl shadow-sm snap-center">
                <div className="flex justify-between items-center mb-5 px-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${col.color}`}>
                    <div className={`w-2 h-2 rounded-full ${col.badge.split(' ')[1]}`}></div>
                    {editingJob?.id === col.id && editingJob?.field === 'col-title' ? (
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleEditColumn(col.id)}
                        onKeyDown={e => e.key === 'Enter' && handleEditColumn(col.id)}
                        className="font-semibold text-sm text-[#2C362B] dark:text-gray-200 bg-transparent outline-none w-24 border-b border-rose-400"
                      />
                    ) : (
                      <span 
                        className="font-semibold text-sm text-[#2C362B] dark:text-gray-200 cursor-text hover:text-rose-500 transition-colors"
                        onClick={() => { setEditingJob({ id: col.id, field: 'col-title' }); setEditValue(col.title); }}
                      >
                        {col.title}
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${col.badge}`}>
                    {isLoading ? '-' : filteredJobs.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="space-y-4 p-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white/50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100/50 dark:border-white/5 animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-4 p-2 transition-all duration-300 rounded-2xl ${snapshot.isDraggingOver ? 'bg-rose-50/80 dark:bg-purple-900/10 ring-2 ring-inset ring-rose-300 dark:ring-purple-500/30 ring-dashed shadow-inner' : ''} [&::-webkit-scrollbar]:hidden`}
                      >
                        <AnimatePresence>
                          {filteredJobs.length === 0 && !snapshot.isDraggingOver && (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              exit={{ opacity: 0 }}
                              className="h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2"
                            >
                              <Inbox size={24} />
                              <span className="text-sm font-medium">No applications</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {filteredJobs.map((job, index) => (
                          <Draggable key={job._id} draggableId={job._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={`glow-card relative rounded-2xl transition-all duration-200 group ${
                                  snapshot.isDragging ? 'rotate-3 scale-105 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] z-50 cursor-grabbing' : 'shadow-md hover:shadow-lg cursor-grab'
                                }`}
                              >
                                {/* Glow effect layer */}
                                <div 
                                  className="absolute inset-0 rounded-2xl pointer-events-none z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                  style={{
                                    background: 'radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(59, 130, 246, 0.1), transparent 40%)',
                                  }}
                                />
                                {/* Border glow layer */}
                                <div 
                                  className="absolute -inset-[1px] rounded-2xl pointer-events-none z-0 opacity-0 group-hover:opacity-100"
                                  style={{
                                    background: 'radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(59, 130, 246, 0.8), transparent 40%)',
                                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    padding: '1px'
                                  }}
                                />
                                
                                {/* Inner Card Content */}
                                <div className={`relative z-10 bg-white dark:bg-[#141414] rounded-2xl p-5 border border-gray-100 dark:border-white/10 h-full transition-colors ${snapshot.isDragging ? 'border-rose-400 dark:border-purple-500 ring-4 ring-rose-500/20 dark:ring-purple-500/20 backdrop-blur-md bg-white/90 dark:bg-[#141414]/90' : 'group-hover:border-transparent dark:group-hover:bg-[#1A1A1A]'}`}>
                                  <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2 max-w-[85%]">
                                    {editingJob?.id === job._id && editingJob?.field === 'position' ? (
                                      <input 
                                        autoFocus
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onBlur={() => handleEditSubmit(job._id, 'position')}
                                        onKeyDown={e => e.key === 'Enter' && handleEditSubmit(job._id, 'position')}
                                        className="font-bold text-[#2C362B] dark:text-gray-100 text-lg leading-tight font-serif bg-transparent border-b border-rose-400 outline-none w-full"
                                      />
                                    ) : (
                                      <h3 
                                        className="font-bold text-[#2C362B] dark:text-gray-100 text-lg leading-tight truncate font-serif cursor-text hover:text-rose-500 transition-colors"
                                        onClick={() => { setEditingJob({ id: job._id, field: 'position' }); setEditValue(job.position); }}
                                      >
                                        {job.position}
                                      </h3>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ProgressRing progress={getProgress(job.status)} />
                                    <button className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500 dark:hover:text-white">
                                      <MoreVertical size={16} />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-transparent flex items-center justify-center overflow-hidden relative shadow-sm">
                                      <img src={`https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`} className="w-full h-full object-cover z-10" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white z-0" style={{ display: 'none' }}>
                                        {job.company.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    {editingJob?.id === job._id && editingJob?.field === 'company' ? (
                                      <input 
                                        autoFocus
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onBlur={() => handleEditSubmit(job._id, 'company')}
                                        onKeyDown={e => e.key === 'Enter' && handleEditSubmit(job._id, 'company')}
                                        className="bg-transparent border-b border-rose-400 outline-none w-full"
                                      />
                                    ) : (
                                      <span 
                                        className="cursor-text hover:text-rose-500 transition-colors"
                                        onClick={() => { setEditingJob({ id: job._id, field: 'company' }); setEditValue(job.company); }}
                                      >
                                        {job.company}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {job.priority && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyles[job.priority] || priorityStyles['Backup']}`}>
                                      {job.priority}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {job.location && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#6D776B] dark:text-gray-300 bg-emerald-50/50 dark:bg-white/5 border border-emerald-100 dark:border-white/10 px-2.5 py-1.5 rounded-lg">
                                      <MapPin size={12} className="text-emerald-600 dark:text-gray-500" /> {job.location}
                                    </div>
                                  )}
                                  {job.salary && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#6D776B] dark:text-gray-300 bg-emerald-50/50 dark:bg-white/5 border border-emerald-100 dark:border-white/10 px-2.5 py-1.5 rounded-lg">
                                      <DollarSign size={12} className="text-emerald-600 dark:text-gray-500" /> {job.salary}
                                    </div>
                                  )}
                                </div>

                                {job.resumeScore !== undefined ? (
                                  <div 
                                    className="mt-2 pt-4 border-t border-gray-50 dark:border-white/5 flex flex-col gap-3 cursor-pointer group/score hover:bg-rose-50/30 dark:hover:bg-white/5 -mx-5 -mb-5 px-5 pb-5 rounded-b-2xl transition-colors"
                                    onClick={() => setScoringJobId(job._id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-purple-400 group-hover/score:text-rose-600 dark:group-hover/score:text-purple-300 transition-colors">
                                        <Sparkles size={14} /> AI Match Score
                                      </div>
                                      <span className="text-sm font-black text-[#2C362B] dark:text-white">{job.resumeScore}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-black/50 rounded-full overflow-hidden border border-gray-200/50 dark:border-white/5">
                                      <div 
                                        className="h-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 dark:from-purple-500 dark:via-indigo-500 dark:to-blue-500 shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        style={{ width: `${job.resumeScore}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 pt-4 border-t border-gray-50 dark:border-white/5">
                                    <button 
                                      onClick={() => setScoringJobId(job._id)}
                                      className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-purple-400 bg-rose-50 dark:bg-purple-500/10 hover:bg-rose-100 dark:hover:bg-purple-500/20 border border-rose-100 dark:border-purple-500/20 rounded-xl transition-colors"
                                    >
                                      <Sparkles size={14} /> Get AI Match Score
                                    </button>
                                  </div>
                                )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            ); })}
            
            {/* Add Column Button */}
            <div 
              onClick={handleAddColumn}
              className="flex-none w-[85vw] sm:w-[320px] lg:w-[350px] flex flex-col h-full bg-white/20 dark:bg-white/[0.01] rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 p-4 backdrop-blur-xl shadow-sm items-center justify-center cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 transition-colors group snap-center"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-gray-500 dark:text-gray-400" />
              </div>
              <span className="font-semibold text-gray-500 dark:text-gray-400">Add Stage</span>
            </div>
            
          </div>
        </DragDropContext>
        )}
      </main>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-white/40 dark:bg-black/60 backdrop-blur-md transition-opacity">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] font-sans">
            <div className="px-8 py-8 border-b border-gray-50 dark:border-white/5 bg-gradient-to-r from-emerald-50/50 to-rose-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden">
              <Flower2 size={120} className="absolute -top-10 -right-10 text-rose-100 dark:text-purple-500/10 opacity-50 rotate-12" />
              <h2 className="text-3xl font-bold text-[#2C362B] dark:text-white tracking-tight relative z-10 font-serif">
                New Application
              </h2>
              <p className="text-[#6D776B] dark:text-gray-400 mt-2 text-sm relative z-10">
                Plant a new seed in your career pipeline.
              </p>
            </div>
            
            <form onSubmit={handleAddJob} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 [&::-webkit-scrollbar]:hidden relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Company Name <span className="text-rose-500">*</span></label>
                  <input required type="text" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600" placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Role / Position <span className="text-rose-500">*</span></label>
                  <input required type="text" value={newJob.position} onChange={e => setNewJob({...newJob, position: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600" placeholder="e.g. Senior Frontend Engineer" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Status</label>
                  <select 
                    value={newJob.status} 
                    onChange={e => setNewJob({...newJob, status: e.target.value})} 
                    className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Applied">🚀 Applied</option>
                    <option value="Interview">🗣️ Interviewing</option>
                    <option value="Offer">🎉 Offer</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Priority</label>
                  <select 
                    value={newJob.priority} 
                    onChange={e => setNewJob({...newJob, priority: e.target.value as any})} 
                    className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Dream Job">⭐ Dream Job</option>
                    <option value="Backup">✓ Backup</option>
                    <option value="On a whim">🤔 On a whim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Location</label>
                  <input type="text" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600" placeholder="e.g. Remote, NY" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Salary</label>
                  <input type="text" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600" placeholder="e.g. $120k - $140k" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2 flex items-center justify-between">
                  Job Description 
                  <span className="text-xs bg-rose-50 dark:bg-purple-900/30 text-rose-600 dark:text-purple-300 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border border-rose-100 dark:border-purple-800">
                    <Sparkles size={12} /> Used for AI Scoring
                  </span>
                </label>
                <textarea 
                  value={newJob.jobDescription} 
                  onChange={e => setNewJob({...newJob, jobDescription: e.target.value})} 
                  className="w-full px-4 py-3 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none h-32" 
                  placeholder="Paste the full job description here..." 
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-[#6D776B] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-[#2C362B] dark:bg-white dark:text-black hover:bg-[#1f261e] dark:hover:bg-gray-200 rounded-xl transition-all shadow-lg shadow-[#2C362B]/20 dark:shadow-white/10 active:scale-95 flex items-center gap-2">
                  <Plus size={16} />
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Scoring Modal */}
      {scoringJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-white/40 dark:bg-black/60 backdrop-blur-md transition-opacity">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-xl shadow-2xl border border-rose-100 dark:border-white/10 overflow-hidden font-sans">
            <div className="px-8 py-8 border-b border-gray-50 dark:border-white/5 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <h2 className="text-3xl font-bold text-[#2C362B] dark:text-white flex items-center gap-3 font-serif">
                <div className="p-2.5 bg-rose-100 dark:bg-purple-500/20 rounded-xl text-rose-500 dark:text-purple-400">
                  <Sparkles size={24} />
                </div>
                AI Resume Match
              </h2>
              <p className="text-sm text-[#6D776B] dark:text-gray-400 mt-3">
                Paste your resume to see how well it matches the job description.
              </p>
            </div>
            
            <form onSubmit={handleScoreResume} className="px-8 py-6 space-y-6">
              
              {jobs.find(j => j._id === scoringJobId)?.aiFeedback && (
                <div className="bg-emerald-50/50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 backdrop-blur-sm">
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">Previous AI Feedback:</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                    {jobs.find(j => j._id === scoringJobId)?.aiFeedback}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#2C362B] dark:text-gray-300 mb-2">Your Resume Content</label>
                <textarea 
                  required
                  value={resumeText} 
                  onChange={e => setResumeText(e.target.value)} 
                  className="w-full px-4 py-4 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-purple-500/20 focus:border-rose-400 dark:focus:border-purple-500 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none h-48" 
                  placeholder="Paste your plain text resume here..." 
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setScoringJobId(null)} className="px-6 py-3 text-sm font-bold text-[#6D776B] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  Close
                </button>
                <button 
                  type="submit" 
                  disabled={isScoring}
                  className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-rose-400 to-amber-400 dark:from-purple-500 dark:to-indigo-500 hover:from-rose-500 hover:to-amber-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-purple-900/50 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isScoring ? 'Analyzing Match...' : <><Sparkles size={16} /> Analyze Match</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
