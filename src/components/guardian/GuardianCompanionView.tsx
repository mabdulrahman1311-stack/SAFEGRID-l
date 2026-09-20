import React, { useState, useEffect } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Battery, 
  Radio, 
  AlertTriangle, 
  ExternalLink,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Compass
} from 'lucide-react';
import { formatCoordinates, resolveLocationName } from '../../utils/geolocation';

export const GuardianCompanionView: React.FC = () => {
  const { 
    currentUser, 
    safetyState, 
    activeIncident, 
    liveCoords, 
    batteryLevel, 
    responderUpdateStatus, 
    setSafetyState,
    setViewMode,
    triggerEmergencyIncident,
    resetAllToDefault,
    setCustomLocation,
    isDemoMode,
    demoConfig,
    runDemoStep
  } = useSafeGrid();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'STANDBY' | 'RESPONDING' | 'ARRIVED'>('STANDBY');
  const [demoAlert, setDemoAlert] = useState<{
    userName: string;
    friendName: string;
    reason: string;
    batteryLevel: number | null;
    location: string;
    timestamp: string;
    status: string;
  } | null>(null);
  const [showDemoJourneyModal, setShowDemoJourneyModal] = useState(false);
  const [simulatedCallActive, setSimulatedCallActive] = useState(false);

  // Parse location and user metadata from URL query parameters (sent via QR or SMS)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const pLat = params.get('lat');
        const pLng = params.get('lng');
        if (pLat && pLng) {
          const latNum = parseFloat(pLat);
          const lngNum = parseFloat(pLng);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            const pLoc = params.get('loc') || undefined;
            const pArea = params.get('area') || undefined;
            setCustomLocation({
              lat: latNum,
              lng: lngNum,
              locationName: pLoc,
              approximateArea: pArea,
              isRealGps: true,
            });
          }
        }
      } catch {
        // ignore param errors
      }
    }
  }, []);

  // Poll backend state every 3s to reflect changes triggered from the user's phone in real time
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.safetyState && data.safetyState !== safetyState) {
            setSafetyState(data.safetyState);
          }
          if (data.location && data.location.latitude && data.location.longitude) {
            if (
              Math.abs(data.location.latitude - liveCoords.lat) > 0.0001 ||
              Math.abs(data.location.longitude - liveCoords.lng) > 0.0001
            ) {
              setCustomLocation({
                lat: data.location.latitude,
                lng: data.location.longitude,
                locationName: data.location.locationName,
                approximateArea: data.location.approximateArea,
              });
            }
          }
        }
      } catch {
        // network polling fallback
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [safetyState, liveCoords.lat, liveCoords.lng]);

  // Poll backend demo state every 2.5s for seamless Phone A <-> Phone B demo sync
  useEffect(() => {
    const pollDemoState = async () => {
      try {
        const res = await fetch('/api/demo/state');
        if (res.ok) {
          const data = await res.json();
          if (data.alert) {
            setDemoAlert(data.alert);
          } else {
            setDemoAlert(null);
          }
        }
      } catch {
        // network polling fallback
      }
    };
    pollDemoState();
    const interval = setInterval(pollDemoState, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeDemoAlert = async () => {
    try {
      await fetch('/api/demo/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: demoConfig.friendName || 'Rahul' })
      });
      setDemoAlert(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' } : null);
      runDemoStep('FRIEND_ACKNOWLEDGE');
    } catch (err) {
      console.error('Failed to acknowledge demo alert:', err);
    }
  };

  const handleResolveDemoAlert = async () => {
    try {
      await fetch('/api/demo/resolve', { method: 'POST' });
      setDemoAlert(null);
      runDemoStep('RESOLVE_SAFE');
    } catch (err) {
      console.error('Failed to resolve demo alert:', err);
    }
  };

  // Coordinates priority: active incident coordinates > liveCoords
  const effLat = activeIncident?.latitude ?? liveCoords.lat;
  const effLng = activeIncident?.longitude ?? liveCoords.lng;
  const effLoc = activeIncident?.locationName ?? liveCoords.locationName ?? resolveLocationName(effLat, effLng).locationName;
  const effArea = activeIncident?.approximateArea ?? liveCoords.approximateArea ?? resolveLocationName(effLat, effLng).approximateArea;

  // Trigger web audio buzzer if emergency is triggered
  useEffect(() => {
    if (safetyState === 'EMERGENCY' && soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch {
        // AudioContext not allowed before user gesture
      }
    }
  }, [safetyState, soundEnabled]);

  const mapsUrl = `https://maps.google.com/?q=${effLat.toFixed(5)},${effLng.toFixed(5)}`;

  const handleAcceptDispatch = () => {
    setFriendStatus('RESPONDING');
    if (activeIncident) {
      responderUpdateStatus(activeIncident.id, 'EN_ROUTE');
    }
  };

  const handleMarkArrived = () => {
    setFriendStatus('ARRIVED');
    if (activeIncident) {
      responderUpdateStatus(activeIncident.id, 'ARRIVED');
    }
  };

  const handleResolve = () => {
    setFriendStatus('STANDBY');
    if (activeIncident) {
      responderUpdateStatus(activeIncident.id, 'RESOLVED');
    }
    setSafetyState('SAFE');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">Guardian Live Companion</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                PHONE PAIRED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Receiving live welfare telemetry for <strong className="text-slate-200">{currentUser.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="Toggle Emergency Alarm Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setViewMode('MOBILE')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span>Switch to Protected User</span>
          </button>
        </div>
      </div>

      {/* DEMO MODE FRIEND SAFETY ALERT CARD (Part 13 Specification) */}
      {(demoAlert || (isDemoMode && demoConfig.currentStep !== 'IDLE')) && (
        <div className="bg-slate-900 border-2 border-purple-500 rounded-3xl p-6 shadow-2xl shadow-purple-950/70 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                DEMO MODE • FRIEND SAFETY ALERT
              </span>
            </div>
            <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800">
              {demoAlert?.status || (demoConfig.currentStep === 'FRIEND_ACKNOWLEDGE' ? 'ACKNOWLEDGED' : 'NEEDS ASSISTANCE')}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>{demoConfig.userName || 'Alex'} may need assistance</span>
            </h2>
            <p className="text-xs text-purple-200/90">
              {demoAlert?.reason || 'Check-in missed; safety check grace period expired without user cancellation.'}
            </p>
          </div>

          {/* Core Telemetry Display as specified in Part 13 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium block">Journey</span>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">College → Home</span>
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium block">Status</span>
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Check-in missed</span>
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium block">Location</span>
              <p className="text-xs font-mono font-bold text-emerald-400 truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{effLoc || 'Transit Corridor'}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium block">Battery</span>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{demoAlert?.batteryLevel ?? demoConfig.demoBatteryLevel}%</span>
              </p>
            </div>
          </div>

          {/* Action Buttons for Friend (Part 13 Actions) */}
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => setShowDemoJourneyModal(prev => !prev)}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/60 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>{showDemoJourneyModal ? 'HIDE JOURNEY' : 'VIEW JOURNEY'}</span>
              </button>

              <button
                onClick={handleAcknowledgeDemoAlert}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                  demoAlert?.status === 'ACKNOWLEDGED' || demoConfig.currentStep === 'FRIEND_ACKNOWLEDGE'
                    ? 'bg-emerald-700 text-emerald-100 border border-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {demoAlert?.status === 'ACKNOWLEDGED' || demoConfig.currentStep === 'FRIEND_ACKNOWLEDGE'
                    ? 'ACKNOWLEDGED'
                    : 'ACKNOWLEDGE ALERT'}
                </span>
              </button>

              <a
                href={`tel:${currentUser.phone || '+15550198822'}`}
                onClick={() => setSimulatedCallActive(true)}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/60 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>CALL {(demoConfig.userName || 'Alex').toUpperCase()}</span>
              </a>
            </div>

            {/* Expanded Journey Details */}
            {showDemoJourneyModal && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>Demo Commute Route: College to Home</span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Departure: <strong>College Campus</strong> (18:30)</div>
                  <div>Destination: <strong>Home Residence</strong> (19:15)</div>
                  <div>Live GPS: <strong>{effLat.toFixed(5)}, {effLng.toFixed(5)}</strong></div>
                  <div>Safety Check Grace: <strong>Expired</strong></div>
                </div>
              </div>
            )}

            {/* Simulated Call Notification */}
            {simulatedCallActive && (
              <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-2xl text-xs text-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400 animate-bounce" />
                  <span>Dialing {demoConfig.userName || 'Alex'} ({currentUser.phone || '+15550198822'})...</span>
                </div>
                <button
                  onClick={() => setSimulatedCallActive(false)}
                  className="px-2 py-1 rounded-lg bg-purple-800 hover:bg-purple-700 text-[10px] font-bold"
                >
                  End Call
                </button>
              </div>
            )}

            {/* Resolve Demo Event */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleResolveDemoAlert}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Friend Confirmed Safe (Resolve Event)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Display */}
      {safetyState === 'EMERGENCY' || safetyState === 'ATTENTION' ? (
        /* CRITICAL EMERGENCY ALERT STATE */
        <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 shadow-2xl shadow-rose-950/60 space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                🚨 INCOMING EMERGENCY REQUEST
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-rose-950 border border-rose-800 text-rose-300">
              {activeIncident ? `#${activeIncident.id}` : 'ACTIVE SOS'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-2">
            <h2 className="text-xl font-black text-white">
              {currentUser.name} has triggered an Emergency SOS!
            </h2>
            <p className="text-xs text-rose-200">
              {activeIncident?.notes || 'Emergency assistance protocol initiated. Friend in distress.'}
            </p>
          </div>

          {/* Victim Telemetry & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-400 block">Exact Live GPS Coordinates</span>
              <p className="text-sm font-mono font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{effLat.toFixed(5)}, {effLng.toFixed(5)}</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                {effLoc} {effArea && `• ${effArea}`}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {formatCoordinates(effLat, effLng)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-400 block">Proximity to You</span>
              <p className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>~1.2 km away • ETA: 3 mins</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Phone Battery: {batteryLevel}% • Network: Online
              </p>
            </div>
          </div>

          {/* Action Buttons for the Friend */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950/60 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>OPEN IN GOOGLE MAPS</span>
              </a>

              <a
                href={`tel:${currentUser.phone}`}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>CALL {currentUser.name.toUpperCase()}</span>
              </a>
            </div>

            {/* Lifecycle Dispatch Controls */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Your Responder Status: <strong className="text-white">{friendStatus}</strong>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {friendStatus === 'STANDBY' && (
                  <button
                    onClick={handleAcceptDispatch}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
                  >
                    I&apos;m Coming! (Mark En Route)
                  </button>
                )}

                {friendStatus === 'RESPONDING' && (
                  <button
                    onClick={handleMarkArrived}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all"
                  >
                    I Have Arrived at Scene
                  </button>
                )}

                <button
                  onClick={handleResolve}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                >
                  Friend is Safe (Resolve)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDBY SAFE STATE */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                LIVE GUARDIAN STANDBY
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {currentUser.name} is currently Safe
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                This device is actively monitoring welfare alerts. If {currentUser.name} presses SOS, misses a check-in, or is overdue on a commute, this screen will instantly sound an emergency alarm.
              </p>
            </div>
          </div>

          {/* Telemetry Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Battery Level</span>
              <p className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>{batteryLevel}%</span>
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Last Area</span>
              <p className="text-base font-bold text-white mt-1 flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{effLoc}</span>
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Welfare Protocol</span>
              <p className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Active 24/7</span>
              </p>
            </div>
          </div>

          {/* Live Demonstration Testing Actions */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Simulate Emergency to Test on This Screen</span>
            </span>
            <p className="text-xs text-slate-400">
              Want to see how an emergency looks on your friend&apos;s phone? Click the test button below:
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => triggerEmergencyIncident('MANUAL_SOS', 'Test SOS broadcast to Guardian Phone')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-950/60 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Simulate Emergency Alert Now</span>
              </button>

              <button
                onClick={resetAllToDefault}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Safe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
