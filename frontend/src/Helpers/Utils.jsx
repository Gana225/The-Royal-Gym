import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';

// --- TOAST SYSTEM ---
let toastTimeout;
export const ToastCustom = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    toastTimeout = setTimeout(onClose, 4000);
    return () => clearTimeout(toastTimeout);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  return (
    <div className="fixed top-6 right-6 z-[999] animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-2xl p-4 min-w-[300px] flex items-center gap-4">
        <div className="shrink-0">{icons[type]}</div>
        <div className="flex-grow">
          <p className="text-sm font-bold text-white uppercase tracking-tight italic">System Notification</p>
          <p className="text-xs text-slate-400">{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// --- PROGRESS OVERLAY ---
export const ProgressOverlay = ({ progress, label }) => (
  <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
    <div className="relative w-20 h-20">
      {/* Background Circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40" cy="40" r="36"
          stroke="currentColor" strokeWidth="4"
          fill="transparent" className="text-white/5"
        />
        <circle
          cx="40" cy="40" r="36"
          stroke="currentColor" strokeWidth="4"
          fill="transparent"
          strokeDasharray={226}
          strokeDashoffset={226 - (226 * progress) / 100}
          className="text-emerald-500 transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-white">{Math.round(progress)}%</span>
      </div>
    </div>
    <p className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
      {label || 'Processing...'}
    </p>
  </div>
);

// --- GLOBAL LOADER ---
export const FullPageLoader = ({ label }) => (
  <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
    <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center">
      <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
      <p className="text-xs font-black text-white uppercase tracking-[0.2em] italic">{label}</p>
    </div>
  </div>
);