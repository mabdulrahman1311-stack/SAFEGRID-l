import React, { useState, useEffect, useRef } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Send, 
  Layers, 
  Code2, 
  Terminal, 
  Activity, 
  Play, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Server,
  Smartphone
} from 'lucide-react';
import { ApkExportModal } from '../modals/ApkExportModal';

interface ServerState {
  safetyState: 'SAFE' | 'ATTENTION' | 'EMERGENCY';
  checkIn: {
    scheduled: boolean;
    status: string;
    time: string;
  };
  journey: {
    active: boolean;
    status: string;
    destination: string;
    origin?: string;
    expectedArrival: string;
  };
  incident: {
    id: string;
    state: string;
    type: string;
    location: string;
    createdAt: string;
    responder?: {
      name: string;
      distance: string;
      phone?: string;
      badgeId?: string;
    } | null;
  } | null;
  activity: Array<{
    id: string;
    time: string;
    text: string;
    type?: string;
  }>;
}

interface ApiLog {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  response: unknown;
}

export const QuickTestConsole: React.FC = () => {
  const { 
    setSafetyState, 
    setIncidents, 
    safetyState: contextSafetyState 
  } = useSafeGrid();

  const [activeTab, setActiveTab] = useState<'home' | 'journey' | 'responder' | 'api-inspector'>('home');
  const [serverState, setServerState] = useState<ServerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinTimeInput, setCheckinTimeInput] = useState('09:30 AM');
  const [destinationInput, setDestinationInput] = useState('City Library, Sector 4');
  const [arrivalInput, setArrivalInput] = useState('08:15 PM');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showApkModal, setShowApkModal] = useState(false);

  const logApiCall = (method: string, url: string, status: number, durationMs: number, response: unknown) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setApiLogs(prev => [
      { timestamp: timeStr, method, url, status, durationMs, response },
      ...prev.slice(0, 19)
    ]);
  };

  const callApi = async (url: string, options: RequestInit = {}) => {
    const startTime = performance.now();
    setLoading(true);
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);
      logApiCall(options.method || 'GET', url, res.status, durationMs, data);

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      // If response includes state or is state
      const newState: ServerState = data.state || data;
      if (newState.safetyState) {
        setServerState(newState);
        // Sync with React Context
        setSafetyState(newState.safetyState);
      }
      return data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Error: ${errMsg}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      const data = await callApi('/api/state');
      setServerState(data);
      if (data.safetyState) {
        setSafetyState(data.safetyState);
      }
    } catch {
      // Fallback
    }
  };

  // Initial fetch and window helpers binding
  useEffect(() => {
    refresh();

    // Bind window globals so any script or automated tests matching the user snippet can execute natively
    const win = window as unknown as Record<string, unknown>;
    win.api = callApi;
    win.refresh = refresh;
    win.sendSOS = async () => {
      await callApi('/api/sos', { method: 'POST' });
      setActiveTab('responder');
    };
    win.escalate = async () => {
      await callApi('/api/escalate', { method: 'POST' });
      setActiveTab('responder');
    };
    win.assignResponder = async () => {
      await callApi('/api/responders/assign', { method: 'POST' });
      setActiveTab('responder');
    };
    win.resolveIncident = async () => {
      await callApi('/api/incident/resolve', { method: 'POST' });
      setActiveTab('home');
    };
    win.resetDemo = async () => {
      await callApi('/api/reset', { method: 'POST' });
      setActiveTab('home');
    };
    win.completeCheckin = async () => {
      await callApi('/api/checkin/complete', { method: 'POST' });
    };
    win.simulateMissedCheckin = async () => {
      await callApi('/api/checkin/missed', { method: 'POST' });
    };
    win.completeJourney = async () => {
      await callApi('/api/journey/arrived', { method: 'POST' });
    };
    win.simulateMissedJourney = async () => {
      await callApi('/api/journey/missed', { method: 'POST' });
    };
  }, []);

  // Poll state every 4s to keep in sync with any mobile app changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/state')
        .then(r => r.json())
        .then(data => {
          if (data && data.safetyState) {
            setServerState(data);
          }
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const s = serverState || {
    safetyState: 'SAFE',
    checkIn: { scheduled: true, status: 'SCHEDULED', time: '09:00 AM' },
    journey: { active: false, status: 'NONE', destination: 'City Center', expectedArrival: '08:00 PM' },
    incident: null,
    activity: []
  };

  const handleSendSOS = async () => {
    await callApi('/api/sos', { method: 'POST' });
    setActiveTab('responder');
    setStatusMessage('🔴 Emergency SOS sent to server. Incident created.');
  };

  const handleScheduleCheckin = async () => {
    if (!checkinTimeInput) return;
    await callApi('/api/checkin', {
      method: 'POST',
      body: JSON.stringify({ time: checkinTimeInput })
    });
    setIsCheckinModalOpen(false);
    setStatusMessage(`🕒 Check-in scheduled for ${checkinTimeInput}`);
  };

  const handleCompleteCheckin = async () => {
    await callApi('/api/checkin/complete', { method: 'POST' });
    setIsCheckinModalOpen(false);
    setStatusMessage('✅ Check-in completed successfully.');
  };

  const handleSimulateMissedCheckin = async () => {
    await callApi('/api/checkin/missed', { method: 'POST' });
    setStatusMessage('🟡 Demo: Check-in missed. SAFE → ATTENTION.');
  };

  const handleStartJourney = async () => {
    if (!destinationInput || !arrivalInput) return;
    await callApi('/api/journey/start', {
      method: 'POST',
      body: JSON.stringify({ destination: destinationInput, expectedArrival: arrivalInput })
    });
    setStatusMessage(`🛣️ Commute to ${destinationInput} started.`);
  };

  const handleCompleteJourney = async () => {
    await callApi('/api/journey/arrived', { method: 'POST' });
    setStatusMessage('🏁 Safe arrival verified.');
  };

  const handleSimulateMissedJourney = async () => {
    await callApi('/api/journey/missed', { method: 'POST' });
    setStatusMessage('🟡 Demo: Expected arrival missed. SAFE → ATTENTION.');
  };

  const handleExtendJourney = async () => {
    await callApi('/api/journey/extend', {
      method: 'POST',
      body: JSON.stringify({ minutes: 15 })
    });
    setStatusMessage('⏱️ Journey extended by +15m. False alarm avoided.');
  };

  const handleEscalate = async () => {
    await callApi('/api/escalate', { method: 'POST' });
    setActiveTab('responder');
    setStatusMessage('🚨 Escalated to EMERGENCY responder queue.');
  };

  const handleAssignResponder = async () => {
    await callApi('/api/responders/assign', { method: 'POST' });
    setActiveTab('responder');
    setStatusMessage('🚑 Verified Responder assigned.');
  };

  const handleResolveIncident = async () => {
    await callApi('/api/incident/resolve', { method: 'POST' });
    setActiveTab('home');
    setStatusMessage('🟢 Incident resolved. State returned to SAFE.');
  };

  const handleResetDemo = async () => {
    await callApi('/api/reset', { method: 'POST' });
    setActiveTab('home');
    setStatusMessage('🔄 Server state reset to default.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>Full-Stack REST Backend &amp; Live API Console</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            SAFEGRID API Server &amp; Interactive Controller
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live Express backend running on port 3000. Test the exact REST endpoints (<code className="text-rose-300 font-mono">/api/state</code>, <code className="text-rose-300 font-mono">/api/sos</code>, <code className="text-rose-300 font-mono">/api/checkin</code>, <code className="text-rose-300 font-mono">/api/journey/*</code>, <code className="text-rose-300 font-mono">/api/responders/assign</code>) in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
            <span>Android APK Packager</span>
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync / Refresh</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Temporary Toast Banner if action performed */}
      {statusMessage && (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs flex items-center justify-between text-slate-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Bar matching the user's data-view buttons */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            data-view="home"
            onClick={() => setActiveTab('home')}
            className={`nav px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'home'
                ? 'active bg-slate-800 text-white border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Home &amp; Dashboard</span>
          </button>

          <button
            data-view="journey"
            onClick={() => setActiveTab('journey')}
            className={`nav px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'journey'
                ? 'active bg-slate-800 text-blue-400 border border-blue-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Journey Manager</span>
          </button>

          <button
            data-view="responder"
            onClick={() => setActiveTab('responder')}
            className={`nav px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'responder'
                ? 'active bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Responder &amp; Incidents</span>
          </button>

          <button
            onClick={() => setActiveTab('api-inspector')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'api-inspector'
                ? 'bg-slate-800 text-purple-400 border border-purple-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>API Log Inspector ({apiLogs.length})</span>
          </button>
        </div>

        {/* Global Live Top Status Indicator (ID: topStatus) */}
        <div
          id="topStatus"
          style={{
            background: s.safetyState === 'SAFE' ? '#064e3b' : s.safetyState === 'ATTENTION' ? '#78350f' : '#881337',
            color: s.safetyState === 'SAFE' ? '#34d399' : s.safetyState === 'ATTENTION' ? '#fbbf24' : '#fb7185'
          }}
          className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/10 flex items-center gap-1.5 shadow-sm"
        >
          <span>●</span>
          <span>{s.safetyState}</span>
        </div>
      </div>

      {/* VIEW 1: HOME & DASHBOARD (ID: home) */}
      {activeTab === 'home' && (
        <div id="home" className="view active-view space-y-6">
          {/* Main State Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Safety State
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    id="stateText"
                    className={`text-3xl font-black ${
                      s.safetyState === 'SAFE' ? 'text-emerald-400' : s.safetyState === 'ATTENTION' ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {s.safetyState}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    s.safetyState === 'SAFE' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                    s.safetyState === 'ATTENTION' ? 'bg-amber-950 text-amber-400 border-amber-500/30' :
                    'bg-rose-950 text-rose-400 border-rose-500/30'
                  }`}>
                    Authoritative Backend Node
                  </span>
                </div>
                <p id="stateMessage" className="text-sm text-slate-300 mt-2">
                  {s.safetyState === 'SAFE'
                    ? 'You are currently safe. No active incidents.'
                    : s.safetyState === 'ATTENTION'
                    ? 'A safety signal needs verification.'
                    : 'An emergency incident is active. Responder coordination is in progress.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-trigger-sos"
                  onClick={handleSendSOS}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>SEND SOS (POST /api/sos)</span>
                </button>

                <button
                  onClick={() => setIsCheckinModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Check-in Modal</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Scheduled Check-in</span>
                <p id="checkinText" className="text-sm font-bold text-white mt-1">
                  {s.checkIn.scheduled ? `${s.checkIn.status} • ${s.checkIn.time}` : 'No active check-in'}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleCompleteCheckin}
                    className="text-[11px] text-emerald-400 hover:underline font-semibold"
                  >
                    Complete Check-in
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={handleSimulateMissedCheckin}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Simulate Missed
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Active Journey</span>
                <p id="journeyText" className="text-sm font-bold text-white mt-1">
                  {s.journey.active
                    ? `${s.journey.status} • ${s.journey.destination}`
                    : s.journey.status === 'COMPLETED'
                    ? 'Journey completed'
                    : 'No active journey'}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setActiveTab('journey')}
                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                  >
                    Open Journey Controls
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Active Incidents</span>
                <p id="activeIncidents" className="text-2xl font-black text-rose-400 mt-1">
                  {s.incident && s.incident.state !== 'RESOLVED' ? '1' : '0'}
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setActiveTab('responder')}
                    className="text-[11px] text-rose-400 hover:underline font-semibold"
                  >
                    View Dispatch Console
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log (ID: activity) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">System Activity Stream (GET /api/state)</h3>
              </div>
              <span className="text-xs text-slate-400">Latest 6 events</span>
            </div>

            <div id="activity" className="space-y-2">
              {s.activity.slice(0, 6).map(act => (
                <div
                  key={act.id}
                  className="activity p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <b className="font-mono text-slate-400 shrink-0">{act.time}</b>
                  <span className="text-slate-200">{act.text}</span>
                </div>
              ))}
              {s.activity.length === 0 && (
                <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: JOURNEY VIEW (ID: journey) */}
      {activeTab === 'journey' && (
        <div id="journey" className="view active-view space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Journey Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Start Safe Journey</h3>
              </div>
              <p className="text-xs text-slate-400">
                Calls <code className="text-blue-300 font-mono">POST /api/journey/start</code> with destination and arrival time.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Destination</label>
                  <input
                    id="destination"
                    type="text"
                    value={destinationInput}
                    onChange={e => setDestinationInput(e.target.value)}
                    placeholder="e.g. City Library or Home"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Arrival</label>
                  <input
                    id="arrival"
                    type="text"
                    value={arrivalInput}
                    onChange={e => setArrivalInput(e.target.value)}
                    placeholder="e.g. 08:30 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleStartJourney}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Journey</span>
                  </button>

                  <button
                    onClick={handleCompleteJourney}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete (Arrived)</span>
                  </button>

                  <button
                    onClick={handleSimulateMissedJourney}
                    className="px-3 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Simulate Overdue</span>
                  </button>

                  <button
                    onClick={handleExtendJourney}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    <span>+15m ETA Extension</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Journey Panel (ID: journeyPanel) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Journey Telemetry State
              </span>
              <div id="journeyPanel" className="space-y-4">
                {s.journey.status === 'NONE' ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
                    <h3 className="font-bold text-white text-sm">No active journey</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Start a safe journey and set an expected arrival time to enable proactive route verification.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>🛣️</span>
                        <span>{s.journey.status}</span>
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        s.journey.status === 'ACTIVE'
                          ? 'bg-blue-950 text-blue-400 border-blue-500/30'
                          : s.journey.status === 'OVERDUE'
                          ? 'bg-amber-950 text-amber-400 border-amber-500/30 animate-pulse'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {s.journey.status}
                      </span>
                    </div>

                    <div className="journey-detail grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <small className="text-slate-400 block text-[10px]">Destination</small>
                        <b className="text-white text-sm block mt-0.5">{s.journey.destination || '-'}</b>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <small className="text-slate-400 block text-[10px]">Expected Arrival</small>
                        <b className="text-amber-400 text-sm block mt-0.5">{s.journey.expectedArrival || '-'}</b>
                      </div>
                    </div>

                    {s.journey.status === 'OVERDUE' && (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                        ⚠️ Overdue trigger active. Safety State set to ATTENTION with 10-minute grace period.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: RESPONDER & INCIDENT VIEW (ID: responder) */}
      {activeTab === 'responder' && (
        <div id="responder" className="view active-view space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Active Emergency &amp; Welfare Incidents</h3>
                <p className="text-xs text-slate-400">
                  Manage progressive escalation: ATTENTION → EMERGENCY → ASSIGNED → RESOLVED
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEscalate}
                  className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-900 transition-colors"
                >
                  Force Escalate
                </button>
              </div>
            </div>

            {/* Incident Panel (ID: incidentPanel) */}
            <div id="incidentPanel" className="space-y-4">
              {!s.incident ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-white text-sm">No active incident</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When a safety signal requires escalation, the incident will appear here. Trigger SOS or simulate a missed signal to view.
                  </p>
                </div>
              ) : (
                <div className="incident p-5 bg-slate-950 rounded-2xl border-2 border-rose-500/40 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="badge px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {s.incident.state}
                    </span>
                    <span className="font-mono text-xs text-slate-400">#{s.incident.id}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">{s.incident.type}</h3>
                    <p className="muted text-xs text-slate-400 mt-1 leading-relaxed">
                      Incident ID: <span className="font-mono text-slate-300">{s.incident.id}</span><br />
                      Location: <span className="text-slate-300">{s.incident.location}</span><br />
                      Created: <span className="text-slate-300">{s.incident.createdAt}</span>
                    </p>
                  </div>

                  {s.incident.responder && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Assigned Responder</span>
                        <p className="text-white font-bold mt-0.5">
                          {s.incident.responder.name} ({s.incident.responder.distance})
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        EN ROUTE
                      </span>
                    </div>
                  )}

                  <div className="incident-actions flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                    {s.incident.state === 'ATTENTION' && (
                      <button
                        onClick={handleEscalate}
                        className="primary px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
                      >
                        Escalate to Emergency
                      </button>
                    )}

                    {s.incident.state === 'EMERGENCY' && (
                      <button
                        onClick={handleAssignResponder}
                        className="primary px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Accept / Assign Responder</span>
                      </button>
                    )}

                    {s.incident.state === 'RESPONDER ASSIGNED' && (
                      <button
                        onClick={handleResolveIncident}
                        className="primary px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Assisted &amp; Resolved</span>
                      </button>
                    )}

                    {s.incident.state === 'RESOLVED' && (
                      <span className="online px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Incident Resolved</span>
                      </span>
                    )}

                    <button
                      onClick={handleResolveIncident}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all ml-auto"
                    >
                      Clear / Close Incident
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: API LOG INSPECTOR */}
      {activeTab === 'api-inspector' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Live HTTP Telemetry &amp; REST Logs</h3>
              </div>
              <button
                onClick={() => setApiLogs([])}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear Logs
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
              {apiLogs.map((log, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'GET' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {log.method}
                      </span>
                      <span className="text-white font-bold">{log.url}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{log.durationMs}ms</span>
                      <span className="text-emerald-400">HTTP {log.status}</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                  <pre className="text-[11px] text-slate-400 overflow-x-auto p-2 bg-slate-900/60 rounded">
                    {JSON.stringify(log.response, null, 2)}
                  </pre>
                </div>
              ))}
              {apiLogs.length === 0 && (
                <p className="text-xs text-slate-500 italic p-4 text-center">No API calls recorded yet. Click any action button to test.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHECKIN MODAL (ID: checkinModal) */}
      {isCheckinModalOpen && (
        <div
          id="checkinModal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm show"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Schedule Welfare Check-in</h3>
            <p className="text-xs text-slate-400">
              Calls <code className="text-rose-300 font-mono">POST /api/checkin</code> to register a periodic safety confirmation slot.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Check-in Time</label>
              <input
                id="checkinTime"
                type="text"
                value={checkinTimeInput}
                onChange={e => setCheckinTimeInput(e.target.value)}
                placeholder="e.g. 09:30 AM"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCheckin}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/40 transition-colors"
              >
                Save Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android APK & WebAPK Package Builder Modal */}
      {showApkModal && (
        <ApkExportModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
      )}
    </div>
  );
};
