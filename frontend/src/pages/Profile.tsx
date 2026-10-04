import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, ArrowLeft, Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const gradients = [
  'from-rose-200 to-amber-100 dark:from-rose-500 dark:to-orange-400',
  'from-emerald-200 to-teal-200 dark:from-emerald-500 dark:to-teal-600',
  'from-indigo-300 to-purple-400 dark:from-indigo-600 dark:to-purple-700',
  'from-orange-200 to-rose-300 dark:from-orange-500 dark:to-rose-600',
  'from-cyan-200 to-blue-300 dark:from-cyan-600 dark:to-blue-700',
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarGradient, setAvatarGradient] = useState(() => localStorage.getItem('avatarGradient') || gradients[0]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/update', 
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('avatarGradient', avatarGradient);
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden font-serif selection:bg-rose-200">
      {/* Floral Background Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 text-rose-100 opacity-60 rotate-45 pointer-events-none">
        <Flower2 size={400} strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 text-emerald-100 opacity-50 -rotate-12 pointer-events-none">
        <Flower2 size={300} strokeWidth={0.5} />
      </div>

      <nav className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-rose-900/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 text-rose-900 hover:text-rose-700 transition-colors font-medium">
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2C362B] mb-3">Your Profile</h1>
          <p className="text-[#6D776B] font-sans">Manage your personal information and preferences.</p>
        </div>

        <div className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-xl shadow-rose-900/5 dark:shadow-none border border-rose-900/10 dark:border-white/5">
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-4xl font-bold text-rose-900 dark:text-white shadow-inner border-4 border-white dark:border-[#111]`}>
                {name?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* Gradient Picker */}
            <div className="flex gap-3">
              {gradients.map((grad, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarGradient(grad)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} border-2 transition-transform ${avatarGradient === grad ? 'border-[#2C362B] dark:border-white scale-110 shadow-lg' : 'border-transparent scale-100 hover:scale-105'}`}
                  title={`Color theme ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6 font-sans">
            <div>
              <label className="block text-sm font-semibold text-[#2C362B] mb-2 flex items-center gap-2">
                <User size={16} className="text-rose-400" /> Full Name
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all text-gray-800" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#2C362B] mb-2 flex items-center gap-2">
                <Mail size={16} className="text-rose-400" /> Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all text-gray-800" 
              />
            </div>

            {message && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100 text-center">
                {message}
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-4 text-base font-bold text-white bg-[#2C362B] hover:bg-[#1f261e] rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Save size={18} />
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
