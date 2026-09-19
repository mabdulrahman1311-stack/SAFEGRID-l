import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, X } from 'lucide-react';

export const MobileAttentionModal: React.FC = () => {
  const { 
    safetyState, 
    activeIncident, 
    verifySafeFromAttention, 
    escalateFromAttentionToEmergency,
    extendJourneyETA,
    journey
  } = useSafeGrid();

  if (safetyState !== 'ATTENTION') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="attention-verification-dialog"
        className="w-full max-w-sm bg-slate-900 border border-amber-500/60 rounded-3xl p-6 text-center shadow-2xl shadow-amber-950/60 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 animate-pulse" />

        {/* Attention Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7 animate-pulse" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
          SAFETY SIGNAL VERIFICATION
        </span>

        <h2 className="text-xl font-extrabold text-white tracking-tight mt-2">
          Are you safe?
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed px-2">
          {activeIncident?.type === 'MISSED_CHECK_IN'
            ? 'Your scheduled safety check-in was not confirmed.'
            : activeIncident?.type === 'OVERDUE_JOURNEY'
            ? 'Your expected journey arrival time has passed.'
            : 'Your expected safety signal has not been received.'}
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 my-4 text-left flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <span className="text-slate-300 font-semibold">Verification Grace Period Active</span>
            <p className="text-slate-400 mt-0.5">
              Escalates to Safety Circle and community responders in <strong className="text-amber-300">14 minutes</strong> if unverified.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* I'm safe */}
          <button
            id="btn-attention-safe"
            onClick={verifySafeFromAttention}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>YES, I&apos;M SAFE</span>
          </button>

          {/* Need more time (if journey or checkin) */}
          <button
            id="btn-attention-extend"
            onClick={() => {
              if (journey) extendJourneyETA(15);
              verifySafeFromAttention();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>I&apos;M DELAYED — ADD 15 MINS</span>
          </button>

          {/* Escalate / Need Help */}
          <button
            id="btn-attention-escalate"
            onClick={() => escalateFromAttentionToEmergency('User confirmed assistance needed via Attention dialog')}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-98 text-rose-300 font-semibold text-xs border border-rose-500/40 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>NO, I NEED ASSISTANCE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
