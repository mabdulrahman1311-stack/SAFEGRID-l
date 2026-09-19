import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Search, Navigation, X, Loader2, Check } from 'lucide-react';

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  displayName: string;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  compact?: boolean;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Reusable location picker with:
 * - Text search (Nominatim geocoding)
 * - Use Current Location (browser GPS)
 * - Selected location display with lat/lng
 * - Manual coordinate entry fallback
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Search for a location...',
  required = false,
  error,
  compact = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
    setGpsError(null);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (text.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(text.trim())}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          setResults(data);
          setShowResults(data.length > 0);
        }
      } catch {
        // Network error — silently fail, user can use manual input
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  // Select a search result
  const selectResult = (result: NominatimResult) => {
    const city = result.address?.city || result.address?.town || result.address?.village || '';
    const loc: LocationData = {
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city,
      state: result.address?.state || '',
      country: result.address?.country || '',
      displayName: result.display_name.split(',').slice(0, 3).join(',').trim(),
    };
    onChange(loc);
    setQuery('');
    setShowResults(false);
    setResults([]);
  };

  // Use browser GPS
  const useCurrentLocation = async () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser. Use search or manual entry instead.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Reverse geocode to get address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            onChange({
              address: data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              latitude,
              longitude,
              city,
              state: data.address?.state || '',
              country: data.address?.country || '',
              displayName: data.display_name?.split(',').slice(0, 3).join(',').trim() || 'Current Location',
            });
          } else {
            onChange({
              address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              latitude,
              longitude,
              displayName: 'Current GPS Location',
            });
          }
        } catch {
          onChange({
            address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            latitude,
            longitude,
            displayName: 'Current GPS Location',
          });
        }
        setIsLocating(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Please search manually or enter coordinates.',
          2: 'Location unavailable. Check your device settings.',
          3: 'Location request timed out. Try again or search manually.',
        };
        setGpsError(messages[err.code] || 'Unable to get location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Manual coordinate entry
  const applyManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setGpsError('Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180.');
      return;
    }
    onChange({
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      latitude: lat,
      longitude: lng,
      displayName: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
    });
    setShowManual(false);
    setManualLat('');
    setManualLng('');
  };

  // Clear selected location
  const clearLocation = () => {
    onChange(null as unknown as LocationData);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
        {!compact && (
          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition-colors"
          >
            {showManual ? 'Hide Coords' : 'Enter Coords'}
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <Search className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
        />

        {/* Search results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-b-0"
              >
                <p className="text-xs text-white font-medium truncate">{r.display_name.split(',').slice(0, 2).join(',')}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{r.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Use Current Location button */}
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={isLocating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-sm text-slate-200 font-medium transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Detecting location...</span>
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>Use Current Location</span>
          </>
        )}
      </button>

      {/* GPS Error */}
      {gpsError && (
        <p className="text-xs text-amber-400 bg-amber-950/40 px-3 py-2 rounded-lg border border-amber-500/30">
          {gpsError}
        </p>
      )}

      {/* Manual coordinate entry */}
      {showManual && (
        <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold text-slate-400">Manual Coordinates:</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="Latitude"
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
            />
            <input
              type="number"
              step="any"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="Longitude"
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={applyManualCoords}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Apply Coordinates
          </button>
        </div>
      )}

      {/* Selected location display */}
      {value && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{value.displayName}</p>
                {value.city && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {[value.city, value.state, value.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={clearLocation}
              className="shrink-0 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
            <span>Lat: {value.latitude.toFixed(5)}</span>
            <span>Lng: {value.longitude.toFixed(5)}</span>
          </div>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-rose-400" />
          {error}
        </p>
      )}
    </div>
  );
};
