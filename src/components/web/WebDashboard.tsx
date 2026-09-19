import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { SafetyStatusBadge } from '../common/SafetyStatusBadge';
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Users, 
  Activity, 
  Clock, 
  Share2, 
  Lock, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryLow,
  Heart,
  Navigation,
  ChevronRight
} from 'lucide-react';

export const WebDashboard: React.FC = () => {
  const { 
    currentUser, 
    safetyState, 
    triggerSOS, 
    journey, 
    extendJourneyETA, 
    markJourneyArrived,
    checkins, 
    confirmCheckIn,
    contacts, 
    isOnline, 
    batteryLevel,
    activeSafetySession,
    toggleSafetySession,
    simulateMissedCheckIn,
    simulateOverdueJourney,
    incidents
  } = useSafeGrid();

  const pendingCheckIn = checkins.find(c => !c.isCompletedToday) || checkins[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">{currentUser.name}</h1>
              <SafetyStatusBadge state={safetyState} size="md" />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{currentUser.subtitle} • Protected by SAFEGRID Community Platform</p>
          </div>
        </div>

        {/* Quick SOS Trigger & Session Heartbeat */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSafetySession}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSafetySession
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Safety Session: {activeSafetySession ? 'Active (Heartbeat ON)' : 'Paused'}</span>
          </button>

          <button
            id="web-btn-sos"
            onClick={triggerSOS}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-rose-950/80 flex items-center gap-2.5 transition-all"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>EMERGENCY SOS (10s CANCEL)</span>
          </button>
        </div>
      </div>

      {/* 3-Column Responsive Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monitored Safe Journey */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <MapPin className="w-5 h-5" />
              <h2 className="font-bold text-base text-white">Safe Journey Monitor</h2>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              journey?.status === 'ACTIVE'
                ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
                : journey?.status === 'OVERDUE'
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {journey?.status || 'INACTIVE'}
            </span>
          </div>

          {journey && (journey.status === 'ACTIVE' || journey.status === 'OVERDUE') ? (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Origin: <strong className="text-white">{journey.origin}</strong></span>
                  <span>Departed: {journey.startTime}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Destination: <strong className="text-white">{journey.destination}</strong></span>
                  <span className="text-amber-400 font-bold">ETA: {journey.expectedArrivalTime}</span>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Route progress</span>
                    <span>{journey.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-rose-500 rounded-full"
                      style={{ width: `${journey.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Delay Extension Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 block">Extend ETA (Prevent false alarms):</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => extendJourneyETA(10)}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    +10 min
                  </button>
                  <button
                    onClick={() => extendJourneyETA(20)}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    +20 min
                  </button>
                  <button
                    onClick={() => extendJourneyETA(30)}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    +30 min
                  </button>
                </div>
              </div>

              <button
                onClick={markJourneyArrived}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM SAFE ARRIVAL</span>
              </button>

              <button
                onClick={simulateOverdueJourney}
                className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-colors"
              >
                Simulate Overdue Commute Trigger
              </button>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              <Navigation className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No active commute right now.</p>
            </div>
          )}
        </div>

        {/* Center Column: Scheduled Check-in & Welfare Signals */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Heart className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-base text-white">Welfare &amp; Check-ins</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Daily Schedule</span>
          </div>

          {/* Big I'M OK Card */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-3 shadow-inner">
            <h3 className="font-black text-lg text-white">
              {pendingCheckIn.isCompletedToday ? "Today's Signals Verified" : "Next Signal: " + pendingCheckIn.scheduledTime}
            </h3>
            <p className="text-xs text-slate-300">
              {pendingCheckIn.isCompletedToday 
                ? "Your trusted network has confirmed you are safe." 
                : "A single tap verifies your status and prevents escalation."}
            </p>

            <button
              onClick={() => confirmCheckIn(pendingCheckIn.id)}
              disabled={pendingCheckIn.isCompletedToday}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                pendingCheckIn.isCompletedToday
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/80 active:scale-98'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{pendingCheckIn.isCompletedToday ? "CONFIRMED: I'M OK" : "I'M OK"}</span>
            </button>
          </div>

          {/* Checkin Slots */}
          <div className="space-y-2">
            {checkins.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-white">{slot.label}</p>
                  <span className="text-slate-400 text-[11px]">{slot.scheduledTime}</span>
                </div>
                {slot.isCompletedToday ? (
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    ✓ Received
                  </span>
                ) : (
                  <button
                    onClick={() => confirmCheckIn(slot.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700"
                  >
                    Confirm
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={simulateMissedCheckIn}
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-colors"
          >
            Simulate Missed Check-in (Senior Demo)
          </button>
        </div>

        {/* Right Column: Safety Circle & Incident Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Users className="w-5 h-5" />
              <h2 className="font-bold text-base text-white">Safety Circle ({contacts.length})</h2>
            </div>
            <span className="text-xs text-slate-400">Authorized Contacts</span>
          </div>

          <div className="space-y-2.5">
            {contacts.map(c => (
              <div key={c.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                  <div>
                    <h4 className="font-bold text-xs text-white">{c.name}</h4>
                    <p className="text-[11px] text-slate-400">{c.relationship}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 block">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              Coordinates and welfare signals are encrypted and only accessible to verified circle members during active sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
