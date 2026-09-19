import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Locate,
  AlertTriangle,
  Radio,
  Eye,
  Crosshair
} from 'lucide-react';
import { SafetyContact, Responder, Incident, Journey } from '../../types';
import { GeoCoordinates } from '../../utils/geolocation';

interface SafeGridMapProps {
  userCoords: GeoCoordinates;
  contacts?: SafetyContact[];
  responders?: Responder[];
  activeIncident?: Incident | null;
  journey?: Journey | null;
  vicinityRadiusKm?: number;
  height?: string | number;
  className?: string;
  showControls?: boolean;
  isDeviationSimulated?: boolean;
  onSelectMarker?: (type: 'user' | 'contact' | 'responder' | 'incident' | 'destination', data: any) => void;
}

export const SafeGridMap: React.FC<SafeGridMapProps> = ({
  userCoords,
  contacts = [],
  responders = [],
  activeIncident,
  journey,
  vicinityRadiusKm = 3.0,
  height = '360px',
  className = '',
  showControls = true,
  isDeviationSimulated = false,
  onSelectMarker,
}) => {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeLayers, setActiveLayers] = useState({
    circleRadius: true,
    contacts: true,
    responders: true,
    journeyRoute: true,
    landmarks: true,
  });
  const [selectedTooltip, setSelectedTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
    badge?: string;
    badgeColor?: string;
  } | null>(null);

  // SVG dimensions
  const viewBoxWidth = 600;
  const viewBoxHeight = 420;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;

  // Scale: 1 km corresponds to ~45 pixels at zoom = 1
  const pixelsPerKm = 48 * zoom;

  // Coordinate offset converter relative to user center
  // 1 degree lat is approx 111 km, 1 degree lng is approx 111 * cos(lat) km
  const getPixelPosition = (lat: number, lng: number) => {
    const latDiffKm = (lat - userCoords.lat) * 111.0;
    const lngDiffKm = (lng - userCoords.lng) * (111.0 * Math.cos((userCoords.lat * Math.PI) / 180));

    // Note: SVG y increases downwards, so north (+lat) is negative y
    const x = centerX + lngDiffKm * pixelsPerKm + panOffset.x;
    const y = centerY - latDiffKm * pixelsPerKm + panOffset.y;
    return { x, y };
  };

  // Convert contact distance & bearing to coordinate positions around user
  const contactPositions = useMemo(() => {
    return contacts.map((c, index) => {
      // Deterministic angle based on index
      const angle = (index * 95 * Math.PI) / 180;
      const dist = c.distanceKm || 1.2;
      const x = centerX + Math.cos(angle) * dist * pixelsPerKm + panOffset.x;
      const y = centerY + Math.sin(angle) * dist * pixelsPerKm + panOffset.y;
      const isInsideVicinity = dist <= vicinityRadiusKm;
      return { contact: c, x, y, isInsideVicinity, dist };
    });
  }, [contacts, centerX, centerY, pixelsPerKm, panOffset, vicinityRadiusKm]);

  // Responders positions
  const responderPositions = useMemo(() => {
    return responders.map((r, index) => {
      const angle = ((index + 1) * 135 * Math.PI) / 180;
      const dist = r.distanceKm || 1.5;
      const x = centerX + Math.cos(angle) * dist * pixelsPerKm + panOffset.x;
      const y = centerY + Math.sin(angle) * dist * pixelsPerKm + panOffset.y;
      return { responder: r, x, y, dist };
    });
  }, [responders, centerX, centerY, pixelsPerKm, panOffset]);

  // Journey origin & destination positions
  const journeyPositions = useMemo(() => {
    if (!journey || journey.status === 'ARRIVED' || journey.status === 'CANCELLED') return null;

    const startX = centerX - 120 * zoom + panOffset.x;
    const startY = centerY + 80 * zoom + panOffset.y;

    const endX = centerX + 150 * zoom + panOffset.x;
    const endY = centerY - 110 * zoom + panOffset.y;

    // Current user position on journey
    const progress = (journey.progressPercent || 25) / 100;
    
    // Normal route point
    let currX = startX + (endX - startX) * progress;
    let currY = startY + (endY - startY) * progress;

    // If deviation simulated, shift current position away from path
    if (isDeviationSimulated || journey.status === 'OVERDUE') {
      currX += 55 * zoom;
      currY += 45 * zoom;
    }

    return {
      start: { x: startX, y: startY, name: journey.origin },
      end: { x: endX, y: endY, name: journey.destination },
      current: { x: currX, y: currY },
      isDeviated: isDeviationSimulated,
    };
  }, [journey, centerX, centerY, zoom, panOffset, isDeviationSimulated]);

  // Radius of safety circle in pixels
  const vicinityRadiusPixels = vicinityRadiusKm * pixelsPerKm;

  // Reset viewport
  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedTooltip(null);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.5, Math.max(0.6, prev + delta)));
  };

  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl select-none ${className}`}
      style={{ height }}
    >
      {/* Top Map Status Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow-lg">
          <Crosshair className="w-3.5 h-3.5 text-rose-400" />
          <span>Live Vector Telemetry</span>
        </span>
        <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400 font-mono">
          {userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°
        </span>
      </div>

      {/* Layer Toggles & Zoom Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg">
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Layer Switchers */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg flex flex-col gap-1 text-[10px]">
            <button
              onClick={() => setActiveLayers(l => ({ ...l, circleRadius: !l.circleRadius }))}
              className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeLayers.circleRadius ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Circle ({vicinityRadiusKm}km)</span>
            </button>
            <button
              onClick={() => setActiveLayers(l => ({ ...l, responders: !l.responders }))}
              className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeLayers.responders ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Responders</span>
            </button>
          </div>
        </div>
      )}

      {/* SVG Map Canvas */}
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={() => setSelectedTooltip(null)}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.4" />
          </pattern>

          {/* Radar Pulse Animation */}
          <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#e11d48" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
          </radialGradient>

          {/* Safety Circle Vicinity Gradient */}
          <radialGradient id="vicinityGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.04" />
            <stop offset="85%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {/* Background Dark Canvas & Grid */}
        <rect width="100%" height="100%" fill="#090d16" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Stylized Vector Roads / Corridors */}
        <g opacity="0.35">
          {/* Major Avenue horizontal */}
          <path
            d={`M 0 ${centerY + 30 + panOffset.y} Q ${centerX} ${centerY + 20 + panOffset.y} ${viewBoxWidth} ${centerY + 50 + panOffset.y}`}
            stroke="#334155"
            strokeWidth="14"
            fill="none"
          />
          <path
            d={`M 0 ${centerY + 30 + panOffset.y} Q ${centerX} ${centerY + 20 + panOffset.y} ${viewBoxWidth} ${centerY + 50 + panOffset.y}`}
            stroke="#1e293b"
            strokeWidth="10"
            fill="none"
          />
          {/* Avenue centerline dash */}
          <path
            d={`M 0 ${centerY + 30 + panOffset.y} Q ${centerX} ${centerY + 20 + panOffset.y} ${viewBoxWidth} ${centerY + 50 + panOffset.y}`}
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="8,6"
            fill="none"
          />

          {/* Vertical Transit Corridor */}
          <path
            d={`M ${centerX - 70 + panOffset.x} 0 L ${centerX - 50 + panOffset.x} ${viewBoxHeight}`}
            stroke="#334155"
            strokeWidth="12"
            fill="none"
          />
          {/* Diagonal Boulevard */}
          <path
            d={`M 0 ${viewBoxHeight - 40} L ${viewBoxWidth} 60`}
            stroke="#1e293b"
            strokeWidth="8"
            fill="none"
          />
        </g>

        {/* City Landmarks Callouts */}
        {activeLayers.landmarks && (
          <g opacity="0.65" className="text-[9px] font-sans font-semibold">
            {/* Metro Station */}
            <circle cx={centerX - 130 + panOffset.x} cy={centerY - 80 + panOffset.y} r="3" fill="#64748b" />
            <text x={centerX - 122 + panOffset.x} y={centerY - 77 + panOffset.y} fill="#94a3b8">
              Central Metro Station
            </text>

            {/* University Campus */}
            <circle cx={centerX + 120 + panOffset.x} cy={centerY - 100 + panOffset.y} r="3" fill="#64748b" />
            <text x={centerX + 128 + panOffset.x} y={centerY - 97 + panOffset.y} fill="#94a3b8">
              North Campus Gate
            </text>

            {/* City General Hospital */}
            <circle cx={centerX - 110 + panOffset.x} cy={centerY + 110 + panOffset.y} r="3" fill="#64748b" />
            <text x={centerX - 102 + panOffset.x} y={centerY + 113 + panOffset.y} fill="#94a3b8">
              District Hospital
            </text>

            {/* Community Police Station */}
            <circle cx={centerX + 130 + panOffset.x} cy={centerY + 80 + panOffset.y} r="3" fill="#64748b" />
            <text x={centerX + 138 + panOffset.x} y={centerY + 83 + panOffset.y} fill="#94a3b8">
              Sector 4 Police Substation
            </text>
          </g>
        )}

        {/* Safety Circle Vicinity Radius Overlay */}
        {activeLayers.circleRadius && (
          <g>
            <circle
              cx={centerX + panOffset.x}
              cy={centerY + panOffset.y}
              r={vicinityRadiusPixels}
              fill="url(#vicinityGradient)"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="6,4"
              opacity="0.8"
            />
            {/* Vicinity Distance Label */}
            <text
              x={centerX + panOffset.x}
              y={centerY + panOffset.y - vicinityRadiusPixels + 14}
              textAnchor="middle"
              fill="#a5b4fc"
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              {vicinityRadiusKm} km Safety Circle Radius
            </text>
          </g>
        )}

        {/* Safe Journey Route Polyline */}
        {activeLayers.journeyRoute && journeyPositions && (
          <g>
            {/* Planned Route Corridor Boundary */}
            <path
              d={`M ${journeyPositions.start.x} ${journeyPositions.start.y} Q ${centerX + 20 + panOffset.x} ${centerY - 10 + panOffset.y} ${journeyPositions.end.x} ${journeyPositions.end.y}`}
              stroke="#3b82f6"
              strokeWidth="20"
              strokeOpacity="0.12"
              fill="none"
              strokeLinecap="round"
            />
            {/* Active Route Path */}
            <path
              d={`M ${journeyPositions.start.x} ${journeyPositions.start.y} Q ${centerX + 20 + panOffset.x} ${centerY - 10 + panOffset.y} ${journeyPositions.end.x} ${journeyPositions.end.y}`}
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeDasharray="6,4"
              fill="none"
              className="animate-pulse"
            />

            {/* If Deviation Detected: Red off-route indicator vector */}
            {journeyPositions.isDeviated && (
              <g>
                <line
                  x1={centerX + panOffset.x}
                  y1={centerY + panOffset.y}
                  x2={journeyPositions.current.x}
                  y2={journeyPositions.current.y}
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                />
                <circle
                  cx={journeyPositions.current.x}
                  cy={journeyPositions.current.y}
                  r="8"
                  fill="#f43f5e"
                  fillOpacity="0.3"
                  className="animate-ping"
                />
                <circle
                  cx={journeyPositions.current.x}
                  cy={journeyPositions.current.y}
                  r="4"
                  fill="#f43f5e"
                />
                <text
                  x={journeyPositions.current.x + 8}
                  y={journeyPositions.current.y - 8}
                  fill="#fda4af"
                  className="text-[9px] font-extrabold uppercase tracking-wider"
                >
                  Route Drift (+350m)
                </text>
              </g>
            )}

            {/* Origin Pin */}
            <g
              transform={`translate(${journeyPositions.start.x - 10}, ${journeyPositions.start.y - 20})`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTooltip({
                  x: journeyPositions.start.x,
                  y: journeyPositions.start.y - 24,
                  title: 'Journey Origin',
                  subtitle: journeyPositions.start.name,
                  badge: 'Started',
                  badgeColor: 'bg-blue-600',
                });
                onSelectMarker?.('destination', { type: 'origin', name: journeyPositions.start.name });
              }}
            >
              <circle cx="10" cy="10" r="10" fill="#2563eb" />
              <circle cx="10" cy="10" r="4" fill="#ffffff" />
            </g>

            {/* Destination Pin */}
            <g
              transform={`translate(${journeyPositions.end.x - 12}, ${journeyPositions.end.y - 24})`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTooltip({
                  x: journeyPositions.end.x,
                  y: journeyPositions.end.y - 28,
                  title: 'Target Destination',
                  subtitle: journeyPositions.end.name,
                  badge: `ETA ${journey?.expectedArrivalTime || 'Soon'}`,
                  badgeColor: 'bg-emerald-600',
                });
                onSelectMarker?.('destination', { type: 'destination', name: journeyPositions.end.name });
              }}
            >
              <path
                d="M 12 0 C 6 0 1 5 1 11 C 1 18 12 28 12 28 C 12 28 23 18 23 11 C 23 5 18 0 12 0 Z"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="10" r="4" fill="#ffffff" />
            </g>
          </g>
        )}

        {/* Safety Circle Contact Markers */}
        {activeLayers.contacts &&
          contactPositions.map(({ contact, x, y, isInsideVicinity, dist }) => (
            <g
              key={contact.id}
              transform={`translate(${x - 12}, ${y - 12})`}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTooltip({
                  x,
                  y: y - 16,
                  title: contact.name,
                  subtitle: `${contact.relationship} • ${dist.toFixed(1)} km away`,
                  badge: isInsideVicinity ? 'Inside Circle' : 'Remote / Outstation',
                  badgeColor: isInsideVicinity ? 'bg-indigo-600' : 'bg-slate-700',
                });
                onSelectMarker?.('contact', contact);
              }}
            >
              {/* Distance ring */}
              <circle
                cx="12"
                cy="12"
                r="13"
                fill={isInsideVicinity ? '#4f46e5' : '#475569'}
                fillOpacity="0.25"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill={isInsideVicinity ? '#6366f1' : '#334155'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x="12"
                y="15"
                textAnchor="middle"
                fill="#ffffff"
                className="text-[9px] font-black"
              >
                {contact.name.charAt(0)}
              </text>
            </g>
          ))}

        {/* Verified Community Responders */}
        {activeLayers.responders &&
          responderPositions.map(({ responder, x, y, dist }) => (
            <g
              key={responder.id}
              transform={`translate(${x - 12}, ${y - 12})`}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTooltip({
                  x,
                  y: y - 18,
                  title: responder.name,
                  subtitle: `${responder.specialization} • ${dist.toFixed(1)} km away`,
                  badge: responder.isAvailable ? 'Available' : 'En Route',
                  badgeColor: 'bg-emerald-600',
                });
                onSelectMarker?.('responder', responder);
              }}
            >
              {/* Outer pulsing ring */}
              <circle cx="12" cy="12" r="14" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
              <circle cx="12" cy="12" r="11" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
              {/* Mini cross / badge icon */}
              <path d="M 12 7 L 12 17 M 7 12 L 17 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}

        {/* Active Emergency Incident Pin (if any) */}
        {activeIncident && activeIncident.status !== 'RESOLVED' && (
          <g
            transform={`translate(${centerX + panOffset.x - 16}, ${centerY + panOffset.y - 34})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTooltip({
                x: centerX + panOffset.x,
                y: centerY + panOffset.y - 38,
                title: `Emergency #${activeIncident.id}`,
                subtitle: activeIncident.type.replace(/_/g, ' '),
                badge: activeIncident.state,
                badgeColor: activeIncident.state === 'EMERGENCY' ? 'bg-rose-600' : 'bg-amber-600',
              });
              onSelectMarker?.('incident', activeIncident);
            }}
          >
            {/* Warning pulse */}
            <circle cx="16" cy="14" r="22" fill="#e11d48" fillOpacity="0.3" className="animate-ping" />
            <path
              d="M 16 0 C 8 0 2 6 2 14 C 2 23 16 36 16 36 C 16 36 30 23 30 14 C 30 6 24 0 16 0 Z"
              fill="#e11d48"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx="16" cy="13" r="6" fill="#ffffff" />
          </g>
        )}

        {/* Central User Marker */}
        <g transform={`translate(${centerX + panOffset.x}, ${centerY + panOffset.y})`}>
          {/* Accuracy radar pulse */}
          <circle r={26 * zoom} fill="url(#userGlow)" />
          {/* Heading pointer if moving */}
          <polygon points="0,-16 6,-6 -6,-6" fill="#f43f5e" />
          {/* User dot */}
          <circle r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
          <circle r="3" fill="#ffffff" />
        </g>
      </svg>

      {/* Floating Interactive Tooltip */}
      {selectedTooltip && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-2 shadow-2xl text-left min-w-[150px] animate-in fade-in zoom-in-95 duration-150"
          style={{ left: selectedTooltip.x, top: selectedTooltip.y }}
        >
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h5 className="font-extrabold text-xs text-white truncate">{selectedTooltip.title}</h5>
            {selectedTooltip.badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded text-white ${selectedTooltip.badgeColor || 'bg-slate-700'}`}>
                {selectedTooltip.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 font-medium">{selectedTooltip.subtitle}</p>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 shadow-md flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> You
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Circle Contact
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> First Responder
          </span>
          {journey && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-blue-500" /> Route Corridor
            </span>
          )}
        </div>

        <div className="hidden sm:block text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
          Scale: 1km = {(pixelsPerKm).toFixed(0)}px
        </div>
      </div>
    </div>
  );
};
