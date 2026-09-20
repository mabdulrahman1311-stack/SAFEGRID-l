import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Smartphone, ArrowRight } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Start Journey',
      instruction: 'Tap "1. Start Journey" in Demo Panel or Journey tab.',
      detail: 'Phone A initializes the "College → Home" protected corridor with active GPS tracking and ETA calculation.',
    },
    {
      step: 2,
      title: 'Show Current Location',
      instruction: 'Point out the live GPS coordinates on the Dashboard.',
      detail: 'Explain that SafeGrid uses genuine device GPS sensors with reverse geocoded neighborhood landmarks, avoiding hardcoded coordinates.',
    },
    {
      step: 3,
      title: 'Show Real Battery',
      instruction: 'Highlight the Battery percentage on Phone A matching Android system settings.',
      detail: 'Demonstrate that in Normal Mode, SafeGrid synchronizes directly with Android BatteryManager. In Demo Mode, you can optionally demonstrate low battery warnings.',
    },
    {
      step: 4,
      title: 'Start Safety Check-in',
      instruction: 'Show the scheduled check-in countdown timer.',
      detail: 'Explain that check-ins create continuous safety heartbeats without requiring active phone interaction during transit.',
    },
    {
      step: 5,
      title: 'Miss Check-in',
      instruction: 'Tap "2. Miss Check-in" in the Demo Panel or let the timer expire.',
      detail: 'The application detects an unacknowledged welfare check-in and immediately transitions to VERIFYING state.',
    },
    {
      step: 6,
      title: 'Show Safety Verification',
      instruction: 'Show the prominent "SAFETY CHECK: Are you safe?" screen on Phone A.',
      detail: 'Demonstrate the configurable grace countdown (e.g. 60s) with "I\'M SAFE" and "NEED HELP" options. The presenter intentionally lets it count down or triggers escalation.',
    },
    {
      step: 7,
      title: 'Show Trusted Friend Alert',
      instruction: 'Show Phone B (Friend Rahul in Guardian View).',
      detail: 'Phone B receives a high-priority SAFETY ALERT: "Alex may need assistance", including last known location, battery level, and live journey corridor.',
    },
    {
      step: 8,
      title: 'Friend Acknowledges',
      instruction: 'Tap "ACKNOWLEDGE" on Phone B.',
      detail: 'The alert updates in real-time on both phones to ACKNOWLEDGED, notifying the user that help or verification is in progress.',
    },
    {
      step: 9,
      title: 'Show Resolution Timeline',
      instruction: 'Tap "Timeline" in the Demo Panel or History tab.',
      detail: 'Display the complete chronological audit log showing every step from start to resolution for the hackathon judges.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">SAFEGRID LIVE DEMO SCRIPT</h2>
              <p className="text-xs text-purple-300/80">Presenter walkthrough for hackathon judging & live evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {steps.map(s => (
            <div key={s.step} className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[11px] font-bold border border-purple-500/40">
                    {s.step}
                  </span>
                  {s.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">STEP {s.step}/9</span>
              </div>
              <p className="text-xs font-bold text-white pl-6">{s.instruction}</p>
              <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
          >
            Close Presenter Script
          </button>
        </div>
      </div>
    </div>
  );
};
