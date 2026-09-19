import React, { useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Users, 
  Clock, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Filter, 
  Activity, 
  Lock,
  GitMerge,
  Search
} from 'lucide-react';

export const AdminCommandCenter: React.FC = () => {
  const { incidents, responders, responderUpdateStatus, safetyState } = useSafeGrid();
  const [filterType, setFilterType] = useState<string>('ALL');

  const activeCount = incidents.filter(i => i.state === 'EMERGENCY').length;
  const attentionCount = incidents.filter(i => i.state === 'ATTENTION').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const respondersOnline = responders.filter(r => r.isAvailable).length;

  const filteredIncidents = incidents.filter(inc => {
    if (filterType === 'ALL') return true;
    if (filterType === 'EMERGENCY') return inc.state === 'EMERGENCY';
    if (filterType === 'ATTENTION') return inc.state === 'ATTENTION';
    if (filterType === 'RESOLVED') return inc.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Admin Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Community Welfare &amp; Emergency Dispatch Console</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            SafeGrid City Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time welfare monitoring, progressive escalation engine, and privacy-preserving responder dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dispatch Engine Online</span>
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Active Emergencies
          </span>
          <p className="text-3xl font-black text-white mt-1">{activeCount}</p>
          <span className="text-[11px] text-slate-400">Immediate responder dispatch</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Attention Cases
          </span>
          <p className="text-3xl font-black text-white mt-1">{attentionCount}</p>
          <span className="text-[11px] text-slate-400">Grace verification active</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Responders Online
          </span>
          <p className="text-3xl font-black text-white mt-1">{respondersOnline} / {responders.length}</p>
          <span className="text-[11px] text-slate-400">Verified community layer</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Avg Response Time
          </span>
          <p className="text-3xl font-black text-white mt-1">3.4 min</p>
          <span className="text-[11px] text-slate-400">Sector 4 Community Grid</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            False Alarm Filter
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-1">91.4%</p>
          <span className="text-[11px] text-slate-400">Resolved via Attention grace</span>
        </div>
      </div>

      {/* Incident Correlation & Deduplication Box (Section 20 of master doc) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300">
            <GitMerge className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-white">
              Incident Correlation &amp; Deduplication Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Auto-clustering active
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          The engine correlates multi-source signals occurring in the same geographic quadrant and time window (e.g. 2 calls within 300m in 4 minutes) to prevent redundant community responder dispatches.
        </p>
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Sector 4 Transit Corridor: 2 reports correlated into Incident #SG-4089</span>
          </div>
          <span className="text-purple-400 font-semibold">1 Dispatch Assigned</span>
        </div>
      </div>

      {/* Privacy Map & Incident Table Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Privacy-Preserving Community Map */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <MapPin className="w-5 h-5" />
              <h2 className="font-bold text-sm text-white">Community Grid View</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quadrant Privacy</span>
            </div>
          </div>

          {/* Map canvas simulation */}
          <div className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
            {/* Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

            {/* Approximate Zone Clusters */}
            <div className="absolute top-1/4 left-1/3 p-3 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/80" />
              <span className="absolute -bottom-5 text-[9px] font-bold text-rose-300 whitespace-nowrap">
                Sector 3 (~18m precision)
              </span>
            </div>

            <div className="absolute bottom-1/4 right-1/4 p-4 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-amber-400" />
              <span className="absolute -bottom-5 text-[9px] font-bold text-amber-300 whitespace-nowrap">
                Sector 4 Transit (~24m)
              </span>
            </div>

            {/* Responder Location Markers */}
            <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-emerald-400 border border-white" title="Dr. Anita Roy (Available)" />
            <div className="absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full bg-emerald-400 border border-white" title="Ravi Kumar (Available)" />
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            * Coordinates are aggregated into privacy quadrants. Exact domicile coordinates are never broadcast to public dashboards.
          </div>
        </div>

        {/* Live Incident Dispatch Queue */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">Active Dispatch Queue</h2>
              <span className="text-xs text-slate-400">({filteredIncidents.length} incidents)</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('EMERGENCY')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'EMERGENCY' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Emergency
              </button>
              <button
                onClick={() => setFilterType('ATTENTION')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'ATTENTION' ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Attention
              </button>
              <button
                onClick={() => setFilterType('RESOLVED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="space-y-3 overflow-x-auto">
            {filteredIncidents.map(inc => (
              <div
                key={inc.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-800/40">
                      #{inc.id}
                    </span>
                    <h3 className="font-bold text-sm text-white">{inc.userName}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      inc.state === 'EMERGENCY'
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                        : inc.state === 'ATTENTION'
                        ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                        : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    }`}>
                      {inc.state}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">{inc.createdAt}</span>
                    <button
                      onClick={() => responderUpdateStatus(inc.id, 'RESOLVED')}
                      disabled={inc.status === 'RESOLVED'}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      {inc.status === 'RESOLVED' ? 'Resolved' : 'Mark Resolved'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-3">
                  <span className="font-semibold text-white">{inc.type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{inc.approximateArea}</span>
                  <span>•</span>
                  <span>Precision: ~{inc.locationPrecision}m</span>
                </div>

                <p className="text-[11px] text-slate-400">{inc.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
