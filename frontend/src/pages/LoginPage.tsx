import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

const DEMO_USERS = [
  { role: 'Commander', email: 'commander@nmc.nagpur.gov.in', name: 'Cmdr. Rajesh Sharma' },
  { role: 'Coordinator', email: 'coordinator.roads@nmc.nagpur.gov.in', name: 'Er. Amit Deshmukh' },
  { role: 'Inspector', email: 'inspector.patrol@nmc.nagpur.gov.in', name: 'Sandeep Patel' },
  { role: 'Verifier', email: 'verifier.eng@nmc.nagpur.gov.in', name: 'Er. Priya Kulkarni' },
  { role: 'Citizen', email: 'citizen.nagpur@gmail.com', name: 'Ravi Joshi' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState('nagpur123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.login(email, password);
      navigate('/operations/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (u: (typeof DEMO_USERS)[0]) => {
    setEmail(u.email);
    setPassword('nagpur123');
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl mx-auto shadow-lg shadow-blue-500/25">
          NMC
        </div>
        <h1 className="text-2xl font-black text-white">NagpurOne Sign In</h1>
        <p className="text-xs text-slate-400">
          Role-based civic authentication for municipal officers, contractors, and citizens.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

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
            Access Platform
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Fast Demo Role Login Buttons */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Quick Autofill (Demo Roles)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.role}
                type="button"
                onClick={() => handleQuickSelect(u)}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-300 transition-colors"
              >
                <div className="font-bold text-white truncate">{u.role}</div>
                <div className="text-[10px] text-slate-500 truncate">{u.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
