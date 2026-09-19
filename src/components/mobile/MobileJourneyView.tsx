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
  FileText,
  Radio,
  Sparkles,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { calculateDistanceKm, calculateEtaMinutes, formatEtaTimestamp } from '../../utils/geolocation';
import { LiveMap } from '../common/LiveMap';

export const MobileJourneyView: React.FC = () => {
  const { 
    journey, 
    startJourneyWithInputs, 
    updateJourneyLocation,
    extendJourneyETA, 
    markJourneyArrived, 
    cancelJourney, 
    simulateOverdueJourney,
    simulateRouteDeviation,
    resolveRouteDeviation,
    contacts,
    responders,
    activeIncident,
    vicinityRadiusKm,
    liveCoords,
    isLocatingGps,
    refreshLiveGps,
    gpsPrecision
  } = useSafeGrid();

  // User Inputs for Journey
  const [origin, setOrigin] = useState('Central Metro Transit Hub');
  const [destination, setDestination] = useState('West Oak Apartments (Home)');
  const [transportMode, setTransportMode] = useState<'WALKING' | 'DRIVING' | 'TRANSIT'>('TRANSIT');
  const [customNotes, setCustomNotes] = useState('');
  const [useCustomEta, setUseCustomEta] = useState(false);
  const [customEtaMinutes, setCustomEtaMinutes] = useState(25);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  // Live destination coordinates (resolved via Nominatim or preset)
  const [mapDestCoords, setMapDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapDestName, setMapDestName] = useState('');
  // Updated live user coords fed back from map
  const [mapUserCoords, setMapUserCoords] = useState(liveCoords);

  // Safety Corridor Presets with Safety Scores
  const ROUTE_PRESETS = [
    {
      name: 'Main Avenue Safe Corridor',
      origin: 'Central Metro Transit Hub',
      destination: 'West Oak Apartments (Home)',
      score: 98,
      distanceKm: 2.8,
      mode: 'TRANSIT' as const,
      lighting: 'High (LED Streetlights)',
      cctvCoverage: '94% Monitored',
      notes: 'Monitored smart corridor with SOS poles every 200m.'
    },
    {
      name: 'University Campus Patrol Path',
      origin: 'Campus North Library',
      destination: 'Graduate Student Residence',
      score: 95,
      distanceKm: 1.6,
      mode: 'WALKING' as const,
      lighting: 'Continuous',
      cctvCoverage: '100% Guarded',
      notes: 'Active campus security patrols and blue light call boxes.'
    },
    {
      name: 'Suburban Shuttle Corridor',
      origin: 'Tech Park Station',
      destination: 'Green Glen Sector 4',
      score: 91,
      distanceKm: 4.5,
      mode: 'DRIVING' as const,
      lighting: 'Moderate',
      cctvCoverage: '78% Highway Cam',
      notes: 'Direct transit line with verified rideshare pickup zones.'
    }
  ];

  // Use map-geocoded destination if set, else fall back to offset estimate
  const destLat = mapDestCoords?.lat ?? (liveCoords.lat + (transportMode === 'DRIVING' ? 0.045 : transportMode === 'TRANSIT' ? 0.03 : 0.012));
  const destLng = mapDestCoords?.lng ?? (liveCoords.lng + (transportMode === 'DRIVING' ? 0.035 : transportMode === 'TRANSIT' ? 0.025 : 0.010));
  const autoCalculatedDistance = calculateDistanceKm(liveCoords.lat, liveCoords.lng, destLat, destLng);
  const autoEtaMinutes = calculateEtaMinutes(autoCalculatedDistance, transportMode);

  const activeEta = useCustomEta ? customEtaMinutes : autoEtaMinutes;

  const applyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = ROUTE_PRESETS[index];
    setOrigin(p.origin);
    setDestination(p.destination);
    setTransportMode(p.mode);
    setCustomNotes(p.notes);
  };

  const handleStart = () => {
    startJourneyWithInputs({
      origin: origin.trim() || 'Current Active GPS Location',
      destination: (mapDestName || destination).trim() || 'Home Residence',
      transportMode,
      notes: customNotes.trim() || undefined,
      customEtaMinutes: activeEta,
      originCoords: { lat: liveCoords.lat, lng: liveCoords.lng },
      destinationCoords: { lat: destLat, lng: destLng },
    });
  };

  // When the map's geocoder resolves a destination, update the form field too
  const handleMapDestChange = (coords: { lat: number; lng: number }, name: string) => {
    setMapDestCoords(coords);
    setMapDestName(name);
    setDestination(name.split(',')[0].trim());
  };

  const handleSimulateMovement = () => {
    if (!journey || !journey.destinationCoords) return;
    const currLat = journey.currentCoords?.lat || liveCoords.lat;
    const currLng = journey.currentCoords?.lng || liveCoords.lng;
    const targetLat = journey.destinationCoords.lat;
    const targetLng = journey.destinationCoords.lng;

    const nextLat = currLat + (targetLat - currLat) * 0.35;
    const nextLng = currLng + (targetLng - currLng) * 0.35;

    updateJourneyLocation({
      lat: parseFloat(nextLat.toFixed(4)),
      lng: parseFloat(nextLng.toFixed(4)),
      accuracy: 10,
      speed: transportMode === 'DRIVING' ? 42 : transportMode === 'TRANSIT' ? 26 : 5,
      timestamp: Date.now(),
      locationName: `En Route on ${transportMode.toLowerCase()} corridor`,
      approximateArea: liveCoords.approximateArea,
    });
  };

  const isDeviated = journey?.status === 'DEVIATION' || journey?.isDeviated;

  return (
    <div id="mobile-journey-view-container" className="p-4 space-y-4 pb-20 animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-rose-400" /> Safe Journey &amp; Corridor Sentinel
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Commute Telemetry
          </h2>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
          isDeviated
            ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
            : journey?.status === 'ACTIVE'
            ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
            : journey?.status === 'OVERDUE'
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          {isDeviated
            ? '⚠️ Route Deviation'
            : journey?.status === 'ACTIVE'
            ? '🟢 Corridor Active'
            : journey?.status === 'OVERDUE'
            ? '🟡 Overdue'
            : 'Idle'}
        </span>
      </div>

      {/* ── Live Leaflet Map with Real Routing ───────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Live Map · OpenStreetMap + OSRM Routing</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {liveCoords.lat.toFixed(4)}°N {Math.abs(liveCoords.lng).toFixed(4)}°E ±{gpsPrecision}m
          </span>
        </div>

        {/* Destination search bar for the map */}
        <LiveMap
          userCoords={mapUserCoords}
          destinationCoords={mapDestCoords ?? (journey?.destinationCoords ?? undefined)}
          destinationName={mapDestName || journey?.destination}
          contacts={contacts}
          responders={responders}
          activeIncident={activeIncident}
          journey={journey}
          vicinityRadiusKm={vicinityRadiusKm}
          height="420px"
          showSearchBar={!journey || journey.status === 'COMPLETED'}
          showControls
          transportMode={
            transportMode === 'WALKING' ? 'walking'
            : transportMode === 'DRIVING' ? 'driving'
            : 'driving'
          }
          onDestinationChange={handleMapDestChange}
          onUserLocationUpdate={(c) => setMapUserCoords(c)}
        />
      </div>

      {/* Active Route Deviation Alert Banner */}
      {isDeviated && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-white shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/30 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">
                ⚠️ Route Deviation Detected (+350m)
              </h4>
              <p className="text-xs text-rose-200 mt-0.5 leading-snug">
                You drifted outside your designated safe transit corridor. Your Safety Circle will be notified if unacknowledged.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-resolve-deviation-safe"
              onClick={() => resolveRouteDeviation(true)}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I&apos;m Safe (Alternate)</span>
            </button>
            <button
              id="btn-resolve-deviation-sos"
              onClick={() => resolveRouteDeviation(false)}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Escalate SOS Now</span>
            </button>
          </div>
        </div>
      )}

      {journey && (journey.status === 'ACTIVE' || journey.status === 'OVERDUE' || journey.status === 'DEVIATION') ? (
        /* Active Journey Card with Live Controls */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
            {/* Origin & Destination summary */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
              <div>
                <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Origin</span>
                <p className="text-sm font-semibold text-white">{journey.origin}</p>
                <span className="text-[11px] text-slate-400">Started at {journey.startTime}</span>
              </div>

              <div>
                <span className="absolute left-0 bottom-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-slate-900" />
                <span className="text-[10px] uppercase font-bold text-slate-400">Destination</span>
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

            {/* Dynamic Distance & Real-time Progress */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Distance Remaining:</span>
                <strong className="text-white font-mono">
                  {journey.distanceKmRemaining !== undefined ? `${journey.distanceKmRemaining.toFixed(1)} km` : `${autoCalculatedDistance.toFixed(1)} km`}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Corridor Completion:</span>
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
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="btn-simulate-gps-step"
                onClick={handleSimulateMovement}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Move Forward</span>
              </button>

              <button
                id="btn-simulate-route-deviation"
                onClick={simulateRouteDeviation}
                className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-xs font-bold text-rose-300 border border-rose-800/60 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Deviation</span>
              </button>
            </div>

            {/* Sharing with Circle */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Shared with {contacts.length} Circle contacts</span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Telemetry
              </span>
            </div>
          </div>

          {/* Overdue Warning if applicable */}
          {journey.status === 'OVERDUE' && (
            <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 animate-pulse" />
              <span>
                Target arrival time has elapsed. Extend your ETA below or confirm arrival to avoid false alarm escalation.
              </span>
            </div>
          )}

          {/* ETA Extension Buttons to Avoid False Alarms */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-xs font-bold text-slate-200 block mb-2">
              Transit delay? Add buffer time to prevent alarms:
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
              Cancel Journey
            </button>
            <button
              id="btn-simulate-overdue"
              onClick={simulateOverdueJourney}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold border border-amber-800/60 transition-colors"
            >
              Simulate Delay Alert
            </button>
          </div>
        </div>
      ) : (
        /* Create New Journey Form with Corridor Presets & Full Controls */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Start Protected Safe Journey</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">GPS-Linked ETA</span>
          </div>

          {/* Safe Corridor Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Recommended Safe Corridors:
            </label>
            <div className="space-y-2">
              {ROUTE_PRESETS.map((preset, idx) => (
                <div
                  key={preset.name}
                  onClick={() => applyPreset(idx)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPresetIndex === idx
                      ? 'bg-rose-950/30 border-rose-500/50 text-white'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{preset.name}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Score: {preset.score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {preset.origin} → {preset.destination} ({preset.distanceKm} km)
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                    <span>💡 {preset.lighting}</span>
                    <span>📹 {preset.cctvCoverage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
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
                placeholder="e.g., Central Metro Station"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
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
                Vehicle # or Commute Notes (Optional)
              </label>
              <input
                id="input-journey-notes"
                type="text"
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="e.g. Uber cab #WB-04-1928, white sedan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>
          </div>

          <button
            id="btn-start-monitored-journey"
            onClick={handleStart}
            disabled={!origin.trim() || !destination.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.97] text-white font-bold text-sm shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="w-4 h-4" />
            <span>START PROTECTED CORRIDOR ({activeEta} MINS)</span>
          </button>
          {(!origin.trim() || !destination.trim()) && (
            <p className="text-xs text-amber-400 text-center mt-1">Please enter both origin and destination</p>
          )}
        </div>
      )}
    </div>
  );
};
