export type SafetyState = 'SAFE' | 'ATTENTION' | 'EMERGENCY';

export type UserRole = 'CITIZEN' | 'SENIOR' | 'GUARDIAN' | 'RESPONDER' | 'ADMIN';

export type PersonType = 
  | 'SOLO_WOMAN' 
  | 'SENIOR' 
  | 'GUARDIAN' 
  | 'STUDENT' 
  | 'RESPONDER' 
  | 'GENERAL';

export type EmergencyServiceType = 
  | 'POLICE_112' 
  | 'AMBULANCE_108' 
  | 'WOMEN_1091' 
  | 'CHILDLINE_1098' 
  | 'SENIOR_14567';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  subtitle: string;
  batteryLevel: number;
  isSeniorMode?: boolean;
  personType?: PersonType;
  primaryEmergencyNeed?: string;
  emergencyNotes?: string;
  bloodGroup?: string;
  medicalConditions?: string[];
  preferredEmergencyService?: EmergencyServiceType;
  vicinityRadiusKm?: number; // e.g., 3 km (contacts outside this are considered remote)
  onboardingCompleted?: boolean;
}

export type IncidentType = 
  | 'MANUAL_SOS'
  | 'MISSED_CHECK_IN'
  | 'OVERDUE_JOURNEY'
  | 'SESSION_INTERRUPTED'
  | 'MEDICAL_ASSIST'
  | 'WELFARE_CHECK';

export type IncidentStatus = 
  | 'CREATED'
  | 'VERIFYING'
  | 'ATTENTION'
  | 'ESCALATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'CANCELLED';

export interface IncidentEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  type: 'system' | 'user' | 'contact' | 'responder' | 'escalation';
}

export interface Incident {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: IncidentType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: IncidentStatus;
  state: SafetyState;
  latitude: number;
  longitude: number;
  locationPrecision: number; // in meters (e.g. 15m or 120m)
  locationName: string;
  approximateArea: string; // e.g. "Sector 4, West Corridor"
  createdAt: string;
  updatedAt: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  assignedResponderDistance?: string;
  assignedResponderETA?: string;
  contactsNotifiedCount: number;
  events: IncidentEvent[];
  notes?: string;
  correlatedWithId?: string; // For incident deduplication
  vicinityCheckResult?: 'CONTACTS_IN_VICINITY' | 'NO_CONTACTS_IN_VICINITY';
  emergencyServiceInformed?: string; // e.g., "112 Police Dispatch", "108 Ambulance Unit"
  emergencyServiceStatus?: 'NOTIFIED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE';
}

export interface SafetyContact {
  id: string;
  name: string;
  relationship: string; // 'Mother', 'Father', 'Spouse', 'Guardian', 'Friend', 'Neighbor', 'Doctor'
  phone: string;
  avatar: string;
  isPrimary: boolean;
  canVerifyWelfare: boolean;
  canReceiveSOS: boolean;
  canTrackLiveJourney: boolean;
  distanceKm: number; // Distance in KM from user's current location (e.g. 0.8, 2.5, 18.4)
  approxLocation: string; // e.g. "Green Glen (0.8 km)", "Downtown (4.5 km)", "Remote/Outstation (22 km)"
  address?: string;
}

export interface CheckInSchedule {
  id: string;
  label: string; // e.g., "Morning Check-in", "Afternoon Welfare", "Medication Reminder"
  scheduledTime: string; // "09:00 AM", "02:00 PM", "08:00 PM"
  isCompletedToday: boolean;
  lastRespondedAt?: string;
  gracePeriodMinutes: number; // e.g. 15 mins
  frequency?: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM';
  category?: 'WELFARE' | 'MEDICATION' | 'CURFEW' | 'TRANSIT' | 'CUSTOM';
}

export interface Journey {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  startTime: string;
  expectedArrivalTime: string; // e.g. "07:30 PM"
  actualArrivalTime?: string;
  progressPercent: number;
  status: 'NOT_STARTED' | 'ACTIVE' | 'ON_TRACK' | 'ATTENTION' | 'DELAYED' | 'OVERDUE' | 'DEVIATION' | 'ALERT' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  sharedWithCircle: boolean;
  notes?: string;
  etaExtensionsCount: number;
  transportMode?: 'WALKING' | 'DRIVING' | 'TRANSIT';
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  currentCoords?: { lat: number; lng: number; accuracy?: number; speed?: number };
  distanceKmRemaining?: number;
  calculatedEtaMinutes?: number;
  isLiveGpsActive?: boolean;
  routeSafetyScore?: number;
  isDeviated?: boolean;
  deviationDistanceMeters?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'EMERGENCY' | 'JOURNEY' | 'CIRCLE' | 'CHECKIN' | 'SYSTEM';
  isRead: boolean;
  actionUrl?: string;
  actor?: string;
}

export interface Responder {
  id: string;
  name: string;
  badgeId: string;
  phone: string;
  avatar: string;
  isVerified: boolean;
  isAvailable: boolean;
  medicalTraining: boolean;
  distanceKm: number;
  approxLocation: string;
  rating: number;
  totalAssists: number;
  specialization: string;
}

export interface OfflineEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string; // When the user initiated it locally
  syncedAt?: string;  // When the server received it
  status: 'QUEUED' | 'SYNCED';
}

export interface DuplicateIncidentCluster {
  primaryIncidentId: string;
  correlatedIncidentIds: string[];
  area: string;
  timeWindow: string;
  reason: string;
  suggestedAction: string;
}

// ----------------------------------------------------
// SAFETY ESCALATION & EVENT STATUS TYPES (Parts 5, 7, 8, 17)
// ----------------------------------------------------
export type SafetyEventStatus =
  | 'NORMAL'
  | 'CHECK_IN_DUE'
  | 'CHECK_IN_MISSED'
  | 'VERIFYING'
  | 'ESCALATING'
  | 'TRUSTED_CONTACT_NOTIFIED'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'CANCELLED';

export type BatteryStateCategory = 'NORMAL' | 'MODERATE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';

export interface BatteryInfo {
  level: number | null; // e.g. 67, or null if sensor unavailable
  isCharging: boolean | null;
  state: BatteryStateCategory;
  isAvailable: boolean;
  source: 'ANDROID_NATIVE' | 'WEB_API' | 'UNAVAILABLE';
}

export interface EscalationConfig {
  enabled: boolean;
  gracePeriodSeconds: number; // 30, 60, 120, 300
  triggers: {
    missedCheckIn: boolean;
    sosPressed: boolean;
    overdueJourney: boolean;
    unresponsivePrompt: boolean;
  };
  selectedContactIds: string[];
}

export interface DemoTimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  actor: string;
  status: SafetyEventStatus;
}

export interface DemoConfig {
  isDemoMode: boolean;
  demoUserName: string;
  demoFriendName: string;
  demoFriendPhone: string;
  userName?: string;
  friendName?: string;
  currentStep?: string;
  demoBatteryLevel?: number;
  simulatedBatteryLevel: number | null; // ONLY affects Demo Mode
  simulatedNetworkOnline: boolean;
  simulatedGpsAvailable: boolean;
  currentEventStatus: SafetyEventStatus;
  timeline: DemoTimelineItem[];
}

