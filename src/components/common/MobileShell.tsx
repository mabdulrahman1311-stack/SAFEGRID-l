import React, { ReactNode } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Home,
  MapPin,
  CheckCircle2,
  Users,
  Clock
} from 'lucide-react';

interface Props {
  children: ReactNode;
  activeTab: 'home' | 'journey' | 'checkin' | 'circle' | 'timeline';
  setActiveTab: (tab: 'home' | 'journey' | 'checkin' | 'circle' | 'timeline') => void;
}

/** True when the page is actually being viewed on a phone/small screen */
const IS_REAL_PHONE =
  typeof window !== 'undefined' &&
  (window.innerWidth <= 500 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

export const MobileShell: React.FC<Props> = ({ children, activeTab, setActiveTab }) => {
  const { isOnline, batteryLevel, safetyState, currentUser } = useSafeGrid();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /* ── NATIVE PHONE VIEW ── fills the whole real phone screen ─────────── */
  if (IS_REAL_PHONE) {
    return (
      <div className="fixed inset-0 flex flex-col bg-slate-950 text-slate-100" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Slim Status Strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/95 border-b border-slate-800/60 shrink-0">
          <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            SAFEGRID
          </span>
          <div className="flex items-center gap-2 text-slate-400">
            {isOnline
              ? <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span className="text-[11px] font-mono">{batteryLevel}%</span>
            {batteryLevel <= 20
              ? <BatteryLow className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              : <Battery className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px] font-semibold text-slate-300">{currentTime}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Bottom Tab Bar */}
        <div className="shrink-0 bg-slate-950/98 border-t border-slate-800/80 backdrop-blur-md" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
          <div className="grid grid-cols-5 px-1 pt-1">
            {([
              { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
              { id: 'journey', label: 'Journey', icon: <MapPin className="w-6 h-6" /> },
              { id: 'checkin', label: currentUser.isSeniorMode ? "I'M OK" : 'Check-in', icon: <CheckCircle2 className="w-6 h-6" /> },
              { id: 'circle', label: 'Circle', icon: <Users className="w-6 h-6" /> },
              { id: 'timeline', label: 'History', icon: <Clock className="w-6 h-6" /> },
            ] as { id: typeof activeTab; label: string; icon: React.ReactNode }[]).map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all relative ${
                  activeTab === tab.id ? 'text-rose-400' : 'text-slate-500 active:text-slate-200'
                }`}
              >
                {tab.id === 'home' && safetyState !== 'SAFE' && (
                  <span className={`absolute top-1.5 right-3 w-2.5 h-2.5 rounded-full z-10 ${
                    safetyState === 'EMERGENCY' ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-pulse'
                  }`} />
                )}
                {tab.icon}
                <span className={`text-[10px] font-semibold leading-none ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── DESKTOP DEMO VIEW ── decorative phone frame shown on PC ─────────── */
  return (
    <div className="flex justify-center items-center py-6 sm:py-8 px-2 sm:px-4">
      <div
        id="mobile-device-frame"
        className="w-full max-w-[412px] h-[844px] bg-slate-900 border-[8px] border-slate-800 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col relative overflow-hidden transition-all"
      >
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-center gap-2 border border-slate-800/60 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 border border-slate-700/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Status Bar */}
        <div className="w-full h-11 px-6 pt-2.5 flex items-center justify-between text-xs text-slate-300 font-medium z-20 shrink-0 select-none bg-slate-950/60 backdrop-blur-sm">
          <span className="font-semibold text-[13px] tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2 text-slate-300">
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span className="text-[11px] font-mono">{batteryLevel}%</span>
            {batteryLevel <= 20
              ? <BatteryLow className="w-4 h-4 text-rose-400 animate-pulse" />
              : <Battery className="w-4 h-4 text-slate-300" />}
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 relative scroll-smooth flex flex-col">
          {children}
        </div>

        {/* Bottom Tab Bar */}
        <div className="w-full bg-slate-950/95 border-t border-slate-800/80 px-2 py-1.5 z-20 shrink-0 backdrop-blur-md">
          <div className="grid grid-cols-5 gap-1 text-center">
            {([
              { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
              { id: 'journey', label: 'Journey', icon: <MapPin className="w-5 h-5" /> },
              { id: 'checkin', label: currentUser.isSeniorMode ? "I'M OK" : 'Check-in', icon: <CheckCircle2 className="w-5 h-5" /> },
              { id: 'circle', label: 'Circle', icon: <Users className="w-5 h-5" /> },
              { id: 'timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
            ] as { id: typeof activeTab; label: string; icon: React.ReactNode }[]).map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 rounded-xl transition-all relative ${
                  activeTab === tab.id ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.id === 'home' && safetyState !== 'SAFE' && (
                  <span className={`absolute top-0 right-2 w-2 h-2 rounded-full ${
                    safetyState === 'EMERGENCY' ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-pulse'
                  }`} />
                )}
                {tab.icon}
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="w-32 h-1 bg-slate-700/60 rounded-full mx-auto mt-2 mb-0.5" />
        </div>
      </div>
    </div>
  );
};
