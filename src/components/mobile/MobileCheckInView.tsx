import React, { useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  CheckCircle2, 
  Clock, 
  Heart, 
  AlertTriangle, 
  Bell, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Edit3,
  X,
  Pill,
  Sun,
  Moon,
  Briefcase,
  Shield
} from 'lucide-react';
import { CheckInSchedule } from '../../types';

export const MobileCheckInView: React.FC = () => {
  const { 
    checkins, 
    addCheckIn,
    updateCheckIn,
    deleteCheckIn,
    confirmCheckIn, 
    simulateMissedCheckIn, 
    currentUser 
  } = useSafeGrid();

  const [seniorHighContrast, setSeniorHighContrast] = useState(currentUser.isSeniorMode ?? false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckInSchedule | null>(null);

  // Form states
  const [label, setLabel] = useState('Morning Heart Medication & Tea');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM'>('DAILY');
  const [category, setCategory] = useState<'WELFARE' | 'MEDICATION' | 'CURFEW' | 'TRANSIT' | 'CUSTOM'>('MEDICATION');

  const handleOpenAdd = () => {
    setEditingCheckIn(null);
    setLabel('Morning Heart Medication & Tea');
    setScheduledTime('09:00 AM');
    setGracePeriodMinutes(15);
    setFrequency('DAILY');
    setCategory('MEDICATION');
    setShowAddModal(true);
  };

  const handleOpenEdit = (checkIn: CheckInSchedule) => {
    setEditingCheckIn(checkIn);
    setLabel(checkIn.label);
    setScheduledTime(checkIn.scheduledTime);
    setGracePeriodMinutes(checkIn.gracePeriodMinutes);
    setFrequency(checkIn.frequency || 'DAILY');
    setCategory(checkIn.category || 'WELFARE');
    setShowAddModal(true);
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !scheduledTime) return;

    if (editingCheckIn) {
      updateCheckIn(editingCheckIn.id, {
        label,
        scheduledTime,
        gracePeriodMinutes: Number(gracePeriodMinutes),
        frequency,
        category,
      });
    } else {
      addCheckIn({
        label,
        scheduledTime,
        gracePeriodMinutes: Number(gracePeriodMinutes),
        frequency,
        category,
      });
    }

    setShowAddModal(false);
  };

  const handleConfirm = (id: string) => {
    confirmCheckIn(id);
    setJustConfirmed(true);
    setTimeout(() => setJustConfirmed(false), 2500);
  };

  const pendingCheckIn = checkins.find(c => !c.isCompletedToday) || checkins[0];

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'MEDICATION':
        return <Pill className="w-4 h-4 text-rose-400" />;
      case 'WELFARE':
        return <Heart className="w-4 h-4 text-emerald-400" />;
      case 'CURFEW':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'TRANSIT':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div id="mobile-checkin-view-container" className={`p-4 space-y-4 pb-16 animate-in fade-in ${seniorHighContrast ? 'text-white' : ''}`}>
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Welfare Signal Schedule
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Scheduled Check-ins
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-senior-high-contrast"
            onClick={() => setSeniorHighContrast(prev => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title="Toggle high-contrast senior layout"
          >
            <span>Senior Mode</span>
            {seniorHighContrast ? (
              <ToggleRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            id="btn-open-add-checkin-modal"
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Confirmation Toast */}
      {justConfirmed && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-center font-bold text-sm shadow-xl animate-in zoom-in-95 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>Safety Signal Recorded &amp; Transmitted to Circle!</span>
        </div>
      )}

      {/* SENIOR CITIZEN "I'M OK" LARGE ACCESSIBILITY CARD */}
      {pendingCheckIn && (
        <div className={`rounded-3xl p-5 text-center border transition-all ${
          seniorHighContrast
            ? 'bg-slate-900 border-2 border-emerald-400/80 shadow-2xl ring-2 ring-emerald-500/20'
            : 'bg-slate-900/90 border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>ACTIVE WELFARE PROMPT</span>
          </div>

          <h3 className={`font-black text-white ${seniorHighContrast ? 'text-2xl' : 'text-lg'}`}>
            {pendingCheckIn.isCompletedToday ? 'All Clear for Now' : `Due: ${pendingCheckIn.scheduledTime} (${pendingCheckIn.label})`}
          </h3>
          
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {pendingCheckIn.isCompletedToday 
              ? 'Your Safety Circle has confirmed you are safe.'
              : 'Press below to notify family and confirm your safety signal.'}
          </p>

          {/* ENORMOUS "I'M OK" BUTTON */}
          <div className="my-4">
            <button
              id="btn-confirm-im-ok"
              onClick={() => handleConfirm(pendingCheckIn.id)}
              disabled={pendingCheckIn.isCompletedToday}
              className={`w-full py-5 rounded-2xl font-black tracking-tight text-white transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center ${
                pendingCheckIn.isCompletedToday
                  ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-default'
                  : seniorHighContrast
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-2xl shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xl shadow-emerald-950/80'
              }`}
            >
              <CheckCircle2 className={`mb-1 ${seniorHighContrast ? 'w-8 h-8 text-slate-950' : 'w-7 h-7 text-emerald-200'}`} />
              <span>{pendingCheckIn.isCompletedToday ? "CONFIRMED: I'M OK" : "I'M OK — CONFIRM SAFETY"}</span>
              <span className="text-[11px] font-semibold opacity-80 mt-0.5">
                {pendingCheckIn.isCompletedToday ? 'Safety signal active' : 'Tap to dispatch safe signal to circle'}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Grace Window: {pendingCheckIn.gracePeriodMinutes} mins
            </span>
            <span>
              {pendingCheckIn.lastRespondedAt || 'Pending response'}
            </span>
          </div>
        </div>
      )}

      {/* Daily Schedule Slots List with Edit & Delete */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Configured Check-in Slots ({checkins.length})
          </span>
          <span className="text-[11px] text-slate-500">Auto-notifies circle on delay</span>
        </div>

        {checkins.map(slot => (
          <div
            key={slot.id}
            id={`checkin-card-${slot.id}`}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                slot.isCompletedToday
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {getCategoryIcon(slot.category)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{slot.label}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-mono text-emerald-300 font-semibold">{slot.scheduledTime}</span>
                  <span>•</span>
                  <span>{slot.frequency || 'Daily'}</span>
                  <span>•</span>
                  <span>+{slot.gracePeriodMinutes}m grace</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {slot.isCompletedToday ? (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  Confirmed
                </span>
              ) : (
                <button
                  id={`btn-confirm-slot-${slot.id}`}
                  onClick={() => handleConfirm(slot.id)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                >
                  I&apos;m OK
                </button>
              )}

              <button
                id={`btn-edit-checkin-${slot.id}`}
                onClick={() => handleOpenEdit(slot)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Edit schedule"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                id={`btn-delete-checkin-${slot.id}`}
                onClick={() => deleteCheckIn(slot.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Delete schedule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation / Stress-Test Section */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-300">Test Missed Check-in Escalation</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Simulate missed signal &amp; audio prompt entering 🟡 ATTENTION state
          </p>
        </div>
        <button
          id="btn-test-missed-checkin"
          onClick={simulateMissedCheckIn}
          className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 font-semibold text-xs transition-colors shrink-0"
        >
          Simulate Missed
        </button>
      </div>

      {/* Add / Edit Check-in Modal */}
      {showAddModal && (
        <div 
          id="checkin-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editingCheckIn ? 'Edit Check-in Schedule' : 'New Welfare Check-in'}
              </h3>
              <button 
                id="btn-close-checkin-modal"
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckIn} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Routine Title / Label
                </label>
                <input
                  id="input-checkin-label"
                  type="text"
                  required
                  placeholder="e.g. Evening BP & Heart Medication"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Scheduled Time
                  </label>
                  <input
                    id="input-checkin-time"
                    type="text"
                    required
                    placeholder="e.g. 08:30 AM"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Grace Window
                  </label>
                  <select
                    id="select-checkin-grace"
                    value={gracePeriodMinutes}
                    onChange={e => setGracePeriodMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Frequency
                  </label>
                  <select
                    id="select-checkin-frequency"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKDAYS">Weekdays</option>
                    <option value="WEEKENDS">Weekends</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    id="select-checkin-category"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="MEDICATION">Medication</option>
                    <option value="WELFARE">Daily Welfare</option>
                    <option value="CURFEW">Curfew / Night Check</option>
                    <option value="TRANSIT">Commute / Transit</option>
                    <option value="CUSTOM">Custom Routine</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-checkin-submit"
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
