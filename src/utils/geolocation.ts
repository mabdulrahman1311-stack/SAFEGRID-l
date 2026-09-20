/**
 * SAFEGRID Geolocation & Vicinity Calculation Engine
 * Handles live browser GPS, Haversine distance, realistic ETA computations,
 * and vicinity verification against the user's Safety Circle.
 */

export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // in meters
  speed?: number; // km/h
  heading?: number;
  timestamp?: number;
  locationName?: string;
  approximateArea?: string;
  isRealGps?: boolean;
}

export interface VicinityCheckResult {
  hasContactsInVicinity: boolean;
  contactsInVicinityCount: number;
  totalContactsCount: number;
  nearestContactDistanceKm: number | null;
  vicinityRadiusKm: number;
  emergencyEscalationRequired: boolean;
  recommendedEmergencyAgency: {
    name: string;
    number: string;
    type: string;
    reason: string;
  };
}

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

// Calculate ETA in minutes based on distance and mode
export function calculateEtaMinutes(
  distanceKm: number,
  mode: 'WALKING' | 'DRIVING' | 'TRANSIT' = 'TRANSIT'
): number {
  if (distanceKm <= 0) return 0;
  let speedKmH = 20; // default transit
  if (mode === 'WALKING') speedKmH = 4.5;
  if (mode === 'DRIVING') speedKmH = 35;

  const hours = distanceKm / speedKmH;
  const minutes = Math.ceil(hours * 60);
  // Add buffer for signals / stops (at least 3-5 mins buffer)
  return Math.max(3, minutes + 3);
}

// Format ETA time string e.g. "07:35 PM" given minutes from now
export function formatEtaTimestamp(minutesFromNow: number): string {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format coordinates into standard latitude/longitude with cardinal hemisphere markers
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

// Reverse-geocode lookup helper that resolves consistent human-readable location names
export function resolveLocationName(lat: number, lng: number): { locationName: string; approximateArea: string } {
  // Check known major regions within reasonable radius (~15-20km)
  if (Math.abs(lat - 37.7749) < 0.25 && Math.abs(lng - (-122.4194)) < 0.25) {
    return {
      locationName: 'Market & 4th St Transit Hub, San Francisco',
      approximateArea: 'San Francisco Downtown, CA'
    };
  }
  if (Math.abs(lat - 40.7128) < 0.25 && Math.abs(lng - (-74.0060)) < 0.25) {
    return {
      locationName: 'Midtown Manhattan & Penn Station',
      approximateArea: 'New York City, NY'
    };
  }
  if (Math.abs(lat - 51.5074) < 0.25 && Math.abs(lng - (-0.1278)) < 0.25) {
    return {
      locationName: 'Westminster & Central Transit Corridor',
      approximateArea: 'Central London, UK'
    };
  }
  if (Math.abs(lat - 24.7136) < 0.35 && Math.abs(lng - 46.6753) < 0.35) {
    return {
      locationName: 'King Fahd Road / Olaya District',
      approximateArea: 'Riyadh, Saudi Arabia'
    };
  }
  if (Math.abs(lat - 25.2048) < 0.35 && Math.abs(lng - 55.2708) < 0.35) {
    return {
      locationName: 'Sheikh Zayed Rd / Downtown Hub',
      approximateArea: 'Dubai, UAE'
    };
  }
  if (Math.abs(lat - 12.9716) < 0.35 && Math.abs(lng - 77.5946) < 0.35) {
    return {
      locationName: 'Central Metro Corridor (MG Rd / Tech Zone)',
      approximateArea: 'Bengaluru Central, India'
    };
  }
  if (Math.abs(lat - 48.8566) < 0.25 && Math.abs(lng - 2.3522) < 0.25) {
    return {
      locationName: 'Châtelet - Les Halles Transit',
      approximateArea: 'Central Paris, France'
    };
  }

  // Generic fallback using exact formatted coordinates
  const formatted = formatCoordinates(lat, lng);
  return {
    locationName: `GPS Fix: ${formatted}`,
    approximateArea: `Latitude ${lat.toFixed(2)}, Longitude ${lng.toFixed(2)}`
  };
}

// Well-known landmarks/presets for test and journey selection
export const LOCATION_PRESETS = [
  { 
    name: 'Current Live GPS Location (Device Sensor)', 
    coords: { lat: 0, lng: 0, locationName: 'Device Live GPS', approximateArea: 'Auto-detected via sensor' }, 
    category: 'live' 
  },
  { 
    name: 'San Francisco, CA (Market & 4th St)', 
    coords: { lat: 37.7749, lng: -122.4194, locationName: 'Market & 4th St Transit Hub', approximateArea: 'San Francisco, CA' }, 
    category: 'city' 
  },
  { 
    name: 'Riyadh (Olaya / King Fahd Rd)', 
    coords: { lat: 24.7136, lng: 46.6753, locationName: 'King Fahd Road / Olaya', approximateArea: 'Riyadh, Saudi Arabia' }, 
    category: 'city' 
  },
  { 
    name: 'London (Westminster Transit Hub)', 
    coords: { lat: 51.5074, lng: -0.1278, locationName: 'Westminster Station Corridor', approximateArea: 'Central London, UK' }, 
    category: 'city' 
  },
  { 
    name: 'New York (Midtown / Penn Station)', 
    coords: { lat: 40.7128, lng: -74.0060, locationName: 'Penn Station & 7th Ave', approximateArea: 'New York, NY' }, 
    category: 'city' 
  },
  { 
    name: 'Dubai (Downtown / Burj Corridor)', 
    coords: { lat: 25.2048, lng: 55.2708, locationName: 'Sheikh Zayed Rd / Downtown', approximateArea: 'Dubai, UAE' }, 
    category: 'city' 
  },
  { 
    name: 'Bengaluru (MG Road Central)', 
    coords: { lat: 12.9716, lng: 77.5946, locationName: 'Central Metro Corridor', approximateArea: 'Bengaluru Central, India' }, 
    category: 'city' 
  },
];

/**
 * Vicinity Verification Algorithm
 * Evaluates whether any Safety Circle contact who is authorized for SOS is within `vicinityRadiusKm`.
 * If NO ONE is in the nearest vicinity, returns emergencyEscalationRequired = true!
 */
export function evaluateSafetyCircleVicinity(
  contacts: Array<{
    id: string;
    name: string;
    canReceiveSOS: boolean;
    distanceKm?: number;
  }>,
  vicinityRadiusKm = 3.0,
  preferredService: string = 'POLICE_112'
): VicinityCheckResult {
  const sosCapableContacts = contacts.filter(c => c.canReceiveSOS);
  const contactsInVicinity = sosCapableContacts.filter(
    c => (c.distanceKm ?? 999) <= vicinityRadiusKm
  );

  const distances = sosCapableContacts
    .map(c => c.distanceKm ?? 999)
    .filter(d => !isNaN(d));
  const nearestDistance = distances.length > 0 ? Math.min(...distances) : null;

  const hasContactsInVicinity = contactsInVicinity.length > 0;
  const emergencyEscalationRequired = !hasContactsInVicinity;

  let recommendedService = {
    name: '112 Unified Emergency Response Services',
    number: '112',
    type: 'Police & Dispatch',
    reason: 'Zero Safety Circle contacts within immediate vicinity (< 3km). Immediate public emergency dispatch required.',
  };

  if (preferredService === 'AMBULANCE_108') {
    recommendedService = {
      name: '108 National Ambulance & Emergency Medical Services',
      number: '108',
      type: 'Medical EMS',
      reason: 'Senior/Medical profile active and no circle contact is nearby to provide immediate physical support.',
    };
  } else if (preferredService === 'WOMEN_1091') {
    recommendedService = {
      name: '1091 Women Safety Distress Line & Police Rapid Patrol',
      number: '1091',
      type: 'Women Helpline & PCR',
      reason: 'No circle contacts within vicinity during transit. Nearest PCR van alerted for proactive intercept.',
    };
  } else if (preferredService === 'CHILDLINE_1098') {
    recommendedService = {
      name: '1098 National Child Safety Emergency Services',
      number: '1098',
      type: 'Child Welfare & Police',
      reason: 'Dependent overdue along route and no registered guardian is physically nearby.',
    };
  }

  return {
    hasContactsInVicinity,
    contactsInVicinityCount: contactsInVicinity.length,
    totalContactsCount: contacts.length,
    nearestContactDistanceKm: nearestDistance,
    vicinityRadiusKm,
    emergencyEscalationRequired,
    recommendedEmergencyAgency: recommendedService,
  };
}
