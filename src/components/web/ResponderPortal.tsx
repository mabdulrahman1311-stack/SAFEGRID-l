import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  UserCheck, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const ResponderPortal: React.FC = () => {
  const { 
    activeResponder, 
    incidents, 
    responderUpdateStatus, 
    reassignResponder 
  } = useSafeGrid();

  const assignedIncident = incidents.find(i => i.assignedResponderId === activeResponder.id && i.status !== 'RESOLVED');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      {/* Responder Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activeResponder.avatar}
            alt={activeResponder.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{activeResponder.name}</h1>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <UserCheck className="w-3.5 h-3.5" />
                VERIFIED RESPONDER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Badge: <span className="font-mono text-slate-300">{activeResponder.badgeId}</span> • {activeResponder.specialization}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span>⭐ {activeResponder.rating} Rating</span>
              <span>•</span>
              <span>{activeResponder.totalAssists} Community Assists</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for Dispatch</span>
          </span>
        </div>
      </div>

      {/* Active Incident Broadcast / Assignment Card */}
      {assignedIncident ? (
        <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 shadow-2xl shadow-rose-950/40 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                DISPATCHED COMMUNITY INCIDENT
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-rose-400">
              #{assignedIncident.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">Citizen in Need</span>
              <h2 className="text-lg font-black text-white">{assignedIncident.userName}</h2>
              <p className="text-xs text-slate-300">{assignedIncident.notes}</p>
            </div>

            <div className="space-y-1 md:text-right">
              <span className="text-xs font-semibold text-slate-400">Dispatch Location</span>
              <p className="text-sm font-bold text-white flex md:justify-end items-center gap-1 text-rose-400">
                <MapPin className="w-4 h-4" />
                {assignedIncident.approximateArea}
              </p>
              <span className="text-xs text-slate-400 block">
                Distance: <strong className="text-white">{assignedIncident.assignedResponderDistance || '0.8 km'}</strong> • ETA: <strong className="text-amber-400">{assignedIncident.assignedResponderETA || '3 mins'}</strong>
              </span>
            </div>
          </div>

          {/* Incident Matching Score (Rule-based explainability) */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Matching Criterion: <strong>Medical Certified &amp; Closest Available (0.8km)</strong></span>
            </div>
            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              98% Match
            </span>
          </div>

          {/* Interactive State Machine Action Buttons */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Current Lifecycle State: <strong className="text-white">{assignedIncident.status}</strong>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => responderUpdateStatus(assignedIncident.id, 'EN_ROUTE')}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  assignedIncident.status === 'EN_ROUTE'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>1. MARK EN ROUTE</span>
              </button>

              <button
                onClick={() => responderUpdateStatus(assignedIncident.id, 'ARRIVED')}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  assignedIncident.status === 'ARRIVED'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>2. MARK ARRIVED</span>
              </button>

              <button
                onClick={() => responderUpdateStatus(assignedIncident.id, 'RESOLVED')}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>3. RESOLVE ASSIST</span>
              </button>
            </div>

            {/* Failover Reassignment Trigger (Section 18 & 19 of master doc) */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => reassignResponder(assignedIncident.id)}
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                title="Test system behavior when responder is unable to fulfill"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Simulate Responder Decline / Reassign Next</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No Pending Dispatches</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You are currently on standby for Sector 4. The SAFEGRID matching engine will alert you if an emergency or high-risk welfare concern arises nearby.
          </p>
        </div>
      )}
    </div>
  );
};
