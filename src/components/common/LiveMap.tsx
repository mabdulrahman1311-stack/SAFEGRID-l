/**
 * SAFEGRID Live Interactive Map
 * Uses Leaflet.js + OpenStreetMap tiles (free, no API key required).
 * Routing via OSRM public API (free, open source).
 * Geocoding via Nominatim (free, OpenStreetMap data).
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Users,
  ShieldAlert,
  ShieldCheck,
  Locate,
  RotateCcw,
  AlertTriangle,
  Clock,
  Zap,
  Search,
  Loader2,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { SafetyContact, Responder, Incident, Journey } from '../../types';
import { GeoCoordinates, calculateDistanceKm, calculateEtaMinutes } from '../../utils/geolocation';

// ── Fix Leaflet's default marker icon paths (Vite bundler issue) ──────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom SVG icon factory ───────────────────────────────────────────────────
function makeIcon(color: string, emoji: string, size = 36) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" filter="url(#shadow)"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 5}" fill="rgba(255,255,255,0.15)"/>
      <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" font-size="${size * 0.44}" font-family="sans-serif">${emoji}</text>
      <polygon points="${size / 2 - 5},${size - 6} ${size / 2 + 5},${size - 6} ${size / 2},${size + 6}" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

const USER_ICON = makeIcon('#e11d48', '🧑', 40);
const DEST_ICON = makeIcon('#3b82f6', '🏁', 38);
const CONTACT_ICON = makeIcon('#8b5cf6', '👤', 32);
const RESPONDER_ICON = makeIcon('#10b981', '🚑', 34);
const INCIDENT_ICON = makeIcon('#f59e0b', '⚠️', 34);

// ── OSRM Route fetcher ────────────────────────────────────────────────────────
interface RouteResult {
  coords: [number, number][];
  distanceKm: number;
  durationMin: number;
}

async function fetchOSRMRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<RouteResult | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/${mode}` +
      `/${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.[0]) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );
    return {
      coords,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

// ── Nominatim geocoder ────────────────────────────────────────────────────────
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'SAFEGRID-App/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data[0]) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

// ── Reverse geocoder (coords → address) ──────────────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'SAFEGRID-App/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface LiveMapProps {
  userCoords: GeoCoordinates;
  destinationCoords?: { lat: number; lng: number } | null;
  destinationName?: string;
  contacts?: SafetyContact[];
  responders?: Responder[];
  activeIncident?: Incident | null;
  journey?: Journey | null;
  vicinityRadiusKm?: number;
  height?: string;
  className?: string;
  showSearchBar?: boolean;
  showControls?: boolean;
  transportMode?: 'driving' | 'walking' | 'cycling';
  onDestinationChange?: (coords: { lat: number; lng: number }, name: string) => void;
  onUserLocationUpdate?: (coords: GeoCoordinates) => void;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const LiveMap: React.FC<LiveMapProps> = ({
  userCoords,
  destinationCoords,
  destinationName,
  contacts = [],
  responders = [],
  activeIncident,
  journey,
  vicinityRadiusKm = 3.0,
  height = '420px',
  className = '',
  showSearchBar = false,
  showControls = true,
  transportMode = 'driving',
  onDestinationChange,
  onUserLocationUpdate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const vicinityCircleRef = useRef<L.Circle | null>(null);
  const contactMarkersRef = useRef<L.Marker[]>([]);
  const responderMarkersRef = useRef<L.Marker[]>([]);
  const incidentMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [localDestCoords, setLocalDestCoords] = useState<{ lat: number; lng: number } | null>(
    destinationCoords ?? null
  );
  const [localDestName, setLocalDestName] = useState(destinationName ?? '');

  // ── 1. Initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([userCoords.lat, userCoords.lng], 14);

      // Dark OSM tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Light attribution
      L.control.attribution({ prefix: false }).addTo(map);
      map.attributionControl?.setPrefix(
        '© <a href="https://www.openstreetmap.org/copyright" style="color:#94a3b8">OpenStreetMap</a>'
      );

      // Zoom control (bottom right)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // User marker
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: USER_ICON })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;color:#0f172a">
            <b style="color:#e11d48">📍 Your Location</b><br/>
            ${userCoords.locationName ?? 'Live GPS'}<br/>
            <small>${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</small>
          </div>`
        );

      // Accuracy circle
      if (userCoords.accuracy && userCoords.accuracy < 500) {
        accuracyCircleRef.current = L.circle([userCoords.lat, userCoords.lng], {
          radius: userCoords.accuracy,
          color: '#e11d48',
          fillColor: '#e11d48',
          fillOpacity: 0.08,
          weight: 1,
          dashArray: '4 4',
        }).addTo(map);
      }

      // Vicinity radius circle
      vicinityCircleRef.current = L.circle([userCoords.lat, userCoords.lng], {
        radius: vicinityRadiusKm * 1000,
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '6 4',
      }).addTo(map);

      // Allow clicking the map to set destination
      map.on('contextmenu', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const name = await reverseGeocode(lat, lng);
        const label = name ? name.split(',').slice(0, 2).join(',') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setLocalDestCoords({ lat, lng });
        setLocalDestName(label);
        onDestinationChange?.({ lat, lng }, label);
      });

      mapRef.current = map;
    } catch (err) {
      setMapError('Map failed to initialise. Please check your network connection.');
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Update user position whenever userCoords changes ────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pos: [number, number] = [userCoords.lat, userCoords.lng];

    userMarkerRef.current?.setLatLng(pos).setPopupContent(
      `<div style="font-family:sans-serif;color:#0f172a">
        <b style="color:#e11d48">📍 Your Location</b><br/>
        ${userCoords.locationName ?? 'Live GPS'}<br/>
        <small>${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</small>
        ${userCoords.isRealGps ? '<br/><span style="color:#16a34a">● Live GPS</span>' : '<br/><span style="color:#b45309">● Simulated</span>'}
      </div>`
    );

    accuracyCircleRef.current?.setLatLng(pos);
    if (userCoords.accuracy) accuracyCircleRef.current?.setRadius(userCoords.accuracy);

    vicinityCircleRef.current?.setLatLng(pos);
  }, [userCoords]);

  // ── 3. Destination marker ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const dest = localDestCoords ?? destinationCoords;
    if (dest) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([dest.lat, dest.lng]);
      } else {
        destMarkerRef.current = L.marker([dest.lat, dest.lng], { icon: DEST_ICON })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;color:#0f172a">
              <b style="color:#3b82f6">🏁 Destination</b><br/>
              ${localDestName || destinationName || 'Set destination'}
            </div>`
          );
      }
    } else {
      destMarkerRef.current?.remove();
      destMarkerRef.current = null;
    }
  }, [localDestCoords, destinationCoords, localDestName, destinationName]);

  // ── 4. Fetch route when both ends are set ──────────────────────────────────
  const fetchRoute = useCallback(async () => {
    const dest = localDestCoords ?? destinationCoords;
    if (!dest) return;
    setIsFetchingRoute(true);
    setRouteInfo(null);
    const result = await fetchOSRMRoute(
      { lat: userCoords.lat, lng: userCoords.lng },
      dest,
      transportMode
    );
    setIsFetchingRoute(false);

    const map = mapRef.current;
    if (!map) return;

    // Remove old route
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;

    if (result) {
      setRouteInfo(result);
      routeLayerRef.current = L.polyline(result.coords, {
        color: activeIncident ? '#f59e0b' : '#e11d48',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: transportMode === 'walking' ? '10 6' : undefined,
      }).addTo(map);

      // Fit map to show full route + some padding
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [dest.lat, dest.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [localDestCoords, destinationCoords, userCoords.lat, userCoords.lng, transportMode, activeIncident]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // ── 5. Contact markers ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    contactMarkersRef.current.forEach(m => m.remove());
    contactMarkersRef.current = [];

    contacts.forEach(contact => {
      // Place contacts relative to user position using their distanceKm
      const angle = Math.random() * 2 * Math.PI;
      const km = contact.distanceKm ?? 1.5;
      const latOff = (km / 111) * Math.cos(angle);
      const lngOff = (km / (111 * Math.cos((userCoords.lat * Math.PI) / 180))) * Math.sin(angle);

      const m = L.marker(
        [userCoords.lat + latOff, userCoords.lng + lngOff],
        { icon: CONTACT_ICON }
      ).addTo(map).bindPopup(
        `<div style="font-family:sans-serif;color:#0f172a">
          <b style="color:#7c3aed">👤 ${contact.name}</b><br/>
          ${contact.relationship} • ${km.toFixed(1)} km away<br/>
          ${contact.canReceiveSOS ? '✅ SOS Alerts ON' : '❌ SOS OFF'}
        </div>`
      );
      contactMarkersRef.current.push(m);
    });
  }, [contacts, userCoords.lat, userCoords.lng]);

  // ── 6. Responder markers ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    responderMarkersRef.current.forEach(m => m.remove());
    responderMarkersRef.current = [];

    responders.filter(r => r.isAvailable).forEach(r => {
      const angle = Math.random() * 2 * Math.PI;
      const km = r.distanceKm ?? 1;
      const latOff = (km / 111) * Math.cos(angle);
      const lngOff = (km / (111 * Math.cos((userCoords.lat * Math.PI) / 180))) * Math.sin(angle);

      const m = L.marker(
        [userCoords.lat + latOff, userCoords.lng + lngOff],
        { icon: RESPONDER_ICON }
      ).addTo(map).bindPopup(
        `<div style="font-family:sans-serif;color:#0f172a">
          <b style="color:#059669">🚑 ${r.name}</b><br/>
          ${r.specialization}<br/>
          ${km.toFixed(1)} km away • ⭐ ${r.rating}/5<br/>
          ${r.isAvailable ? '<span style="color:#16a34a">✅ Available</span>' : '<span style="color:#dc2626">❌ Busy</span>'}
        </div>`
      );
      responderMarkersRef.current.push(m);
    });
  }, [responders, userCoords.lat, userCoords.lng]);

  // ── 7. Active incident marker ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    incidentMarkerRef.current?.remove();
    incidentMarkerRef.current = null;

    if (activeIncident) {
      incidentMarkerRef.current = L.marker(
        [activeIncident.latitude, activeIncident.longitude],
        { icon: INCIDENT_ICON }
      ).addTo(map).bindPopup(
        `<div style="font-family:sans-serif;color:#0f172a">
          <b style="color:#dc2626">🚨 INCIDENT #${activeIncident.id}</b><br/>
          ${activeIncident.type.replace(/_/g, ' ')}<br/>
          Priority: ${activeIncident.priority}<br/>
          Status: ${activeIncident.status}
        </div>`
      ).openPopup();
    }
  }, [activeIncident]);

  // ── 8. Live GPS fetch ─────────────────────────────────────────────────────
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: GeoCoordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
          timestamp: pos.timestamp,
          isRealGps: true,
        };
        onUserLocationUpdate?.(coords);
        mapRef.current?.setView([coords.lat, coords.lng], 15);
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
    );
  }, [onUserLocationUpdate]);

  // ── 9. Address search ──────────────────────────────────────────────────────
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const result = await geocodeAddress(searchQuery);
    setIsSearching(false);
    if (result) {
      const label = result.displayName.split(',').slice(0, 2).join(',');
      setLocalDestCoords({ lat: result.lat, lng: result.lng });
      setLocalDestName(label);
      onDestinationChange?.({ lat: result.lat, lng: result.lng }, label);
      mapRef.current?.setView([result.lat, result.lng], 15);
    } else {
      setMapError('Location not found. Try a different search term.');
      setTimeout(() => setMapError(null), 3000);
    }
  }, [searchQuery, onDestinationChange]);

  // ── 10. Centre on user ─────────────────────────────────────────────────────
  const handleCentre = () => {
    mapRef.current?.setView([userCoords.lat, userCoords.lng], 15);
  };

  const destCoords = localDestCoords ?? destinationCoords;
  const modeIcon = transportMode === 'walking' ? '🚶' : transportMode === 'cycling' ? '🚲' : '🚗';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col ${className}`} style={{ height }}>
      {/* Search Bar */}
      {showSearchBar && (
        <form onSubmit={handleSearch} className="mb-2 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination address…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {isSearching ? 'Searching…' : 'Go'}
          </button>
        </form>
      )}

      {/* Map Container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl min-h-0">
        {/* Leaflet mount target */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Error overlay */}
        {mapError && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-rose-950/95 border border-rose-500/60 text-rose-300 text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {mapError}
          </div>
        )}

        {/* Route loading indicator */}
        {isFetchingRoute && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            Calculating route…
          </div>
        )}

        {/* Controls overlay */}
        {showControls && (
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {/* Locate me */}
            <button
              onClick={handleLocateMe}
              title="Get my live GPS location"
              className="w-9 h-9 rounded-xl bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg flex items-center justify-center transition-all"
            >
              {isLocating
                ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                : <Locate className="w-4 h-4" />}
            </button>
            {/* Centre */}
            <button
              onClick={handleCentre}
              title="Centre on my position"
              className="w-9 h-9 rounded-xl bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg flex items-center justify-center transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {/* Re-fetch route */}
            {destCoords && (
              <button
                onClick={fetchRoute}
                title="Refresh route"
                className="w-9 h-9 rounded-xl bg-rose-600/90 border border-rose-500/60 text-white hover:bg-rose-500 shadow-lg flex items-center justify-center transition-all"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Live GPS dot indicator */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 text-[11px] text-slate-300 px-2.5 py-1.5 rounded-lg shadow-sm">
          <span className={`w-2 h-2 rounded-full ${userCoords.isRealGps ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {userCoords.isRealGps ? 'Live GPS' : 'Simulated'}
          {userCoords.accuracy && <span className="text-slate-500"> ±{userCoords.accuracy}m</span>}
        </div>

        {/* Right-click tip */}
        {!destCoords && (
          <div className="absolute bottom-3 right-12 z-20 bg-slate-900/90 border border-slate-700/60 text-[11px] text-slate-400 px-2.5 py-1.5 rounded-lg shadow-sm hidden sm:block">
            Right-click map to set destination
          </div>
        )}
      </div>

      {/* Route Info Panel */}
      {(routeInfo || destCoords) && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Distance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <MapPin className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <p className="text-base font-black text-white">
              {routeInfo ? `${routeInfo.distanceKm} km` : (
                destCoords
                  ? `${calculateDistanceKm(userCoords.lat, userCoords.lng, destCoords.lat, destCoords.lng)} km`
                  : '—'
              )}
            </p>
            <p className="text-[11px] text-slate-400">Distance</p>
          </div>

          {/* ETA */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-base font-black text-white">
              {routeInfo
                ? `${routeInfo.durationMin} min`
                : destCoords
                ? `${calculateEtaMinutes(
                    calculateDistanceKm(userCoords.lat, userCoords.lng, destCoords.lat, destCoords.lng),
                    transportMode === 'driving' ? 'DRIVING' : transportMode === 'walking' ? 'WALKING' : 'TRANSIT'
                  )} min`
                : '—'}
            </p>
            <p className="text-[11px] text-slate-400">ETA {modeIcon}</p>
          </div>

          {/* Safety circle contacts visible */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-base font-black text-white">{contacts.length}</p>
            <p className="text-[11px] text-slate-400">Circle on Map</p>
          </div>

          {/* Responders visible */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-base font-black text-white">{responders.filter(r => r.isAvailable).length}</p>
            <p className="text-[11px] text-slate-400">Responders</p>
          </div>
        </div>
      )}

      {/* Destination name strip */}
      {(localDestName || destinationName) && (
        <div className="mt-2 flex items-center gap-2 bg-blue-950/60 border border-blue-500/30 rounded-xl px-3 py-2">
          <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">Destination</p>
            <p className="text-xs text-white font-medium truncate">{localDestName || destinationName}</p>
          </div>
          {routeInfo && (
            <span className="ml-auto text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
              Route found
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveMap;
