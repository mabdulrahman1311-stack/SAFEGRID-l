import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  Clock, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  User, 
  Cpu, 
  ArrowRight,
  Database
} from 'lucide-react';

export const MobileTimelineView: React.FC = () => {
  const { incidents, offlineQueue, isOnline } = useSafeGrid();

  const allEvents = incidents.flatMap(inc => 
    inc.events.map(evt => ({ ...evt, incidentId: inc.id, incidentType: inc.type }))
  );

  return (
    <div className="p-4 space-y-4 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
            Audit Trail
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Signal History
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Database className="w-3.5 h-3.5 text-rose-400" />
          <span>Immutable Log</span>
        </div>
      </div>

      {/* Offline Event Queue Demonstration Box (Sections 12 & 13) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
            <h3 className="text-xs font-bold text-white">
              Local Event Queue ({offlineQueue.length} items)
            </h3>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isOnline ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
          }`}>
            {isOnline ? 'Online / Synced' : 'Queued Locally'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-3">
          When offline, user safety signals (e.g. check-ins, SOS) are preserved locally and submitted with dual timestamps (created vs synced) once restored.
        </p>

        {offlineQueue.length > 0 ? (
          <div className="space-y-2">
            {offlineQueue.map(item => (
              <div key={item.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-rose-300 font-bold">{item.eventType}</span>
                  <span className={item.status === 'SYNCED' ? 'text-emerald-400' : 'text-amber-400'}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[10px]">
                  <span>Created: {item.createdAt}</span>
                  {item.syncedAt && <span>Synced: {item.syncedAt}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
            Queue empty • All events synced to SAFEGRID server
          </div>
        )}
      </div>

      {/* Timeline of System & User Signals */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block">
          Recent Safety Events
        </span>

        {allEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No active incident signals logged.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {allEvents.slice(0, 8).map(evt => (
              <div key={evt.id} className="relative">
                <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  evt.type === 'escalation'
                    ? 'bg-amber-400'
                    : evt.type === 'user'
                    ? 'bg-rose-500'
                    : evt.type === 'responder'
                    ? 'bg-emerald-400'
                    : 'bg-blue-400'
                }`} />

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-white">{evt.title}</span>
                    <span className="text-slate-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300">{evt.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      {evt.type === 'system' ? <Cpu className="w-3 h-3 text-blue-400" /> : <User className="w-3 h-3 text-emerald-400" />}
                      Actor: {evt.actor}
                    </span>
                    <span className="font-mono text-slate-500">#{evt.incidentId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
