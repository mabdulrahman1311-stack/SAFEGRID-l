import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  CheckSquare, 
  Square, 
  X, 
  Sliders, 
  AlertCircle 
} from 'lucide-react';

interface EscalationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EscalationSettingsModal: React.FC<EscalationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { escalationConfig, updateEscalationConfig, contacts } = useSafeGrid();

  if (!isOpen) return null;

  const toggleTrigger = (key: keyof typeof escalationConfig.triggers) => {
    updateEscalationConfig({
      triggers: {
        ...escalationConfig.triggers,
        [key]: !escalationConfig.triggers[key],
      },
    });
  };

  const toggleContact = (contactId: string) => {
    const current = escalationConfig.selectedContactIds;
    const next = current.includes(contactId)
      ? current.filter(id => id !== contactId)
      : [...current, contactId];
    updateEscalationConfig({ selectedContactIds: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Safety Escalation Policy</h2>
              <p className="text-xs text-slate-400">Configure multi-stage verification & alert thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master ON/OFF Toggle */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Automatic Safety Escalation</span>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically contact your designated circle when safety checks expire without confirmation.
            </p>
          </div>
          <button
            onClick={() => updateEscalationConfig({ enabled: !escalationConfig.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              escalationConfig.enabled
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {escalationConfig.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Triggers Section */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Trigger Conditions (When to prompt safety verification):
          </label>
          <div className="space-y-2">
            {[
              { key: 'missedCheckIn' as const, label: 'Missed Check-in', desc: 'User does not acknowledge scheduled welfare prompt within window.' },
              { key: 'sosPressed' as const, label: 'SOS Button Pressed', desc: 'Direct SOS tapped; initiates 10s cancellation period.' },
              { key: 'overdueJourney' as const, label: 'Journey Overdue', desc: 'Target arrival time elapsed without arrival or extension.' },
              { key: 'unresponsivePrompt' as const, label: 'Route Deviation Unacknowledged', desc: 'Vehicle/pedestrian drifted >300m off safe corridor.' },
            ].map(trigger => {
              const active = escalationConfig.triggers[trigger.key];
              return (
                <div
                  key={trigger.key}
                  onClick={() => toggleTrigger(trigger.key)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    active
                      ? 'bg-slate-800/80 border-rose-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {active ? (
                      <CheckSquare className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{trigger.label}</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">{trigger.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Countdown Wait Period */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>How long should SAFEGRID wait before escalation?</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { sec: 30, label: '30s' },
              { sec: 60, label: '1 min' },
              { sec: 120, label: '2 min' },
              { sec: 300, label: '5 min' },
            ].map(opt => (
              <button
                key={opt.sec}
                onClick={() => updateEscalationConfig({ gracePeriodSeconds: opt.sec })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  escalationConfig.gracePeriodSeconds === opt.sec
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Who Should Be Contacted (Multi-selection) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Who should be contacted upon escalation?</span>
          </label>
          {contacts.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              No contacts in safety circle yet. Please add trusted contacts from the Circle tab.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contacts.map(c => {
                const isSelected = escalationConfig.selectedContactIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                      <div>
                        <span className="text-xs font-bold block">{c.name} ({c.relationship})</span>
                        <span className="text-[10px] text-slate-400">{c.phone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.approxLocation}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Done */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all"
          >
            Save Escalation Policy
          </button>
        </div>
      </div>
    </div>
  );
};
