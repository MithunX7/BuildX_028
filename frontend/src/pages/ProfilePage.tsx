import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authService, User } from '../services/authService';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        setUser(res.user);
        setName(res.user.name);
        setPhone(res.user.phone || '');
      } catch {
        // Fallback to stored user
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await authService.updateProfile({ name, phone });
      setUser(res.user);
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <UserIcon className="w-6 h-6 text-blue-400" />
            Citizen Profile & Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your personal profile details, notification phone number, and session.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile Form */}
      <form
        onSubmit={handleUpdate}
        className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5"
      >
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xl">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="text-base font-bold text-white">{user?.name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
            <div className="mt-1">
              <Badge variant="info" size="sm">
                Role: {user?.role || 'CITIZEN'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Email Address (Immutable)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Phone Number (For SMS updates)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Changes
          </Button>

          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={handleLogout}
            className="px-4"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </form>
    </div>
  );
};
