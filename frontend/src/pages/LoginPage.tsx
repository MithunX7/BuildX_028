import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { isAdminRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [email, setEmail] = useState('citizen.nagpur@gmail.com');
  const [password, setPassword] = useState('nagpur123');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.login(email, password);
      const user = res.user;
      if (user.role === 'ADMIN' || isAdminRole(user.role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoRole = (roleType: 'CITIZEN' | 'ADMIN') => {
    if (roleType === 'ADMIN') {
      setEmail('admin@nmc.nagpur.gov.in');
      setPassword('nagpur123');
    } else {
      setEmail('citizen.nagpur@gmail.com');
      setPassword('nagpur123');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl mx-auto shadow-lg shadow-blue-500/25">
          NMC
        </div>
        <h1 className="text-2xl font-black text-white">NagpurOne Access Portal</h1>
        <p className="text-xs text-slate-400">
          Official civic infrastructure reporting and municipal operations console.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => {
            setActiveTab('LOGIN');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LOGIN' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('REGISTER');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'REGISTER' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Citizen Account
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {activeTab === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full font-bold text-sm"
              isLoading={isLoading}
              type="submit"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Phone (For SMS updates)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full font-bold text-sm"
              isLoading={isLoading}
              type="submit"
            >
              Register & Access Dashboard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        {/* Demo Fast-Switch Buttons */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Demo 1-Click Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectDemoRole('CITIZEN')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'citizen.nagpur@gmail.com'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Citizen
              </div>
              <div className="text-[10px] text-slate-400 truncate">citizen.nagpur@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => selectDemoRole('ADMIN')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'admin@nmc.nagpur.gov.in'
                  ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" /> Admin
              </div>
              <div className="text-[10px] text-slate-400 truncate">admin@nmc.nagpur.gov.in</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
