import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

export const MobileSOSModal: React.FC = () => {
  const { isSOSCountdownActive, sosCountdownRemaining, cancelSOS, contacts } = useSafeGrid();

  if (!isSOSCountdownActive) return null;

  const progressPercent = ((10 - sosCountdownRemaining) / 10) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="sos-countdown-modal"
        className="w-full max-w-sm bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 text-center shadow-2xl shadow-rose-950/80 relative overflow-hidden"
      >
        {/* Pulsing background glow */}
        <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none" />

        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-9 h-9 animate-bounce" />
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          EMERGENCY SOS TRIGGERED
        </h2>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          Broadcasting alert to <strong className="text-white">{contacts.length} Safety Circle contacts</strong> and searching nearby verified responders in:
        </p>

        {/* Countdown Number with Circular Ring */}
        <div className="relative w-28 h-28 mx-auto my-5 flex items-center justify-center">
          {/* SVG ring */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={301.6}
              strokeDashoffset={301.6 - (301.6 * progressPercent) / 100}
              className="text-rose-500 transition-all duration-1000 ease-linear"
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-rose-400 font-mono tracking-tighter">
              {sosCountdownRemaining}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Seconds
            </span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 mb-5 text-[11px] text-slate-400 flex items-center gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Accidental press? Press Cancel below before countdown finishes.</span>
        </div>

        {/* Big Cancel Button */}
        <button
          id="btn-cancel-sos"
          onClick={cancelSOS}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>CANCEL EMERGENCY SOS</span>
        </button>
      </div>
    </div>
  );
};
