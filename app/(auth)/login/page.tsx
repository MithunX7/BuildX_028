"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, KeyRound, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const QUICK_ROLES = [
  { role: "COMMANDER", title: "Operations Commander", name: "Cmdr. Rajesh Sharma", email: "commander@nmc.nagpur.gov.in" },
  { role: "COORDINATOR", title: "Roads Coordinator", name: "Er. Amit Deshmukh", email: "coordinator.roads@nmc.nagpur.gov.in" },
  { role: "INSPECTOR", title: "Field Patrol / Contractor", name: "Sanjay Patel", email: "inspector.patrol@nmc.nagpur.gov.in" },
  { role: "VERIFIER", title: "Chief Quality Verifier", name: "Er. Priya Kulkarni", email: "verifier.eng@nmc.nagpur.gov.in" },
  { role: "OPERATOR", title: "Helpline Operator", name: "Kavita Rao", email: "operator.helpline@nmc.nagpur.gov.in" },
  { role: "CITIZEN", title: "Nagpur Resident", name: "Anand Joshi", email: "citizen.nagpur@gmail.com" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("commander@nmc.nagpur.gov.in");
  const [password, setPassword] = useState("nagpur123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/operations/dashboard");
      } else {
        setError(data.error?.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black text-xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            NMC
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">NMC Operations Portal</h1>
          <p className="text-xs text-slate-400">Nagpur Civic Infrastructure & AI Video Detection Console</p>
        </div>

        {/* Login Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button
            size="md"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            onClick={() => handleLogin(email, password)}
          >
            Sign In to Console
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Quick 1-Click Role Switcher for Evaluator Demo */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Logins
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setEmail(r.email);
                  setPassword("nagpur123");
                  handleLogin(r.email, "nagpur123");
                }}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-blue-400 truncate">{r.role}</div>
                <div className="text-[10px] text-slate-400 truncate">{r.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
