import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SafetyState, 
  UserProfile, 
  Incident, 
  SafetyContact, 
  CheckInSchedule, 
  Journey, 
  Responder, 
  OfflineEvent, 
  IncidentStatus,
  PersonType,
  EmergencyServiceType
} from '../types';
import { 
  INITIAL_PERSONAS, 
  INITIAL_CONTACTS, 
  INITIAL_CHECKINS, 
  INITIAL_JOURNEY, 
  INITIAL_RESPONDERS, 
  INITIAL_INCIDENTS 
} from '../data/mockData';
import { 
  GeoCoordinates, 
  VicinityCheckResult, 
  evaluateSafetyCircleVicinity, 
  calculateDistanceKm, 
  calculateEtaMinutes, 
  formatEtaTimestamp,
  LOCATION_PRESETS 
} from '../utils/geolocation';

interface SafeGridContextType {
  // App view & identity
  viewMode: 'MOBILE' | 'WEB' | 'API_CONSOLE' | 'GUARDIAN';
  setViewMode: (mode: 'MOBILE' | 'WEB' | 'API_CONSOLE' | 'GUARDIAN') => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  setPersonTypeAndConfigure: (type: PersonType, options?: Partial<UserProfile>) => void;
  personas: UserProfile[];
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isConnectFriendModalOpen: boolean;
  setIsConnectFriendModalOpen: (open: boolean) => void;

  // Core Safety State Machine
  safetyState: SafetyState;
  setSafetyState: (state: SafetyState) => void;
  activeIncident: Incident | null;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;

  // Safety Circle (Input & Management)
  contacts: SafetyContact[];
  addContact: (contact: Omit<SafetyContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<SafetyContact>) => void;
  deleteContact: (id: string) => void;
  toggleContactPermission: (id: string, permission: 'canVerifyWelfare' | 'canReceiveSOS' | 'canTrackLiveJourney') => void;
  vicinityRadiusKm: number;
  setVicinityRadiusKm: (radius: number) => void;
  vicinityStatus: VicinityCheckResult;

  // Check-ins (Input & Management)
  checkins: CheckInSchedule[];
  addCheckIn: (checkIn: Omit<CheckInSchedule, 'id' | 'isCompletedToday'>) => void;
  updateCheckIn: (id: string, updates: Partial<CheckInSchedule>) => void;
  deleteCheckIn: (id: string) => void;
  confirmCheckIn: (id: string) => void;
  simulateMissedCheckIn: () => void;

  // Safe Journey (GPS & Dynamic Inputs)
  journey: Journey | null;
  liveCoords: GeoCoordinates;
  isLocatingGps: boolean;
  refreshLiveGps: () => Promise<GeoCoordinates>;
  startJourney: (origin: string, dest: string, etaMinutes: number) => void;
  startJourneyWithInputs: (params: {
    origin: string;
    destination: string;
    transportMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
    notes?: string;
    customEtaMinutes?: number;
    originCoords?: { lat: number; lng: number };
    destinationCoords?: { lat: number; lng: number };
  }) => void;
  updateJourneyLocation: (coords: GeoCoordinates) => void;
  extendJourneyETA: (minutes: number) => void;
  markJourneyArrived: () => void;
  cancelJourney: () => void;
  simulateOverdueJourney: () => void;

  // Manual SOS & Countdown
  isSOSCountdownActive: boolean;
  sosCountdownRemaining: number;
  triggerSOS: () => void;
  triggerEmergencyIncident: (type: Incident['type'], reason: string) => void;
  cancelSOS: () => void;

  // Attention Verification
  verifySafeFromAttention: () => void;
  escalateFromAttentionToEmergency: (reason?: string) => void;

  // Responders
  responders: Responder[];
  activeResponder: Responder;
  responderUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  reassignResponder: (incidentId: string) => void;

  // Edge cases / Resilience
  isOnline: boolean;
  toggleOnlineStatus: () => void;
  offlineQueue: OfflineEvent[];
  batteryLevel: number;
  setBatteryLevel: (level: number) => void;
  gpsPrecision: number;
  toggleGpsPrecision: () => void;
  activeSafetySession: boolean;
  toggleSafetySession: () => void;

  // Preset Scenario Demonstrations (Sections 73–76)
  runSeniorCheckInDemo: () => void;
  runWomanJourneyDemo: () => void;
  runSOSCountdownDemo: () => void;
  runOfflineSyncDemo: () => void;
  runResponderDemo: () => void;
  runAdminDemo: () => void;
  resetAllToDefault: () => void;
}

const SafeGridContext = createContext<SafeGridContextType | undefined>(undefined);

export const SafeGridProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'MOBILE' | 'WEB' | 'API_CONSOLE' | 'GUARDIAN'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'guardian' || params.get('role') === 'friend' || params.get('view') === 'guardian') {
        return 'GUARDIAN';
      }
      if (params.get('view') === 'web') return 'WEB';
      if (params.get('view') === 'api') return 'API_CONSOLE';
    }
    return 'MOBILE';
  });
  const [isConnectFriendModalOpen, setIsConnectFriendModalOpen] = useState(false);
  const [personas, setPersonas] = useState<UserProfile[]>(INITIAL_PERSONAS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PERSONAS[0]); // Sarah
  const [safetyState, setSafetyState] = useState<SafetyState>('SAFE');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  // Onboarding state: ask what type of person they are on start
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('safegrid_onboarded_v2');
      return !saved;
    } catch {
      return true;
    }
  });

  const [contacts, setContacts] = useState<SafetyContact[]>(INITIAL_CONTACTS);
  const [vicinityRadiusKm, setVicinityRadiusKm] = useState<number>(currentUser.vicinityRadiusKm || 3.0);
  const [checkins, setCheckins] = useState<CheckInSchedule[]>(INITIAL_CHECKINS);
  const [journey, setJourney] = useState<Journey | null>(INITIAL_JOURNEY);

  // Live GPS Coordinates State
  const [liveCoords, setLiveCoords] = useState<GeoCoordinates>({
    lat: 12.9716,
    lng: 77.5946,
    accuracy: 12,
    speed: 0,
    timestamp: Date.now(),
  });
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // SOS Countdown
  const [isSOSCountdownActive, setIsSOSCountdownActive] = useState(false);
  const [sosCountdownRemaining, setSosCountdownRemaining] = useState(10);

  // Responders
  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const activeResponder = responders[0]; // Dr. Anita

  // Resilience & Edge cases
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineEvent[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(currentUser.batteryLevel);
  const [gpsPrecision, setGpsPrecision] = useState(18); // 18m vs 120m
  const [activeSafetySession, setActiveSafetySession] = useState(true);

  // Vicinity calculation based on current contacts & radius
  const vicinityStatus: VicinityCheckResult = evaluateSafetyCircleVicinity(
    contacts,
    vicinityRadiusKm,
    currentUser.preferredEmergencyService || 'POLICE_112'
  );

  // Profile and Persona Updates
  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      setPersonas(all => all.map(p => p.id === updated.id ? updated : p));
      return updated;
    });
  };

  // Configure app based on person type assessment (Section 4, 14, 45)
  const setPersonTypeAndConfigure = (type: PersonType, options: Partial<UserProfile> = {}) => {
    try {
      localStorage.setItem('safegrid_onboarded_v2', 'true');
    } catch {}

    let role: UserProfile['role'] = 'CITIZEN';
    let isSenior = false;
    let preferredService: EmergencyServiceType = 'POLICE_112';
    let radius = 3.0;
    let defaultNeed = 'Rapid emergency response and trusted contact notification';

    if (type === 'SOLO_WOMAN') {
      role = 'CITIZEN';
      preferredService = 'WOMEN_1091';
      radius = 3.0;
      defaultNeed = 'Transit harassment protection, night commute safe journey tracking, Women Helpline 1091';
    } else if (type === 'SENIOR') {
      role = 'SENIOR';
      isSenior = true;
      preferredService = 'AMBULANCE_108';
      radius = 2.5;
      defaultNeed = 'Sudden fall or medical distress, missed medication alert, urgent ambulance EMS dispatch';
    } else if (type === 'GUARDIAN') {
      role = 'GUARDIAN';
      preferredService = 'CHILDLINE_1098';
      radius = 5.0;
      defaultNeed = 'Child school safe commute shield, overdue arrival curfew, child safety dispatch';
    } else if (type === 'STUDENT') {
      role = 'CITIZEN';
      preferredService = 'POLICE_112';
      radius = 2.0;
      defaultNeed = 'Campus night walk escort, buddy tracking, campus security and police dispatch';
    } else if (type === 'RESPONDER') {
      role = 'RESPONDER';
      preferredService = 'AMBULANCE_108';
      radius = 5.0;
      defaultNeed = 'Receive distress dispatch for citizens in nearest vicinity, first-aid assist';
    }

    const updatedProfile: UserProfile = {
      ...currentUser,
      role,
      personType: type,
      isSeniorMode: isSenior,
      preferredEmergencyService: options.preferredEmergencyService || preferredService,
      vicinityRadiusKm: options.vicinityRadiusKm || radius,
      primaryEmergencyNeed: options.primaryEmergencyNeed || defaultNeed,
      name: options.name || currentUser.name,
      phone: options.phone || currentUser.phone,
      emergencyNotes: options.emergencyNotes ?? currentUser.emergencyNotes,
      bloodGroup: options.bloodGroup ?? currentUser.bloodGroup,
      medicalConditions: options.medicalConditions ?? currentUser.medicalConditions,
      onboardingCompleted: true,
    };

    setCurrentUser(updatedProfile);
    setVicinityRadiusKm(updatedProfile.vicinityRadiusKm || 3.0);
    setIsOnboardingOpen(false);

    // If Senior, adapt check-in schedule to high-contrast routine
    if (isSenior) {
      setCheckins([
        {
          id: 'chk_morning_med',
          label: 'Morning Medication & Heart Check',
          scheduledTime: '08:30 AM',
          isCompletedToday: false,
          gracePeriodMinutes: 20,
          frequency: 'DAILY',
          category: 'MEDICATION'
        },
        {
          id: 'chk_noon_welfare',
          label: 'Mid-day "I\'M OK" Welfare Check',
          scheduledTime: '01:00 PM',
          isCompletedToday: false,
          gracePeriodMinutes: 30,
          frequency: 'DAILY',
          category: 'WELFARE'
        },
        {
          id: 'chk_evening_safe',
          label: 'Evening Home Comfort Check',
          scheduledTime: '07:30 PM',
          isCompletedToday: false,
          gracePeriodMinutes: 30,
          frequency: 'DAILY',
          category: 'WELFARE'
        }
      ]);
    }
  };

  // GPS Location Refresh using Browser API with fallback
  const refreshLiveGps = async (): Promise<GeoCoordinates> => {
    setIsLocatingGps(true);
    return new Promise<GeoCoordinates>((resolve) => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: GeoCoordinates = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
              speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
              heading: pos.coords.heading || 0,
              timestamp: pos.timestamp,
            };
            setLiveCoords(coords);
            setIsLocatingGps(false);
            if (journey && journey.status === 'ACTIVE') {
              updateJourneyLocation(coords);
            }
            resolve(coords);
          },
          (err) => {
            console.warn('Geolocation fallback activated:', err.message);
            const offset = (Math.random() - 0.5) * 0.002;
            const fallback: GeoCoordinates = {
              lat: 12.9716 + offset,
              lng: 77.5946 + offset,
              accuracy: 14,
              speed: 16,
              timestamp: Date.now(),
            };
            setLiveCoords(fallback);
            setIsLocatingGps(false);
            if (journey && journey.status === 'ACTIVE') {
              updateJourneyLocation(fallback);
            }
            resolve(fallback);
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 4000 }
        );
      } else {
        setIsLocatingGps(false);
        resolve(liveCoords);
      }
    });
  };

  // Sync battery when user changes
  useEffect(() => {
    setBatteryLevel(currentUser.batteryLevel);
    // If David, automatically select his checkin state
    if (currentUser.role === 'SENIOR') {
      setSafetyState('SAFE');
    }
  }, [currentUser]);

  // Sync initial state from server.ts
  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.contacts) && data.contacts.length > 0) {
          setContacts(data.contacts);
        }
      })
      .catch(() => {});

    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.schedules) && data.schedules.length > 0) {
          setCheckins(data.schedules);
        }
      })
      .catch(() => {});

    fetch('/api/state')
      .then(res => res.json())
      .then(state => {
        if (state && state.safetyState) {
          setSafetyState(state.safetyState);
          if (state.incident) {
            setActiveIncident(state.incident);
          }
        }
      })
      .catch(() => {});
  }, []);

  // SOS Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSOSCountdownActive && sosCountdownRemaining > 0) {
      timer = setTimeout(() => {
        setSosCountdownRemaining(prev => prev - 1);
      }, 1000);
    } else if (isSOSCountdownActive && sosCountdownRemaining === 0) {
      // Countdown finished without cancel -> Emergency Confirmed!
      setIsSOSCountdownActive(false);
      triggerEmergencyIncident('MANUAL_SOS', 'Direct SOS Button Pressed by User');
    }
    return () => clearTimeout(timer);
  }, [isSOSCountdownActive, sosCountdownRemaining]);

  const queueOrExecute = (eventType: string, payload: Record<string, unknown>, executeAction: () => void) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!isOnline) {
      const newOfflineEvent: OfflineEvent = {
        id: 'off-' + Date.now(),
        eventType,
        payload,
        createdAt: nowStr,
        status: 'QUEUED',
      };
      setOfflineQueue(prev => [newOfflineEvent, ...prev]);
      executeAction();
    } else {
      executeAction();
    }
  };

  const toggleOnlineStatus = () => {
    if (!isOnline) {
      // Back online! Sync queue
      const syncedNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setOfflineQueue(prev => 
        prev.map(item => ({ ...item, status: 'SYNCED', syncedAt: syncedNow }))
      );
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  };

  const toggleGpsPrecision = () => {
    setGpsPrecision(prev => (prev === 18 ? 140 : 18));
  };

  const toggleSafetySession = () => {
    setActiveSafetySession(prev => !prev);
  };

  // Contacts Management & User Inputs
  const addContact = (contactData: Omit<SafetyContact, 'id'>) => {
    const newContact: SafetyContact = {
      ...contactData,
      id: 'contact_' + Date.now(),
      distanceKm: contactData.distanceKm ?? 1.2,
      approxLocation: contactData.approxLocation || 'Nearby Residence',
    };
    setContacts(prev => [...prev, newContact]);

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.contacts) {
        setContacts(data.contacts);
      }
    })
    .catch(() => {});
  };

  const updateContact = (id: string, updates: Partial<SafetyContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const toggleContactPermission = (id: string, permission: 'canVerifyWelfare' | 'canReceiveSOS' | 'canTrackLiveJourney') => {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      const updatedVal = !contact[permission];
      fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [permission]: updatedVal })
      }).catch(() => {});
    }
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [permission]: !c[permission] } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    fetch(`/api/contacts/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Check-ins Management & User Inputs
  const addCheckIn = (checkInData: Omit<CheckInSchedule, 'id' | 'isCompletedToday'>) => {
    const newSchedule: CheckInSchedule = {
      ...checkInData,
      id: 'chk_' + Date.now(),
      isCompletedToday: false,
    };
    setCheckins(prev => [...prev, newSchedule]);

    fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInData)
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.schedules) {
        setCheckins(data.schedules);
      }
    })
    .catch(() => {});
  };

  const updateCheckIn = (id: string, updates: Partial<CheckInSchedule>) => {
    setCheckins(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const deleteCheckIn = (id: string) => {
    setCheckins(prev => prev.filter(c => c.id !== id));
    fetch(`/api/schedules/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const confirmCheckIn = (id: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    fetch('/api/checkin/complete', { method: 'POST' }).catch(() => {});
    queueOrExecute('CHECK_IN_CONFIRMED', { checkInId: id }, () => {
      setCheckins(prev => prev.map(c => c.id === id ? { ...c, isCompletedToday: true, lastRespondedAt: `${timeNow} Today` } : c));
      setSafetyState('SAFE');
      if (activeIncident && activeIncident.type === 'MISSED_CHECK_IN') {
        setActiveIncident(null);
      }
    });
  };

  const simulateMissedCheckIn = () => {
    fetch('/api/checkin/missed', { method: 'POST' }).catch(() => {});
    setSafetyState('ATTENTION');
    const newIncident: Incident = {
      id: 'SG-' + Math.floor(1000 + Math.random() * 9000),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'MISSED_CHECK_IN',
      priority: 'HIGH',
      status: 'ATTENTION',
      state: 'ATTENTION',
      latitude: 37.7749,
      longitude: -122.4194,
      locationPrecision: gpsPrecision,
      locationName: 'Home Residence (Sector 3)',
      approximateArea: 'Sector 3, Residential Zone',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      contactsNotifiedCount: 0,
      events: [
        {
          id: 'evt-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Scheduled Check-in Window Passed',
          description: 'User did not acknowledge safety ping. System entering grace verification period.',
          actor: 'Safety Engine',
          type: 'system',
        }
      ],
      notes: 'Scheduled welfare check-in was missed. Audio reminder and verification prompt active.',
    };
    setActiveIncident(newIncident);
    setIncidents(prev => [newIncident, ...prev]);
  };

  // Safe Journey (GPS & User Inputs)
  const startJourney = (origin: string, dest: string, etaMinutes: number) => {
    startJourneyWithInputs({
      origin,
      destination: dest,
      transportMode: 'TRANSIT',
      customEtaMinutes: etaMinutes,
    });
  };

  const startJourneyWithInputs = ({
    origin,
    destination,
    transportMode,
    notes,
    customEtaMinutes,
    originCoords,
    destinationCoords,
  }: {
    origin: string;
    destination: string;
    transportMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
    notes?: string;
    customEtaMinutes?: number;
    originCoords?: { lat: number; lng: number };
    destinationCoords?: { lat: number; lng: number };
  }) => {
    const oCoords = originCoords || { lat: liveCoords.lat, lng: liveCoords.lng };
    const dCoords = destinationCoords || { lat: liveCoords.lat + 0.028, lng: liveCoords.lng + 0.022 };

    const distanceKm = calculateDistanceKm(oCoords.lat, oCoords.lng, dCoords.lat, dCoords.lng);
    const calculatedMinutes = customEtaMinutes || calculateEtaMinutes(distanceKm, transportMode);
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const etaFormatted = formatEtaTimestamp(calculatedMinutes);

    const newJourney: Journey = {
      id: 'jny_' + Date.now(),
      userId: currentUser.id,
      origin,
      destination,
      startTime,
      expectedArrivalTime: etaFormatted,
      progressPercent: 5,
      status: 'ACTIVE',
      sharedWithCircle: true,
      notes: notes || `Transport: ${transportMode}. Live GPS tracking & vicinity safeguards active.`,
      etaExtensionsCount: 0,
      transportMode,
      originCoords: oCoords,
      destinationCoords: dCoords,
      currentCoords: { ...liveCoords },
      distanceKmRemaining: distanceKm,
      calculatedEtaMinutes: calculatedMinutes,
      isLiveGpsActive: true,
    };

    setJourney(newJourney);
    setSafetyState('SAFE');
    fetch('/api/journey/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, origin, expectedArrival: etaFormatted, distanceKm })
    }).catch(() => {});
  };

  const updateJourneyLocation = (coords: GeoCoordinates) => {
    setJourney(prev => {
      if (!prev || prev.status !== 'ACTIVE' || !prev.destinationCoords) return prev;
      const dCoords = prev.destinationCoords;
      const distRemaining = calculateDistanceKm(coords.lat, coords.lng, dCoords.lat, dCoords.lng);
      const totalDist = prev.distanceKmRemaining ? Math.max(prev.distanceKmRemaining, distRemaining + 0.4) : distRemaining + 1;
      const progress = Math.min(95, Math.max(8, Math.round(((totalDist - distRemaining) / totalDist) * 100)));
      const minutesRemaining = calculateEtaMinutes(distRemaining, prev.transportMode || 'TRANSIT');
      const newExpectedTime = formatEtaTimestamp(minutesRemaining);

      return {
        ...prev,
        currentCoords: coords,
        distanceKmRemaining: distRemaining,
        calculatedEtaMinutes: minutesRemaining,
        expectedArrivalTime: newExpectedTime,
        progressPercent: progress,
      };
    });
  };

  const extendJourneyETA = (minutes: number) => {
    fetch('/api/journey/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes })
    }).catch(() => {});
    if (!journey) return;
    const [h, mWithAmPm] = journey.expectedArrivalTime.split(':');
    const isPm = mWithAmPm.includes('PM');
    let hour = parseInt(h, 10);
    const minute = parseInt(mWithAmPm.slice(0, 2), 10);
    if (isPm && hour < 12) hour += 12;

    const newDate = new Date();
    newDate.setHours(hour);
    newDate.setMinutes(minute + minutes);
    const newEta = newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setJourney(prev => prev ? {
      ...prev,
      expectedArrivalTime: newEta,
      status: 'ACTIVE',
      etaExtensionsCount: prev.etaExtensionsCount + 1,
    } : null);

    setSafetyState('SAFE');
    if (activeIncident && activeIncident.type === 'OVERDUE_JOURNEY') {
      setActiveIncident(null);
    }
  };

  const markJourneyArrived = () => {
    fetch('/api/journey/arrived', { method: 'POST' }).catch(() => {});
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    queueOrExecute('JOURNEY_ARRIVED_SAFELY', { journeyId: journey?.id }, () => {
      setJourney(prev => prev ? {
        ...prev,
        status: 'ARRIVED',
        progressPercent: 100,
        distanceKmRemaining: 0,
        actualArrivalTime: timeNow,
      } : null);
      setSafetyState('SAFE');
      if (activeIncident) {
        setActiveIncident(null);
      }
    });
  };

  const cancelJourney = () => {
    setJourney(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    setSafetyState('SAFE');
    if (activeIncident) {
      setActiveIncident(null);
    }
  };

  const simulateOverdueJourney = () => {
    fetch('/api/journey/missed', { method: 'POST' }).catch(() => {});
    if (journey) {
      setJourney(prev => prev ? { ...prev, status: 'OVERDUE' } : null);
    }
    setSafetyState('ATTENTION');
    const newIncident: Incident = {
      id: 'SG-' + Math.floor(1000 + Math.random() * 9000),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'OVERDUE_JOURNEY',
      priority: 'MEDIUM',
      status: 'ATTENTION',
      state: 'ATTENTION',
      latitude: liveCoords.lat,
      longitude: liveCoords.lng,
      locationPrecision: gpsPrecision,
      locationName: 'Sector 4 Transit Corridor',
      approximateArea: 'Sector 4, Downtown',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      contactsNotifiedCount: 1,
      events: [
        {
          id: 'evt-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Journey Overdue Notification',
          description: 'Target arrival time passed without arrival confirmation.',
          actor: 'Journey Monitor Engine',
          type: 'system',
        }
      ],
      notes: 'Journey has exceeded expected arrival time. Grace period active for delay extension.',
    };
    setActiveIncident(newIncident);
    setIncidents(prev => [newIncident, ...prev]);
  };

  // Manual SOS
  const triggerSOS = () => {
    setIsSOSCountdownActive(true);
    setSosCountdownRemaining(10);
  };

  const cancelSOS = () => {
    setIsSOSCountdownActive(false);
    setSosCountdownRemaining(10);
    if (activeIncident) {
      fetch(`/api/incidents/${activeIncident.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'SOS aborted during countdown' })
      }).catch(() => {});
    }
  };

  const triggerEmergencyIncident = (type: Incident['type'], reason: string) => {
    fetch('/api/sos', { method: 'POST' }).catch(() => {});
    setSafetyState('EMERGENCY');
    const matchedResponder = responders[0]; // Dr. Anita

    // Vicinity check evaluation: check if any circle contact is in nearest vicinity
    const vResult = evaluateSafetyCircleVicinity(
      contacts,
      vicinityRadiusKm,
      currentUser.preferredEmergencyService || 'POLICE_112'
    );

    const eventsList: Incident['events'] = [
      {
        id: 'evt-sos-1',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Emergency State Triggered',
        description: reason,
        actor: currentUser.name,
        type: 'user',
      }
    ];

    if (vResult.emergencyEscalationRequired) {
      // User rule: if no one from safety circle is in nearest vicinity, inform emergency services
      eventsList.push({
        id: 'evt-sos-vicinity-alert',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `🚨 Emergency Services Alerted: Zero Contacts in Vicinity (<${vicinityRadiusKm}km)`,
        description: `0/${contacts.length} Safety Circle contacts are in immediate vicinity (nearest is ${vResult.nearestContactDistanceKm ?? 'N/A'}km away). Automatically alerted ${vResult.recommendedEmergencyAgency.name} (${vResult.recommendedEmergencyAgency.number}) and dispatched verified community responder.`,
        actor: 'Vicinity Dispatch Safeguard',
        type: 'escalation',
      });
    } else {
      eventsList.push({
        id: 'evt-sos-circle-alert',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Safety Circle Vicinity Verified',
        description: `${vResult.contactsInVicinityCount} trusted contact(s) detected within ${vicinityRadiusKm}km vicinity. High-priority SMS/App alert dispatched.`,
        actor: 'Circle Dispatch Engine',
        type: 'contact',
      });
    }

    eventsList.push({
      id: 'evt-sos-3',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Verified Responder Assigned',
      description: `Matched ${matchedResponder.name} (${matchedResponder.specialization}, ${matchedResponder.distanceKm}km away).`,
      actor: 'Rule-based Matcher',
      type: 'responder',
    });

    const newIncident: Incident = {
      id: 'SG-' + Math.floor(1000 + Math.random() * 9000),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type,
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      state: 'EMERGENCY',
      latitude: liveCoords.lat,
      longitude: liveCoords.lng,
      locationPrecision: gpsPrecision,
      locationName: 'Current Active Device Coordinates',
      approximateArea: 'Sector 3 / Central',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      assignedResponderId: matchedResponder.id,
      assignedResponderName: matchedResponder.name,
      assignedResponderDistance: `${matchedResponder.distanceKm} km`,
      assignedResponderETA: '3 mins',
      contactsNotifiedCount: contacts.filter(c => c.canReceiveSOS).length,
      vicinityCheckResult: vResult.emergencyEscalationRequired ? 'NO_CONTACTS_IN_VICINITY' : 'CONTACTS_IN_VICINITY',
      emergencyServiceInformed: vResult.emergencyEscalationRequired ? vResult.recommendedEmergencyAgency.name : undefined,
      emergencyServiceStatus: vResult.emergencyEscalationRequired ? 'DISPATCHED' : undefined,
      events: eventsList,
      notes: reason,
    };
    setActiveIncident(newIncident);
    setIncidents(prev => [newIncident, ...prev]);
  };

  // Attention Verification
  const verifySafeFromAttention = () => {
    setSafetyState('SAFE');
    if (activeIncident) {
      const resolvedIncident: Incident = {
        ...activeIncident,
        status: 'RESOLVED',
        state: 'SAFE',
        updatedAt: 'Just now',
        events: [
          ...activeIncident.events,
          {
            id: 'evt-' + Date.now(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'User Verified Safe',
            description: 'User confirmed well-being via attention dialog. Incident closed without escalation.',
            actor: currentUser.name,
            type: 'user',
          }
        ]
      };
      setIncidents(prev => prev.map(inc => inc.id === resolvedIncident.id ? resolvedIncident : inc));
      setActiveIncident(null);
    }
  };

  const escalateFromAttentionToEmergency = (reason = 'User indicated need for assistance during attention check') => {
    fetch('/api/escalate', { method: 'POST' }).catch(() => {});
    triggerEmergencyIncident('WELFARE_CHECK', reason);
  };

  // Responder Lifecycle
  const responderUpdateStatus = (incidentId: string, newStatus: IncidentStatus) => {
    if (newStatus === 'RESOLVED') {
      fetch(`/api/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Community incident resolved on site', responderName: activeResponder.name })
      }).catch(() => {});
    } else {
      fetch(`/api/responders/${activeResponder.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId })
      }).catch(() => {});
    }

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const updatedEvents = [
          ...inc.events,
          {
            id: 'evt-' + Date.now(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: `Responder Status: ${newStatus.replace('_', ' ')}`,
            description: `Responder updated status to ${newStatus}.`,
            actor: activeResponder.name,
            type: 'responder' as const,
          }
        ];
        const updated = { ...inc, status: newStatus, events: updatedEvents };
        if (newStatus === 'RESOLVED') {
          updated.state = 'SAFE';
          if (activeIncident?.id === incidentId) {
            setSafetyState('SAFE');
            setActiveIncident(null);
          }
        }
        return updated;
      }
      return inc;
    }));
  };

  const reassignResponder = (incidentId: string) => {
    fetch(`/api/responders/${activeResponder.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId })
    }).catch(() => {});

    const nextResponder = responders.find(r => r.id !== 'resp_anita') || responders[1];
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          assignedResponderId: nextResponder.id,
          assignedResponderName: nextResponder.name,
          assignedResponderDistance: `${nextResponder.distanceKm} km`,
          assignedResponderETA: '5 mins',
          events: [
            ...inc.events,
            {
              id: 'evt-' + Date.now(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: 'Responder Reassigned',
              description: `Primary responder timed out or declined. Automatically reassigned to ${nextResponder.name}.`,
              actor: 'Matching Engine',
              type: 'system',
            }
          ]
        };
      }
      return inc;
    }));
  };

  // Master Demo Presets (from master doc sections 73-76)
  const runSeniorCheckInDemo = () => {
    const david = personas.find(p => p.role === 'SENIOR') || personas[1];
    setCurrentUser(david);
    simulateMissedCheckIn();
  };

  const runWomanJourneyDemo = () => {
    const sarah = personas.find(p => p.role === 'CITIZEN') || personas[0];
    setCurrentUser(sarah);
    simulateOverdueJourney();
  };

  const runSOSCountdownDemo = () => {
    triggerSOS();
  };

  const runOfflineSyncDemo = () => {
    setIsOnline(false);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const offlineItem: OfflineEvent = {
      id: 'off-demo-1',
      eventType: 'CHECK_IN_LOCAL_PING',
      payload: { note: 'Offline "I am safe" recorded in subway corridor' },
      createdAt: timeNow,
      status: 'QUEUED',
    };
    setOfflineQueue([offlineItem]);
  };

  const runResponderDemo = () => {
    // Section 75: Switch to verified responder Dr. Anita Roy and view portal
    setCurrentUser(INITIAL_PERSONAS[3]);
    setViewMode('WEB');
  };

  const runAdminDemo = () => {
    // Section 76: Switch to SafeGrid Central Operations and view Admin Command Center
    setCurrentUser(INITIAL_PERSONAS[4]);
    setViewMode('WEB');
  };

  const resetAllToDefault = () => {
    fetch('/api/reset', { method: 'POST' }).catch(() => {});
    setSafetyState('SAFE');
    setActiveIncident(null);
    setIsSOSCountdownActive(false);
    setSosCountdownRemaining(10);
    setIsOnline(true);
    setOfflineQueue([]);
    setIncidents(INITIAL_INCIDENTS);
    setCheckins(INITIAL_CHECKINS);
    setJourney(INITIAL_JOURNEY);
    setCurrentUser(INITIAL_PERSONAS[0]);
  };

  return (
    <SafeGridContext.Provider
      value={{
        viewMode,
        setViewMode,
        currentUser,
        setCurrentUser,
        updateCurrentUserProfile,
        setPersonTypeAndConfigure,
        personas,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isConnectFriendModalOpen,
        setIsConnectFriendModalOpen,
        safetyState,
        setSafetyState,
        activeIncident,
        incidents,
        setIncidents,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        toggleContactPermission,
        vicinityRadiusKm,
        setVicinityRadiusKm,
        vicinityStatus,
        checkins,
        addCheckIn,
        updateCheckIn,
        deleteCheckIn,
        confirmCheckIn,
        simulateMissedCheckIn,
        journey,
        liveCoords,
        isLocatingGps,
        refreshLiveGps,
        startJourney,
        startJourneyWithInputs,
        updateJourneyLocation,
        extendJourneyETA,
        markJourneyArrived,
        cancelJourney,
        simulateOverdueJourney,
        isSOSCountdownActive,
        sosCountdownRemaining,
        triggerSOS,
        triggerEmergencyIncident,
        cancelSOS,
        verifySafeFromAttention,
        escalateFromAttentionToEmergency,
        responders,
        activeResponder,
        responderUpdateStatus,
        reassignResponder,
        isOnline,
        toggleOnlineStatus,
        offlineQueue,
        batteryLevel,
        setBatteryLevel,
        gpsPrecision,
        toggleGpsPrecision,
        activeSafetySession,
        toggleSafetySession,
        runSeniorCheckInDemo,
        runWomanJourneyDemo,
        runSOSCountdownDemo,
        runOfflineSyncDemo,
        runResponderDemo,
        runAdminDemo,
        resetAllToDefault,
      }}
    >
      {children}
    </SafeGridContext.Provider>
  );
};

export const useSafeGrid = () => {
  const context = useContext(SafeGridContext);
  if (!context) {
    throw new Error('useSafeGrid must be used within a SafeGridProvider');
  }
  return context;
};
