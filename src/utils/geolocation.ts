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

// Well-known landmarks/presets for test and journey selection
export const LOCATION_PRESETS = [
  { name: 'Current Live GPS Location', coords: { lat: 12.9716, lng: 77.5946 }, category: 'live' },
  { name: 'Home (West Residence, Oak Ave)', coords: { lat: 12.9352, lng: 77.6245 }, category: 'home' },
  { name: 'University Tech Hub / Campus', coords: { lat: 12.9716, lng: 77.5946 }, category: 'work' },
  { name: 'Central Metro Transit Station', coords: { lat: 12.9510, lng: 77.6080 }, category: 'transit' },
  { name: 'City Hospital & Trauma Center', coords: { lat: 12.9605, lng: 77.6150 }, category: 'emergency' },
  { name: 'Greenwood School (Junior Wing)', coords: { lat: 12.9430, lng: 77.6310 }, category: 'school' },
  { name: 'Sector 4 Police Precinct', coords: { lat: 12.9580, lng: 77.6020 }, category: 'police' },
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
