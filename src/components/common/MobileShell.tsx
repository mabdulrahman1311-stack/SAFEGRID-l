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
  ShieldAlert, 
  Users,
  Clock
} from 'lucide-react';

interface Props {
  children: ReactNode;
  activeTab: 'home' | 'journey' | 'checkin' | 'circle' | 'timeline';
  setActiveTab: (tab: 'home' | 'journey' | 'checkin' | 'circle' | 'timeline') => void;
}

export const MobileShell: React.FC<Props> = ({ children, activeTab, setActiveTab }) => {
  const { isOnline, batteryLevel, safetyState, currentUser } = useSafeGrid();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex justify-center items-center py-6 sm:py-8 px-2 sm:px-4">
      {/* Outer Phone Frame */}
      <div 
        id="mobile-device-frame" 
        className="w-full max-w-[412px] h-[844px] bg-slate-900 border-[8px] border-slate-800 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col relative overflow-hidden transition-all"
      >
        {/* Notch / Dynamic Island */}
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
            {batteryLevel <= 20 ? (
              <BatteryLow className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Battery className="w-4 h-4 text-slate-300" />
            )}
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 relative scroll-smooth flex flex-col">
          {children}
        </div>

        {/* Bottom Tab Bar Navigation */}
        <div className="w-full bg-slate-950/95 border-t border-slate-800/80 px-2 py-1.5 z-20 shrink-0 backdrop-blur-md">
          <div className="grid grid-cols-5 gap-1 text-center">
            <button
              id="tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'home' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Home className="w-5 h-5" />
                {safetyState !== 'SAFE' && (
                  <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    safetyState === 'EMERGENCY' ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-pulse'
                  }`} />
                )}
              </div>
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            <button
              id="tab-journey"
              onClick={() => setActiveTab('journey')}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'journey' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Journey</span>
            </button>

            <button
              id="tab-checkin"
              onClick={() => setActiveTab('checkin')}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'checkin' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{currentUser.isSeniorMode ? "I'M OK" : "Check-in"}</span>
            </button>

            <button
              id="tab-circle"
              onClick={() => setActiveTab('circle')}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'circle' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Circle</span>
            </button>

            <button
              id="tab-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'timeline' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Timeline</span>
            </button>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-32 h-1 bg-slate-700/60 rounded-full mx-auto mt-2 mb-0.5" />
        </div>
      </div>
    </div>
  );
};
