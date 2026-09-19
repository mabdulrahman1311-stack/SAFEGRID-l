import { UserProfile, SafetyContact, CheckInSchedule, Journey, Responder, Incident } from '../types';

export const INITIAL_PERSONAS: UserProfile[] = [
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@safegrid.org',
    phone: '+1 (555) 349-8812',
    role: 'CITIZEN',
    personType: 'SOLO_WOMAN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    subtitle: 'Commuter • Solo Transit & Night Commute',
    batteryLevel: 68,
    isSeniorMode: false,
    primaryEmergencyNeed: 'Transit harassment deterrence, commute route escort, emergency police/women helpline dispatch',
    emergencyNotes: 'Carries emergency inhaler. Commutes daily via Metro Line 2.',
    bloodGroup: 'O+',
    medicalConditions: ['Mild Asthma'],
    preferredEmergencyService: 'WOMEN_1091',
    vicinityRadiusKm: 3.0,
    onboardingCompleted: true,
  },
  {
    id: 'user_david',
    name: 'David Vance (Senior)',
    email: 'david.vance72@safegrid.org',
    phone: '+1 (555) 782-9014',
    role: 'SENIOR',
    personType: 'SENIOR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    subtitle: 'Senior (72 y/o) • Independent Living & Fall Watch',
    batteryLevel: 42,
    isSeniorMode: true,
    primaryEmergencyNeed: 'Sudden fall or medical distress, missed medication alert, urgent ambulance/EMS dispatch',
    emergencyNotes: 'Type 2 Diabetes, Hypertension. Pacemaker implanted 2022.',
    bloodGroup: 'A+',
    medicalConditions: ['Hypertension', 'Type 2 Diabetes', 'Mobility Assist (Cane)'],
    preferredEmergencyService: 'AMBULANCE_108',
    vicinityRadiusKm: 2.5,
    onboardingCompleted: true,
  },
  {
    id: 'user_maya',
    name: 'Maya & Aarav',
    email: 'maya.parent@safegrid.org',
    phone: '+1 (555) 612-4490',
    role: 'GUARDIAN',
    personType: 'GUARDIAN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    subtitle: 'Guardian • Child School Safe Commute Circle',
    batteryLevel: 85,
    isSeniorMode: false,
    primaryEmergencyNeed: 'Child overdue from school, unauthorized route departure alert, child safety dispatch',
    emergencyNotes: 'Dependent: Aarav (11 y/o, Grade 6). School bus stops at Elm & 4th.',
    bloodGroup: 'B+',
    preferredEmergencyService: 'CHILDLINE_1098',
    vicinityRadiusKm: 5.0,
    onboardingCompleted: true,
  },
  {
    id: 'resp_anita',
    name: 'Dr. Anita Roy',
    email: 'dr.anita@safegrid-responders.org',
    phone: '+1 (555) 902-1133',
    role: 'RESPONDER',
    personType: 'RESPONDER',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    subtitle: 'Verified Community First-Aid & Medical Responder',
    batteryLevel: 94,
    primaryEmergencyNeed: 'Nearby emergency victim triage and first-aid response',
    preferredEmergencyService: 'AMBULANCE_108',
    vicinityRadiusKm: 5.0,
    onboardingCompleted: true,
  },
  {
    id: 'admin_ops',
    name: 'SafeGrid Central Operations',
    email: 'central.ops@safegrid.gov',
    phone: '+1 (555) 000-SAFE',
    role: 'ADMIN',
    personType: 'GENERAL',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    subtitle: 'City Welfare & Emergency Dispatch Admin',
    batteryLevel: 100,
    primaryEmergencyNeed: 'Citywide emergency dispatch coordination and duplicate correlation',
    preferredEmergencyService: 'POLICE_112',
    vicinityRadiusKm: 10.0,
    onboardingCompleted: true,
  }
];

export const INITIAL_CONTACTS: SafetyContact[] = [
  {
    id: 'contact_1',
    name: 'Elena Jenkins',
    relationship: 'Mother',
    phone: '+1 (555) 234-9988',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    isPrimary: true,
    canVerifyWelfare: true,
    canReceiveSOS: true,
    canTrackLiveJourney: true,
    distanceKm: 18.4, // Remote: outside standard 3km vicinity
    approxLocation: 'North Suburbs (18.4 km away)',
    address: '42 Pine Crest Blvd, North Suburbs',
  },
  {
    id: 'contact_2',
    name: 'Marcus Vance',
    relationship: 'Son (Primary Caregiver)',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isPrimary: true,
    canVerifyWelfare: true,
    canReceiveSOS: true,
    canTrackLiveJourney: true,
    distanceKm: 12.1, // Remote
    approxLocation: 'East Tech Park (12.1 km away)',
    address: 'B-104 Cyber City',
  },
  {
    id: 'contact_3',
    name: 'Chloe Lin',
    relationship: 'Trusted Neighbor',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isPrimary: false,
    canVerifyWelfare: true,
    canReceiveSOS: true,
    canTrackLiveJourney: false,
    distanceKm: 0.6, // In immediate vicinity (< 3km)
    approxLocation: 'Same Apartment Block (0.6 km away)',
    address: 'Flat 302, West Oak Ave',
  },
  {
    id: 'contact_4',
    name: 'Officer Rajiv Patel',
    relationship: 'Community Warden',
    phone: '+1 (555) 678-4321',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    isPrimary: false,
    canVerifyWelfare: true,
    canReceiveSOS: true,
    canTrackLiveJourney: true,
    distanceKm: 1.4, // In vicinity (< 3km)
    approxLocation: 'Sector 4 Precinct (1.4 km away)',
    address: 'Station House, Sector 4',
  }
];

export const INITIAL_CHECKINS: CheckInSchedule[] = [
  {
    id: 'chk_morning',
    label: 'Morning Wellness Check',
    scheduledTime: '09:00 AM',
    isCompletedToday: true,
    lastRespondedAt: '08:52 AM Today',
    gracePeriodMinutes: 20,
    frequency: 'DAILY',
    category: 'WELFARE',
  },
  {
    id: 'chk_afternoon',
    label: 'Afternoon Safety Ping',
    scheduledTime: '02:30 PM',
    isCompletedToday: false,
    gracePeriodMinutes: 15,
    frequency: 'DAILY',
    category: 'WELFARE',
  },
  {
    id: 'chk_night',
    label: 'Night-Time Safe Home',
    scheduledTime: '08:30 PM',
    isCompletedToday: false,
    gracePeriodMinutes: 30,
    frequency: 'DAILY',
    category: 'CURFEW',
  }
];

export const INITIAL_JOURNEY: Journey = {
  id: 'jny_metro_commute',
  userId: 'user_sarah',
  origin: 'University Tech Hub / College',
  destination: 'West Residence, Maple Avenue',
  startTime: '06:15 PM',
  expectedArrivalTime: '07:00 PM',
  progressPercent: 65,
  status: 'ACTIVE',
  sharedWithCircle: true,
  notes: 'Metro Yellow Line, Coach #4. Expected walking segment through Oak St.',
  etaExtensionsCount: 0,
  transportMode: 'TRANSIT',
  originCoords: { lat: 12.9716, lng: 77.5946 },
  destinationCoords: { lat: 12.9352, lng: 77.6245 },
  currentCoords: { lat: 12.9510, lng: 77.6080, accuracy: 12, speed: 22 },
  distanceKmRemaining: 3.2,
  calculatedEtaMinutes: 12,
  isLiveGpsActive: true,
};

export const INITIAL_RESPONDERS: Responder[] = [
  {
    id: 'resp_anita',
    name: 'Dr. Anita Roy',
    badgeId: 'SG-MED-104',
    phone: '+1 (555) 902-1133',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isAvailable: true,
    medicalTraining: true,
    distanceKm: 0.8,
    approxLocation: 'Oak & 5th Ave (Sector 4)',
    rating: 4.96,
    totalAssists: 48,
    specialization: 'Emergency Medicine & CPR',
  },
  {
    id: 'resp_ravi',
    name: 'Ravi Kumar',
    badgeId: 'SG-VOL-392',
    phone: '+1 (555) 431-8899',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isAvailable: true,
    medicalTraining: false,
    distanceKm: 1.2,
    approxLocation: 'Metro Central Station (Sector 4)',
    rating: 4.88,
    totalAssists: 31,
    specialization: 'Rapid Physical Escort & Transit',
  },
  {
    id: 'resp_clara',
    name: 'Clara Bennett',
    badgeId: 'SG-SEN-811',
    phone: '+1 (555) 774-2201',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isAvailable: true,
    medicalTraining: true,
    distanceKm: 1.9,
    approxLocation: 'Hillcrest Community Center',
    rating: 4.92,
    totalAssists: 64,
    specialization: 'Elderly Care & Welfare Checks',
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'SG-4091',
    userId: 'user_david',
    userName: 'David Vance (Senior)',
    userPhone: '+1 (555) 782-9014',
    type: 'MISSED_CHECK_IN',
    priority: 'HIGH',
    status: 'ESCALATED',
    state: 'EMERGENCY',
    latitude: 37.7749,
    longitude: -122.4194,
    locationPrecision: 18,
    locationName: 'North Pine Apt 4B',
    approximateArea: 'Sector 3, Downtown Residential',
    createdAt: '12 mins ago',
    updatedAt: '2 mins ago',
    assignedResponderId: 'resp_anita',
    assignedResponderName: 'Dr. Anita Roy',
    assignedResponderDistance: '0.8 km',
    assignedResponderETA: '3 mins',
    contactsNotifiedCount: 2,
    events: [
      {
        id: 'evt-1',
        timestamp: '14:30',
        title: 'Check-in Scheduled Signal Missing',
        description: 'Scheduled afternoon wellness ping was not acknowledged.',
        actor: 'System Safety Engine',
        type: 'system',
      },
      {
        id: 'evt-2',
        timestamp: '14:45',
        title: 'Grace Period Expired (ATTENTION)',
        description: 'Audible reminder sent to user. No response received.',
        actor: 'System Safety Engine',
        type: 'escalation',
      },
      {
        id: 'evt-3',
        timestamp: '14:48',
        title: 'Safety Circle Notified',
        description: 'SMS and push sent to son Marcus Vance.',
        actor: 'Contact Engine',
        type: 'contact',
      },
      {
        id: 'evt-4',
        timestamp: '14:52',
        title: 'Escalated to Verified Community Responder',
        description: 'Matched Dr. Anita Roy (0.8km away, medical certified).',
        actor: 'Dispatch Matcher',
        type: 'responder',
      }
    ],
    notes: 'Senior citizen missed 2:30 PM safety check-in. Primary contact confirmed father has not answered home phone.',
  },
  {
    id: 'SG-4089',
    userId: 'user_sarah',
    userName: 'Sarah Jenkins',
    userPhone: '+1 (555) 349-8812',
    type: 'OVERDUE_JOURNEY',
    priority: 'MEDIUM',
    status: 'ATTENTION',
    state: 'ATTENTION',
    latitude: 37.7812,
    longitude: -122.4121,
    locationPrecision: 24,
    locationName: 'Transit Hub 4th & Market',
    approximateArea: 'Sector 4, Central Corridor',
    createdAt: '8 mins ago',
    updatedAt: '1 min ago',
    contactsNotifiedCount: 1,
    events: [
      {
        id: 'evt-10',
        timestamp: '19:00',
        title: 'Journey ETA Reached Without Safe Arrival',
        description: 'Expected arrival 19:00 passed. System entered verification grace period.',
        actor: 'Journey Monitor',
        type: 'system',
      },
      {
        id: 'evt-11',
        timestamp: '19:05',
        title: 'Verification Prompt Dispatched',
        description: 'Prompted: "Are you safe?" with 5-min extension option.',
        actor: 'Safety Engine',
        type: 'system',
      }
    ],
    notes: 'Journey from College overdue by 8 minutes. User prompted to extend ETA if transit delayed.',
  }
];

export const JURY_QA_ITEMS = [
  {
    question: "What happens if the person cannot press SOS?",
    answer: "SAFEGRID doesn't depend entirely on manual SOS. Scheduled check-ins, expected-arrival journeys, and active safety sessions provide proactive signals. If an expected signal is missed, the system progressively transitions from SAFE to ATTENTION and starts a welfare-verification workflow before escalating to trusted contacts and verified responders."
  },
  {
    question: "What if the phone is destroyed or smashed?",
    answer: "A completely destroyed or permanently disconnected device cannot magically transmit new data. SAFEGRID acknowledges this real-world limitation honestly. The platform acts on the last verified safety signal, session heartbeat, and expected arrival timestamp recorded on the server before the interruption occurred."
  },
  {
    question: "What if there is no internet?",
    answer: "SAFEGRID implements a local offline event queue. When connectivity drops, user actions (such as 'I'M OK' or starting a journey) are queued locally and automatically synchronized with dual timestamps (eventCreatedAt vs eventReceivedAt) once network returns, preserving the true audit timeline."
  },
  {
    question: "Does offline status mean kidnapping or danger?",
    answer: "No. Offline status is only an unverified signal. It could be caused by dead battery, airplane mode, subway transit, or poor network. SAFEGRID enters an ATTENTION verification phase and avoids triggering premature emergency responses."
  },
  {
    question: "How do you prevent false alarms?",
    answer: "Through progressive verification: 10-second cancellation countdown for manual SOS, 15-minute grace periods with gentle audio reminders for missed check-ins, and one-tap +10/+20min ETA extensions for commute delays."
  },
  {
    question: "Does SAFEGRID contact 911/Police directly in this prototype?",
    answer: "No. We deliberately separate software workflows from official emergency integrations. Official dispatch integration requires municipal authorization and legal compliance. Our prototype demonstrates the private Safety Circle + Verified Community Responder tier."
  },
  {
    question: "Do you need AI for this?",
    answer: "No. The core safety problem is solved with deterministic state machines, configurable grace rules, and transparent matching algorithms. Rule-based engines are reliable, explainable, and free of hallucinations during life-critical welfare checks."
  },
  {
    question: "How do you protect location privacy?",
    answer: "Exact GPS coordinates are never publicly broadcast. Responders receive approximate quadrant radii until dispatch is officially accepted. Public community maps only show aggregated zone density. Safety circle tracking is strictly opt-in per active journey."
  },
  {
    question: "What if multiple people report the same incident?",
    answer: "SAFEGRID incorporates an Incident Correlation & Deduplication engine that clusters reports by approximate location (within 200m) and timestamp window (within 5 minutes) to prevent duplicate responder dispatching."
  }
];
