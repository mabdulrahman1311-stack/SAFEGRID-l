import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  X, 
  Play, 
  Heart, 
  MapPin, 
  ShieldAlert, 
  WifiOff, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioRunnerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    runSeniorCheckInDemo, 
    runWomanJourneyDemo, 
    runSOSCountdownDemo, 
    runOfflineSyncDemo,
    runResponderDemo,
    runAdminDemo,
    setViewMode 
  } = useSafeGrid();

  if (!isOpen) return null;

  const handleRun = (action: () => void, targetView: 'MOBILE' | 'WEB' = 'MOBILE') => {
    setViewMode(targetView);
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Interactive Demonstration Scenarios</h3>
              <p className="text-[11px] text-slate-400">Execute the 4 master flows defined in sections 73–76</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-5 space-y-3">
          {/* Demo 1: Senior Check-in */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                  Demo 1 — Senior Citizen Missed Check-in
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Simulates senior missing scheduled &ldquo;I&apos;M OK&rdquo; signal. Demonstrates transition to 🟡 ATTENTION, verification prompt, and escalation.
                </p>
              </div>
            </div>
            <button
              id="btn-run-demo-senior"
              onClick={() => handleRun(runSeniorCheckInDemo)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Run</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Demo 2: Woman Safe Journey */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                  Demo 2 — Woman Commute Overdue Journey
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Overdue college-to-home journey enters 🟡 ATTENTION. Demonstrates +10m ETA extension preventing premature emergency alarms.
                </p>
              </div>
            </div>
            <button
              id="btn-run-demo-journey"
              onClick={() => handleRun(runWomanJourneyDemo)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Run</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Demo 3: 10s SOS Countdown & Cancel */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-rose-300 transition-colors">
                  Demo 3 — Accidental SOS 10s Cancel Period
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Tests the 10-second countdown with visual ring and cancel option to prevent accidental emergency dispatching.
                </p>
              </div>
            </div>
            <button
              id="btn-run-demo-sos"
              onClick={() => handleRun(runSOSCountdownDemo)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Run</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Demo 4: Offline Queue & Sync */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                  Demo 4 — Offline Event Queue &amp; Late Sync
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Demonstrates how events are stored offline and submitted with dual timestamps (created vs synced) when internet returns.
                </p>
              </div>
            </div>
            <button
              id="btn-run-demo-offline"
              onClick={() => handleRun(runOfflineSyncDemo)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Run</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Demo 5: Section 75 Responder Workflow */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                  Demo 5 — Verified Responder Console (Sec. 75)
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Switch to Dr. Anita Roy: ACCEPT → EN ROUTE → ARRIVED → RESOLVED dispatch lifecycle with approximate location boundaries.
                </p>
              </div>
            </div>
            <button
              id="btn-run-demo-responder"
              onClick={() => handleRun(runResponderDemo, 'WEB')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Switch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Demo 6: Section 76 Admin Dashboard & Correlation */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors">
                  Demo 6 — City Operations Center &amp; Deduplication (Sec. 76)
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  View citywide active incidents, attention cases, responder availability, and correlated duplicate report clustering.
                </p>
              </div>
            </div>
            <button
              id="btn-run-demo-admin"
              onClick={() => handleRun(runAdminDemo, 'WEB')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Switch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
