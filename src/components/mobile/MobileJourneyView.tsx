import React, { useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Share2, 
  RotateCcw,
  Navigation,
  Compass,
  Footprints,
  Car,
  Bus,
  RefreshCw,
  LocateFixed,
  Send,
  Shield,
  FileText
} from 'lucide-react';
import { calculateDistanceKm, calculateEtaMinutes, formatEtaTimestamp } from '../../utils/geolocation';

export const MobileJourneyView: React.FC = () => {
  const { 
    journey, 
    startJourneyWithInputs, 
    updateJourneyLocation,
    extendJourneyETA, 
    markJourneyArrived, 
    cancelJourney, 
    simulateOverdueJourney,
    contacts,
    liveCoords,
    isLocatingGps,
    refreshLiveGps,
    gpsPrecision
  } = useSafeGrid();

  // User Inputs for Journey
  const [origin, setOrigin] = useState('Metro Station Central');
  const [destination, setDestination] = useState('West Oak Apartments (Home)');
  const [transportMode, setTransportMode] = useState<'WALKING' | 'DRIVING' | 'TRANSIT'>('TRANSIT');
  const [customNotes, setCustomNotes] = useState('');
  const [useCustomEta, setUseCustomEta] = useState(false);
  const [customEtaMinutes, setCustomEtaMinutes] = useState(25);

  // Mock destination offset for distance calculation
  const destLat = liveCoords.lat + (transportMode === 'DRIVING' ? 0.045 : transportMode === 'TRANSIT' ? 0.03 : 0.012);
  const destLng = liveCoords.lng + (transportMode === 'DRIVING' ? 0.035 : transportMode === 'TRANSIT' ? 0.025 : 0.010);
  const autoCalculatedDistance = calculateDistanceKm(liveCoords.lat, liveCoords.lng, destLat, destLng);
  const autoEtaMinutes = calculateEtaMinutes(autoCalculatedDistance, transportMode);

  const activeEta = useCustomEta ? customEtaMinutes : autoEtaMinutes;

  const handleStart = () => {
    startJourneyWithInputs({
      origin: origin.trim() || 'Current Active GPS Location',
      destination: destination.trim() || 'Home Residence',
      transportMode,
      notes: customNotes.trim() || undefined,
      customEtaMinutes: activeEta,
      originCoords: { lat: liveCoords.lat, lng: liveCoords.lng },
      destinationCoords: { lat: destLat, lng: destLng },
    });
  };

  const handleSimulateMovement = () => {
    if (!journey || !journey.destinationCoords) return;
    // Step 25% closer to destination
    const currLat = journey.currentCoords?.lat || liveCoords.lat;
    const currLng = journey.currentCoords?.lng || liveCoords.lng;
    const targetLat = journey.destinationCoords.lat;
    const targetLng = journey.destinationCoords.lng;

    const nextLat = currLat + (targetLat - currLat) * 0.35;
    const nextLng = currLng + (targetLng - currLng) * 0.35;

    updateJourneyLocation({
      lat: parseFloat(nextLat.toFixed(4)),
      lng: parseFloat(nextLng.toFixed(4)),
      accuracy: 12,
      timestamp: Date.now(),
    });
  };

  return (
    <div id="mobile-journey-view-container" className="p-4 space-y-4 pb-16 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" /> Real-time Telemetry
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Safe Journey &amp; GPS
          </h2>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
          journey?.status === 'ACTIVE'
            ? 'bg-blue-950/80 border-blue-500/40 text-blue-300 animate-pulse'
            : journey?.status === 'OVERDUE'
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          {journey?.status === 'ACTIVE' ? '🟢 Route Active' : journey?.status === 'OVERDUE' ? '🟡 Overdue' : 'Idle'}
        </span>
      </div>

      {/* Live GPS Coordinates Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <LocateFixed className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Live GPS Fix</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                ±{gpsPrecision}m
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {liveCoords.lat.toFixed(4)}° N, {Math.abs(liveCoords.lng).toFixed(4)}° W
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-live-gps"
          onClick={refreshLiveGps}
          disabled={isLocatingGps}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          title="Refresh GPS from device"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin text-blue-400' : ''}`} />
          <span>{isLocatingGps ? 'Locating...' : 'Refresh'}</span>
        </button>
      </div>

      {journey && (journey.status === 'ACTIVE' || journey.status === 'OVERDUE') ? (
        /* Active Journey Card with Live Progress & Inputs */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
            {/* Route summary */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
              <div>
                <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Departed From</span>
                <p className="text-sm font-semibold text-white">{journey.origin}</p>
                <span className="text-[11px] text-slate-400">Started at {journey.startTime}</span>
              </div>

              <div>
                <span className="absolute left-0 bottom-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-900" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Target Destination</span>
                <p className="text-sm font-semibold text-white">{journey.destination}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ETA: {journey.expectedArrivalTime}
                  </span>
                  <span className="text-xs font-bold text-blue-400">
                    ({journey.calculatedEtaMinutes ?? activeEta} mins remaining)
                  </span>
                  {journey.etaExtensionsCount > 0 && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      +{journey.etaExtensionsCount * 10}m added
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Distance & Real-time Route Progress */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Distance Remaining:</span>
                <strong className="text-white font-mono">
                  {journey.distanceKmRemaining !== undefined ? `${journey.distanceKmRemaining.toFixed(1)} km` : `${autoCalculatedDistance.toFixed(1)} km`}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Progress Corridor:</span>
                <strong className="text-emerald-400">{journey.progressPercent}%</strong>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${journey.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Simulated Live Movement Along Route */}
            <div className="flex items-center justify-between pt-1">
              <button
                id="btn-simulate-gps-step"
                onClick={handleSimulateMovement}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulate Moving Forward (Update GPS &amp; Recalculate ETA)</span>
              </button>
            </div>

            {/* Sharing with Circle */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Shared with {contacts.length} Safety Circle contacts</span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
              </span>
            </div>

            {journey.notes && (
              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{journey.notes}</span>
              </div>
            )}
          </div>

          {/* Overdue Warning if applicable */}
          {journey.status === 'OVERDUE' && (
            <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 animate-pulse" />
              <span>
                Target arrival time has passed. Extend your ETA below to inform your circle, or confirm your safe arrival.
              </span>
            </div>
          )}

          {/* ETA Extension Buttons to Avoid False Alarms */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-xs font-bold text-slate-200 block mb-2">
              Encountering delays? Extend target arrival:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-extend-10"
                onClick={() => extendJourneyETA(10)}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs border border-slate-700 text-center transition-all"
              >
                +10 Mins
              </button>
              <button
                id="btn-extend-20"
                onClick={() => extendJourneyETA(20)}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs border border-slate-700 text-center transition-all"
              >
                +20 Mins
              </button>
              <button
                id="btn-extend-30"
                onClick={() => extendJourneyETA(30)}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs border border-slate-700 text-center transition-all"
              >
                +30 Mins
              </button>
            </div>
          </div>

          {/* Primary Arrival Action */}
          <button
            id="btn-arrived-safely"
            onClick={markJourneyArrived}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I HAVE ARRIVED SAFELY</span>
          </button>

          {/* End or Delay Simulation */}
          <div className="flex gap-2">
            <button
              id="btn-cancel-journey"
              onClick={cancelJourney}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800 transition-colors"
            >
              End Journey
            </button>
            <button
              id="btn-simulate-overdue"
              onClick={simulateOverdueJourney}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold border border-amber-800/60 transition-colors"
            >
              Simulate Delay Ping
            </button>
          </div>
        </div>
      ) : (
        /* Create New Journey Form with Full Custom User Inputs */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Start Protected Commute</h3>
            <span className="text-[10px] text-slate-400 font-mono">GPS-Linked ETA</span>
          </div>
          
          <div className="space-y-3">
            {/* Origin */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400">Starting Point</label>
                <button
                  type="button"
                  onClick={() => setOrigin(`Current GPS (${liveCoords.lat.toFixed(3)}, ${liveCoords.lng.toFixed(3)})`)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Use Live GPS
                </button>
              </div>
              <input
                id="input-journey-origin"
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g., Metro Station Central"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Target Destination</label>
              <input
                id="input-journey-destination"
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g., Home (West Oak Ave)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              
              {/* Quick Destination Presets */}
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {['Home (West Oak)', 'University Library', 'Office Sector 4', 'Central Hospital'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDestination(d)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Mode of Travel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="btn-mode-walking"
                  type="button"
                  onClick={() => setTransportMode('WALKING')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    transportMode === 'WALKING'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walking</span>
                </button>

                <button
                  id="btn-mode-transit"
                  type="button"
                  onClick={() => setTransportMode('TRANSIT')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    transportMode === 'TRANSIT'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Transit</span>
                </button>

                <button
                  id="btn-mode-driving"
                  type="button"
                  onClick={() => setTransportMode('DRIVING')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    transportMode === 'DRIVING'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Cab / Drive</span>
                </button>
              </div>
            </div>

            {/* ETA Estimation & Custom Override */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">GPS Est. Distance:</span>
                <strong className="text-white">{autoCalculatedDistance.toFixed(1)} km</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Arrival Time:</span>
                <strong className="text-amber-400">{formatEtaTimestamp(activeEta)} ({activeEta} mins)</strong>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <label className="flex items-center justify-between text-[11px] text-slate-400 mb-1 cursor-pointer">
                  <span>Custom ETA Override:</span>
                  <input
                    type="checkbox"
                    checked={useCustomEta}
                    onChange={e => setUseCustomEta(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                </label>
                {useCustomEta && (
                  <div className="space-y-1 mt-1">
                    <input
                      id="input-custom-eta-slider"
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={customEtaMinutes}
                      onChange={e => setCustomEtaMinutes(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>5 mins</span>
                      <span>{customEtaMinutes} mins</span>
                      <span>120 mins</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Notes / Vehicle Number */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Safety Notes / Vehicle # (Optional)
              </label>
              <input
                id="input-journey-notes"
                type="text"
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="e.g. Uber cab #WB-04-1928, white sedan"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            id="btn-start-monitored-journey"
            onClick={handleStart}
            className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-rose-950/60 flex items-center justify-center gap-2 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>START MONITORED COMMUTE ({activeEta} MINS)</span>
          </button>
        </div>
      )}
    </div>
  );
};
