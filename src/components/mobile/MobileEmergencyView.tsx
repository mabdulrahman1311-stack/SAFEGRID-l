import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  ShieldAlert, 
  Phone, 
  UserCheck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';

export const MobileEmergencyView: React.FC = () => {
  const { 
    activeIncident, 
    contacts, 
    responders, 
    setSafetyState, 
    responderUpdateStatus,
    gpsPrecision 
  } = useSafeGrid();

  if (!activeIncident) return null;

  const assignedResponder = responders.find(r => r.id === activeIncident.assignedResponderId) || responders[0];

  const handleResolve = () => {
    responderUpdateStatus(activeIncident.id, 'RESOLVED');
    setSafetyState('SAFE');
  };

  return (
    <div className="p-4 space-y-4 pb-12 animate-in fade-in">
      {/* Emergency Header Banner */}
      <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 shadow-lg shadow-rose-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              ACTIVE EMERGENCY INCIDENT
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-900/60 px-2 py-0.5 rounded-lg border border-rose-700/50">
            #{activeIncident.id}
          </span>
        </div>

        <h3 className="text-lg font-black text-white mt-2 leading-tight">
          {activeIncident.type.replace(/_/g, ' ')}
        </h3>
        <p className="text-xs text-rose-200/80 mt-1">
          {activeIncident.notes || 'Emergency assistance protocol initiated.'}
        </p>

        {/* Automated Emergency Dispatch Escalation Banner if contacts not in vicinity */}
        {activeIncident.emergencyServiceInformed && (
          <div className="mt-3 p-3 bg-red-900/60 border border-red-500/70 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-300 animate-bounce" />
                Auto-Dispatched Emergency Agency
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500 text-white">
                ALERT TRANSMITTED
              </span>
            </div>
            <p className="text-xs font-bold text-white">
              {activeIncident.emergencyServiceInformed}
            </p>
            <p className="text-[11px] text-red-100/90 leading-tight">
              Notice: 0 Safety Circle contacts were in your nearest vicinity. The system automatically notified your profile&apos;s tailored emergency dispatch service with live GPS telemetry.
            </p>
          </div>
        )}

        {/* State Stepper */}
        <div className="mt-3.5 pt-3 border-t border-rose-800/40 grid grid-cols-4 gap-1 text-center">
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              ✓
            </span>
            <span className="text-[9px] font-medium text-rose-200 mt-1">Triggered</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              ✓
            </span>
            <span className="text-[9px] font-medium text-rose-200 mt-1">Circle Notified</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              activeIncident.status === 'EN_ROUTE' || activeIncident.status === 'ARRIVED' || activeIncident.status === 'RESOLVED'
                ? 'bg-rose-500 text-slate-950'
                : 'bg-rose-900 text-rose-300 animate-pulse'
            }`}>
              3
            </span>
            <span className="text-[9px] font-medium text-rose-200 mt-1">Responder</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              activeIncident.status === 'RESOLVED'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-500'
            }`}>
              4
            </span>
            <span className="text-[9px] font-medium text-slate-400 mt-1">Resolved</span>
          </div>
        </div>
      </div>

      {/* Assigned Community Responder Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Verified Community Responder
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {activeIncident.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <img
            src={assignedResponder.avatar}
            alt={assignedResponder.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-white truncate">{assignedResponder.name}</h4>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400">{assignedResponder.specialization}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-rose-400">
                <MapPin className="w-3.5 h-3.5" />
                {activeIncident.assignedResponderDistance || '0.8 km away'}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                ETA: {activeIncident.assignedResponderETA || '3 mins'}
              </span>
            </div>
          </div>
        </div>

        {/* Responder contact actions */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800">
          <a
            href={`tel:${assignedResponder.phone}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Responder</span>
          </a>
          <button
            onClick={() => responderUpdateStatus(activeIncident.id, 'EN_ROUTE')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <span>Simulate En Route</span>
          </button>
        </div>
      </div>

      {/* Safety Circle Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Safety Circle Alert Status
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">
            {contacts.length} Contacts Notified
          </span>
        </div>

        <div className="space-y-2">
          {contacts.slice(0, 3).map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-slate-200 truncate">{contact.name}</p>
                  <p className="text-[10px] text-slate-400">{contact.relationship}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40 shrink-0">
                SMS Delivered
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Location Privacy Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Encrypted stream • Precision: ~{gpsPrecision}m</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">ID: {activeIncident.id}</span>
      </div>

      {/* Resolution & False Alarm Button */}
      <div className="pt-2">
        <button
          id="btn-resolve-emergency"
          onClick={handleResolve}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          <span>ASSISTANCE RECEIVED — RESOLVE INCIDENT</span>
        </button>
      </div>
    </div>
  );
};
