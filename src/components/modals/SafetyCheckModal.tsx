import React, { useEffect, useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Clock, 
  MapPin, 
  Battery, 
  Users 
} from 'lucide-react';

export const SafetyCheckModal: React.FC = () => {
  const {
    isSafetyCheckModalOpen,
    safetyCheckReason,
    cancelSafetyCheck,
    confirmUserSafe,
    userNeedHelp,
    escalationConfig,
    contacts,
    batteryInfo,
    liveCoords,
    isDemoMode,
  } = useSafeGrid();

  const [secondsRemaining, setSecondsRemaining] = useState(escalationConfig.gracePeriodSeconds);

  // Sync timer when modal opens
  useEffect(() => {
    if (isSafetyCheckModalOpen) {
      setSecondsRemaining(escalationConfig.gracePeriodSeconds);
    }
  }, [isSafetyCheckModalOpen, escalationConfig.gracePeriodSeconds]);

  // Countdown effect
  useEffect(() => {
    if (!isSafetyCheckModalOpen) return;

    if (secondsRemaining <= 0) {
      // Auto-escalate according to user's configured escalation policy
      userNeedHelp('Auto-escalated: User did not respond to safety check countdown window');
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSafetyCheckModalOpen, secondsRemaining, userNeedHelp]);

  if (!isSafetyCheckModalOpen) return null;

  const targetContacts = contacts.filter(c => 
    escalationConfig.selectedContactIds.includes(c.id) || c.canReceiveSOS
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl shadow-amber-950/60 flex flex-col space-y-5 relative text-center">
        {/* Urgent Warning Header */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/60 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-amber-400 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
            Safety Verification Prompt
          </span>
          <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
            SAFETY CHECK
          </h2>
          <p className="text-sm font-semibold text-slate-300 mt-1 max-w-xs">
            {safetyCheckReason || "We haven't received your check-in."}
          </p>
          <p className="text-lg font-bold text-white mt-1">
            Are you safe?
          </p>
        </div>

        {/* Big Countdown Timer Card */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Escalation Countdown</span>
          </div>
          <div className="text-4xl font-black font-mono text-white tracking-wider">
            {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
          </div>
          <span className="text-[11px] text-slate-400">
            Escalating to {targetContacts.length} trusted contact(s) in {secondsRemaining} seconds...
          </span>
        </div>

        {/* Context Telemetry Strip */}
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-center gap-1">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>{batteryInfo.level !== null ? `${batteryInfo.level}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{liveCoords.locationName || 'GPS Fixed'}</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{targetContacts.length} On Standby</span>
          </div>
        </div>

        {/* 3 Primary Action Buttons (Part 8) */}
        <div className="space-y-2.5 pt-1">
          {/* I'M SAFE */}
          <button
            id="btn-safety-check-safe"
            onClick={confirmUserSafe}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-base shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I&apos;M SAFE</span>
          </button>

          {/* NEED HELP */}
          <button
            id="btn-safety-check-need-help"
            onClick={() => userNeedHelp('User requested immediate emergency assist during safety check')}
            className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>NEED HELP (DISPATCH SOS)</span>
          </button>

          {/* CANCEL / DISMISS */}
          <button
            id="btn-safety-check-cancel"
            onClick={cancelSafetyCheck}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs border border-slate-800 transition-colors"
          >
            Dismiss / Cancel Escalation
          </button>
        </div>

        {isDemoMode && (
          <div className="text-[10px] text-purple-300 bg-purple-950/40 border border-purple-500/30 p-2 rounded-xl">
            DEMO MODE ACTIVE: Testing scenario will notify Demo Friend without real external emergency calls.
          </div>
        )}
      </div>
    </div>
  );
};
