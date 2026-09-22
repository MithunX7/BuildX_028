import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b1329] text-slate-100">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                  Nagpur Civic Infrastructure Platform
                </h1>
                <p className="text-slate-400 max-w-md mb-6 text-sm sm:text-base">
                  Real-time live video detection & civic issue orchestration console.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Frontend Initialized (Phase 2)
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
