import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { SafetyStatusBadge } from '../common/SafetyStatusBadge';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Users, 
  Activity, 
  ChevronRight, 
  Clock, 
  ArrowRight,
  BatteryLow,
  WifiOff,
  AlertTriangle,
  Smartphone
} from 'lucide-react';

import { DeviceSafetyStatus } from '../common/DeviceSafetyStatus';
import { DemoControlPanel } from '../demo/DemoControlPanel';
import { Sliders, Sparkles } from 'lucide-react';

interface Props {
  onNavigate: (tab: 'home' | 'journey' | 'checkin' | 'circle' | 'timeline') => void;
}

export const MobileHome: React.FC<Props> = ({ onNavigate }) => {
  const { 
    currentUser, 
    safetyState, 
    triggerSOS, 
    journey, 
    checkins, 
    contacts, 
    isOnline, 
    batteryLevel, 
    activeSafetySession,
    toggleSafetySession,
    simulateMissedCheckIn,
    simulateOverdueJourney,
    setIsConnectFriendModalOpen,
    liveCoords,
    isLocatingGps,
    refreshLiveGps,
    isDemoMode,
    toggleDemoMode,
    isDemoPanelOpen,
    setIsDemoPanelOpen,
    setIsDemoGuideOpen,
    setIsEscalationSettingsOpen,
  } = useSafeGrid();

  const nextCheckIn = checkins.find(c => !c.isCompletedToday) || checkins[0];

  return (
    <div className="p-4 space-y-4 pb-8 animate-in fade-in">
      {/* DEMO MODE PRESENTATION BANNER (Parts 9, 10, 11) */}
      {isDemoMode && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-purple-950/90 border-2 border-purple-500/80 shadow-lg shadow-purple-950/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/40">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide">DEMO MODE ACTIVE</span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>
              <span className="text-[10px] text-purple-300 block">Phone A (Alex) ↔ Phone B (Rahul)</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsDemoPanelOpen(!isDemoPanelOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              {isDemoPanelOpen ? 'Hide Panel' : 'Demo Panel'}
            </button>
            <button
              onClick={toggleDemoMode}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Demo Panel Dropdown when toggled open */}
      {isDemoMode && isDemoPanelOpen && (
        <DemoControlPanel onOpenGuide={() => setIsDemoGuideOpen(true)} />
      )}

      {/* Compact Device Status Component (Parts 2, 3, 18, 19, 20, 21) */}
      <DeviceSafetyStatus />

      {/* Header Greeting & Safety State */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400">SafeGrid Protection</span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Hi, {currentUser.name.split(' ')[0]}
          </h2>
          {/* Live Location Telemetry Pill */}
          <button
            onClick={() => refreshLiveGps()}
            title="Click to refresh device GPS coordinates"
            className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            <MapPin className={`w-3 h-3 text-rose-400 ${isLocatingGps ? 'animate-spin' : ''}`} />
            <span className="truncate max-w-[200px]">
              {liveCoords.locationName || 'Live GPS'}: {liveCoords.lat.toFixed(4)}, {liveCoords.lng.toFixed(4)}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <SafetyStatusBadge state={safetyState} size="md" />
        </div>
      </div>

      {/* Current Safety State Explainer Card */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        safetyState === 'SAFE' 
          ? 'bg-slate-900/90 border-slate-800' 
          : safetyState === 'ATTENTION'
          ? 'bg-amber-950/60 border-amber-500/50 shadow-lg shadow-amber-950/40'
          : 'bg-rose-950/80 border-rose-500/60 shadow-lg shadow-rose-950/60'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">Current Safety Status</span>
          <span className="text-[11px] text-slate-400">Continuous Monitoring</span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {safetyState === 'SAFE' && 'Expected safety signal received. Safe Journey and scheduled check-ins active.'}
          {safetyState === 'ATTENTION' && 'A safety signal is overdue. A welfare verification prompt is awaiting your response.'}
          {safetyState === 'EMERGENCY' && 'Emergency protocol active. Safety Circle alerted and verified responders matched.'}
        </p>
      </div>

      {/* BIG EMERGENCY SOS BUTTON */}
      <div className="py-2 text-center">
        <div className="relative inline-block">
          {/* Pulsing ring */}
          <div className="absolute -inset-2.5 rounded-full bg-rose-600/20 animate-ping pointer-events-none" />
          
          <button
            id="btn-trigger-sos"
            onClick={triggerSOS}
            className="w-44 h-44 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 hover:from-rose-400 hover:to-red-600 active:scale-95 text-white font-black shadow-[0_10px_35px_rgba(225,29,72,0.45)] border-4 border-rose-300/40 flex flex-col items-center justify-center transition-all group"
          >
            <ShieldAlert className="w-12 h-12 text-white mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-2xl tracking-tight font-extrabold">SOS</span>
            <span className="text-[10px] font-semibold text-rose-100/90 tracking-wide uppercase mt-0.5">
              10s Cancel Period
            </span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Press for immediate emergency dispatch with false-alarm countdown
        </p>
      </div>

      {/* Connect Friend's Phone & Escalation Policy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Connect Friend&apos;s Phone</h3>
              <p className="text-[10px] text-slate-300">Live pairing via QR or SMS link</p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectFriendModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition-all active:scale-95"
          >
            Connect
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-800 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Escalation Policy</h3>
              <p className="text-[10px] text-slate-300">Auto-escalation triggers & timer</p>
            </div>
          </div>
          <button
            onClick={() => setIsEscalationSettingsOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs shrink-0 border border-purple-500/30 transition-all active:scale-95"
          >
            Settings
          </button>
        </div>
      </div>

      {/* 4 Core Action Cards */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Safe Journey Card */}
        <button
          id="card-safe-journey"
          onClick={() => onNavigate('journey')}
          className="text-left p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-2">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
              Safe Journey
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {journey?.status === 'ACTIVE' ? `ETA: ${journey.expectedArrivalTime}` : 'Start new commute'}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
            <span>{journey?.status === 'ACTIVE' ? 'In Progress' : 'Inactive'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Check-in Card (Senior "I'M OK") */}
        <button
          id="card-check-in"
          onClick={() => onNavigate('checkin')}
          className="text-left p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
              {currentUser.isSeniorMode ? "Senior Check-In" : "Check-In"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Next: {nextCheckIn.scheduledTime}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
            <span>{nextCheckIn.isCompletedToday ? 'Done' : 'Pending'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Safety Circle Card */}
        <button
          id="card-safety-circle"
          onClick={() => onNavigate('circle')}
          className="text-left p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
              Safety Circle
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {contacts.length} Trusted Contacts
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
            <span>Active</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Safety Session Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">
              Safety Session
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Heartbeat monitor
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 font-medium pt-2 border-t border-slate-800">
            <span>{activeSafetySession ? 'Monitoring' : 'Paused'}</span>
            <button
              onClick={toggleSafetySession}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                activeSafetySession
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeSafetySession ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Interactive Testing Triggers */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Interactive Signal Simulator
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={simulateMissedCheckIn}
            className="text-[11px] font-semibold py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-left truncate transition-colors"
          >
            ⚡ Missed Check-in
          </button>
          <button
            onClick={simulateOverdueJourney}
            className="text-[11px] font-semibold py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-left truncate transition-colors"
          >
            ⚡ Overdue Journey
          </button>
        </div>
      </div>
    </div>
  );
};
