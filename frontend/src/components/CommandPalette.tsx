import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Briefcase, BarChart2, Moon, Sun, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.success('Switched to Light Mode');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.success('Switched to Dark Mode', {
        style: { background: '#333', color: '#fff' }
      });
    }
    setOpen(false);
  };

  const runCommand = (command: () => void) => {
    command();
    setOpen(false);
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <Command className="w-full h-full flex flex-col">
          <Command.Input 
            autoFocus
            placeholder="Type a command or search..." 
            className="w-full px-6 py-4 text-lg bg-transparent border-b border-gray-100 dark:border-white/10 outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="px-6 py-12 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/dashboard'))}
                className="flex items-center gap-3 px-4 py-3 mt-1 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-white/5 aria-selected:bg-rose-50 dark:aria-selected:bg-white/5 transition-colors"
              >
                <Briefcase size={16} /> Go to Dashboard
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/analytics'))}
                className="flex items-center gap-3 px-4 py-3 mt-1 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-white/5 aria-selected:bg-rose-50 dark:aria-selected:bg-white/5 transition-colors"
              >
                <BarChart2 size={16} /> View Analytics
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/profile'))}
                className="flex items-center gap-3 px-4 py-3 mt-1 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-white/5 aria-selected:bg-rose-50 dark:aria-selected:bg-white/5 transition-colors"
              >
                <User size={16} /> Edit Profile
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mt-4 mb-2">
              <Command.Item 
                onSelect={() => runCommand(toggleTheme)}
                className="flex items-center gap-3 px-4 py-3 mt-1 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-white/5 aria-selected:bg-rose-50 dark:aria-selected:bg-white/5 transition-colors"
              >
                <Sun size={16} className="hidden dark:block" />
                <Moon size={16} className="block dark:hidden" /> 
                Toggle Dark Mode
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
