/**
 * SAFEGRID Nominatim Location Search Service
 * Uses OpenStreetMap Nominatim API for geocoding and reverse geocoding.
 * Free, no API key required.
 */

export interface NominatimResult {
  displayName: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  type: string;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/** Search for locations by query string */
export async function searchLocations(query: string, limit = 5): Promise<NominatimResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      addressdetails: '1',
      limit: String(limit),
    });

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SAFEGRID-SafetyApp/1.0',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: Record<string, unknown>) => ({
      displayName: String(item.display_name || ''),
      lat: parseFloat(String(item.lat)),
      lng: parseFloat(String(item.lon)),
      address: String(item.display_name || ''),
      city: String((item.address as Record<string, unknown>)?.city ||
                   (item.address as Record<string, unknown>)?.town ||
                   (item.address as Record<string, unknown>)?.village || ''),
      state: String((item.address as Record<string, unknown>)?.state || ''),
      country: String((item.address as Record<string, unknown>)?.country || ''),
      type: String(item.type || ''),
    }));
  } catch {
    return [];
  }
}

/** Reverse geocode: get address from lat/lng */
export async function reverseGeocode(lat: number, lng: number): Promise<NominatimResult | null> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      addressdetails: '1',
    });

    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SAFEGRID-SafetyApp/1.0',
      },
    });

    if (!res.ok) return null;

    const item = await res.json();
    if (item.error) return null;

    return {
      displayName: String(item.display_name || ''),
      lat: parseFloat(String(item.lat)),
      lng: parseFloat(String(item.lon)),
      address: String(item.display_name || ''),
      city: String(item.address?.city || item.address?.town || item.address?.village || ''),
      state: String(item.address?.state || ''),
      country: String(item.address?.country || ''),
      type: String(item.type || 'address'),
    };
  } catch {
    return null;
  }
}

/** Debounce helper for search input */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as unknown as T;
}
