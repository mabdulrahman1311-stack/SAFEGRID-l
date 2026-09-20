import React, { useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  Play, 
  RotateCcw, 
  Battery, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  HelpCircle,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface DemoControlPanelProps {
  onOpenGuide: () => void;
  onClose?: () => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ onOpenGuide, onClose }) => {
  const {
    isDemoMode,
    toggleDemoMode,
    demoConfig,
    updateDemoConfig,
    demoTimeline,
    runDemoStep,
    resetDemo,
    batteryInfo,
    isOnline,
    toggleOnlineStatus,
    contacts,
  } = useSafeGrid();

  const [activeTab, setActiveTab] = useState<'triggers' | 'timeline' | 'config'>('triggers');

  return (
    <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-4 shadow-2xl shadow-purple-950/60 space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-tight">HACKATHON DEMO PANEL</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 font-black">
                SAFE SIMULATION
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80">Phone A (Alex) ↔ Phone B (Rahul) Presentation Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-500/40 flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>
          <button
            onClick={toggleDemoMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isDemoMode
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isDemoMode ? 'DEMO ACTIVE' : 'ENABLE DEMO'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs font-bold">
        <button
          onClick={() => setActiveTab('triggers')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'triggers' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Live Triggers
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'timeline' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Timeline ({demoTimeline.length})
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'config' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sim Controls
        </button>
      </div>

      {/* TAB 1: LIVE TRIGGERS (9-Step Demo Flow) */}
      {activeTab === 'triggers' && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Step-by-step Presentation Actions:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-btn-start-journey"
              onClick={() => runDemoStep('START_JOURNEY')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-white flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                <Play className="w-3.5 h-3.5" />
                <span>1. Start Journey</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">College → Home</span>
            </button>

            <button
              id="demo-btn-miss-checkin"
              onClick={() => runDemoStep('MISS_CHECKIN')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-white flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>2. Miss Check-in</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Triggers safety check</span>
            </button>

            <button
              id="demo-btn-friend-alert"
              onClick={() => runDemoStep('NOTIFY_FRIEND')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-white flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>3. Friend Alert</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Phone B Rahul receives alert</span>
            </button>

            <button
              id="demo-btn-friend-ack"
              onClick={() => runDemoStep('FRIEND_ACKNOWLEDGE')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-white flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>4. Acknowledge</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Rahul confirms assist</span>
            </button>

            <button
              id="demo-btn-safe-resolve"
              onClick={() => runDemoStep('RESOLVE_SAFE')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-white flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>5. Resolve Safe</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Closes safety event</span>
            </button>

            <button
              id="demo-btn-reset"
              onClick={resetDemo}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-slate-300 flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">Clear all states</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL TIMELINE / EVENT LOG (Part 14) */}
      {activeTab === 'timeline' && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {demoTimeline.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-400">
              No events recorded in demo timeline yet. Trigger an action above to populate the timeline.
            </div>
          ) : (
            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-900/60">
              {demoTimeline.map(item => (
                <div key={item.id} className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-slate-900" />
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] font-mono text-purple-300">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">{item.description}</p>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Actor: {item.actor}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SIMULATION CONTROLS (Demo Battery, Network, Contacts) */}
      {activeTab === 'config' && (
        <div className="space-y-3 text-xs">
          {/* Demo Battery Slider (ONLY impacts Demo Mode! Normal mode untouched) */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-purple-400" />
                Demo Battery Simulation
              </span>
              <span className="font-mono font-bold text-purple-300">
                {demoConfig.simulatedBatteryLevel !== null ? `${demoConfig.simulatedBatteryLevel}%` : 'Disabled (Using Real)'}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={demoConfig.simulatedBatteryLevel ?? 67}
              onChange={e => updateDemoConfig({ simulatedBatteryLevel: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Critical (5%)</span>
              <span>Low (15%)</span>
              <span>Moderate (35%)</span>
              <span>Normal (80%)</span>
            </div>
            <p className="text-[10px] text-purple-400/80 italic">
              * Note: This simulation slider ONLY affects Demo Mode. Normal Mode strictly uses real device battery.
            </p>
          </div>

          {/* Network & Location Sim Toggles */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleOnlineStatus}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                isOnline
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
                <span>Network: {isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <span className="text-[10px] font-normal text-slate-400">Click to toggle offline mode</span>
            </button>

            <button
              onClick={() => updateDemoConfig({ simulatedGpsAvailable: !demoConfig.simulatedGpsAvailable })}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                demoConfig.simulatedGpsAvailable
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className={`w-3.5 h-3.5 ${demoConfig.simulatedGpsAvailable ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>GPS: {demoConfig.simulatedGpsAvailable ? 'Available' : 'Unavailable'}</span>
              </div>
              <span className="text-[10px] font-normal text-slate-400">Simulate tunnel/deadzone</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
