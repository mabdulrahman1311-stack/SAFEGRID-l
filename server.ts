import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// DATA MODELS & TYPES
// ==========================================
export interface SafetyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatar: string;
  isPrimary: boolean;
  canVerifyWelfare: boolean;
  canReceiveSOS: boolean;
  canTrackLiveJourney: boolean;
  distanceKm: number;
  approxLocation: string;
  address?: string;
}

export interface CheckInSchedule {
  id: string;
  label: string;
  scheduledTime: string;
  isCompletedToday: boolean;
  lastRespondedAt?: string;
  gracePeriodMinutes: number;
  frequency: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM';
  category: 'WELFARE' | 'MEDICATION' | 'CURFEW' | 'TRANSIT' | 'CUSTOM';
}

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
  type: 'MANUAL_SOS' | 'MISSED_CHECK_IN' | 'OVERDUE_JOURNEY' | 'SESSION_INTERRUPTED' | 'MEDICAL_ASSIST' | 'WELFARE_CHECK';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'CREATED' | 'VERIFYING' | 'ATTENTION' | 'ESCALATED' | 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED';
  state: 'SAFE' | 'ATTENTION' | 'EMERGENCY';
  latitude: number;
  longitude: number;
  locationPrecision: number;
  locationName: string;
  approximateArea: string;
  createdAt: string;
  updatedAt: string;
  assignedResponderId?: string | null;
  assignedResponderName?: string | null;
  assignedResponderDistance?: string | null;
  assignedResponderETA?: string | null;
  contactsNotifiedCount: number;
  events: IncidentEvent[];
  notes?: string;
  vicinityCheckResult?: 'CONTACTS_IN_VICINITY' | 'NO_CONTACTS_IN_VICINITY';
  emergencyServiceInformed?: string;
  emergencyServiceStatus?: 'NOTIFIED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE';
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
  assignedIncidentId?: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  details: string;
}

export interface Journey {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  startTime: string;
  expectedArrivalTime: string;
  actualArrivalTime?: string;
  progressPercent: number;
  status: 'ACTIVE' | 'OVERDUE' | 'ARRIVED' | 'CANCELLED';
  sharedWithCircle: boolean;
  notes?: string;
  etaExtensionsCount: number;
  transportMode?: 'WALKING' | 'DRIVING' | 'TRANSIT';
  distanceKmRemaining?: number;
  calculatedEtaMinutes?: number;
}

// ==========================================
// SEED IN-MEMORY STORE
// ==========================================
function getNowFormatted(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let dbContacts: SafetyContact[] = [
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
    distanceKm: 0.8,
    approxLocation: 'Green Glen Sector (0.8 km)',
    address: 'Apt 4B, Pinecrest Towers'
  },
  {
    id: 'contact_2',
    name: 'Marcus Vance',
    relationship: 'Son',
    phone: '+1 (555) 912-3344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isPrimary: true,
    canVerifyWelfare: true,
    canReceiveSOS: true,
    canTrackLiveJourney: true,
    distanceKm: 1.4,
    approxLocation: 'Oakridge Avenue (1.4 km)',
    address: '74 Oakridge Avenue'
  },
  {
    id: 'contact_3',
    name: 'Officer David Diaz',
    relationship: 'Campus Security',
    phone: '+1 (555) 300-1122',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    isPrimary: false,
    canVerifyWelfare: false,
    canReceiveSOS: true,
    canTrackLiveJourney: true,
    distanceKm: 2.1,
    approxLocation: 'North Gate Campus Guard Post (2.1 km)',
    address: 'Campus North Security Gate'
  },
  {
    id: 'contact_4',
    name: 'Priya Nair',
    relationship: 'Neighbor / Friend',
    phone: '+1 (555) 883-2211',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
    isPrimary: false,
    canVerifyWelfare: true,
    canReceiveSOS: true,
    canTrackLiveJourney: false,
    distanceKm: 18.2,
    approxLocation: 'Remote Outstation District (18.2 km)',
    address: 'East Suburb Tech Park'
  }
];

let dbSchedules: CheckInSchedule[] = [
  {
    id: 'checkin_morning',
    label: 'Morning Welfare Check',
    scheduledTime: '09:00 AM',
    isCompletedToday: true,
    lastRespondedAt: '08:52 AM',
    gracePeriodMinutes: 15,
    frequency: 'DAILY',
    category: 'WELFARE'
  },
  {
    id: 'checkin_medication',
    label: 'Afternoon Medication & Blood Pressure',
    scheduledTime: '02:00 PM',
    isCompletedToday: false,
    gracePeriodMinutes: 30,
    frequency: 'DAILY',
    category: 'MEDICATION'
  },
  {
    id: 'checkin_evening',
    label: 'Night Curfew & Safe Return',
    scheduledTime: '10:30 PM',
    isCompletedToday: false,
    gracePeriodMinutes: 15,
    frequency: 'WEEKDAYS',
    category: 'CURFEW'
  }
];

let dbResponders: Responder[] = [
  {
    id: 'resp_1',
    name: 'Dr. Anita Roy',
    badgeId: 'MED-9042',
    phone: '+1 (555) 902-1133',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isAvailable: true,
    medicalTraining: true,
    distanceKm: 0.8,
    approxLocation: 'Sector 4 Health Hub (0.8 km)',
    rating: 4.9,
    totalAssists: 48,
    specialization: 'Emergency Physician / First-Aid',
    assignedIncidentId: null
  },
  {
    id: 'resp_2',
    name: 'Officer Liam Davis',
    badgeId: 'POL-1102',
    phone: '+1 (555) 771-4499',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isAvailable: true,
    medicalTraining: false,
    distanceKm: 1.2,
    approxLocation: 'Sector 2 Patrol Beat (1.2 km)',
    rating: 4.8,
    totalAssists: 112,
    specialization: 'Community Patrol & Rapid Intervention',
    assignedIncidentId: null
  },
  {
    id: 'resp_3',
    name: 'EMT Carlos Santos',
    badgeId: 'EMS-3381',
    phone: '+1 (555) 882-9900',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    isAvailable: true,
    medicalTraining: true,
    distanceKm: 2.4,
    approxLocation: 'Metro Ambulance Bay 3 (2.4 km)',
    rating: 4.9,
    totalAssists: 94,
    specialization: 'Paramedic / Trauma Support',
    assignedIncidentId: null
  }
];

let dbIncidents: Incident[] = [];

let dbAuditLogs: AuditLog[] = [
  {
    id: 'aud_1',
    action: 'SERVICE_INITIALIZATION',
    actor: 'SYSTEM',
    actorRole: 'SYSTEM',
    timestamp: getNowFormatted(),
    details: 'SafeGrid Welfare Core service booted. Initialized security protocols and verified responder registry.'
  }
];

interface ServerState {
  safetyState: 'SAFE' | 'ATTENTION' | 'EMERGENCY';
  checkIn: {
    scheduled: boolean;
    status: string;
    time: string;
  };
  journey: {
    active: boolean;
    status: string;
    destination: string;
    origin?: string;
    expectedArrival: string;
    startTime?: string;
    distanceKmRemaining?: number;
  };
  incident: Incident | null;
  location?: {
    latitude: number;
    longitude: number;
    locationName: string;
    approximateArea: string;
    accuracy: number;
    speed: number;
    updatedAt: string;
  };
  activity: Array<{
    id: string;
    time: string;
    text: string;
    type?: 'system' | 'user' | 'responder' | 'escalation';
  }>;
}

let currentState: ServerState = {
  safetyState: 'SAFE',
  checkIn: {
    scheduled: true,
    status: 'SCHEDULED',
    time: '09:00 AM'
  },
  journey: {
    active: false,
    status: 'NONE',
    destination: 'Central Transit Hub',
    origin: 'Campus North Gate',
    expectedArrival: '07:45 PM',
    distanceKmRemaining: 3.2
  },
  incident: null,
  location: {
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: 'Central Metro Corridor',
    approximateArea: 'Bengaluru Central',
    accuracy: 12,
    speed: 0,
    updatedAt: getNowFormatted()
  },
  activity: [
    { id: '1', time: getNowFormatted(), text: 'SafeGrid Welfare Core service initialized.', type: 'system' },
    { id: '2', time: getNowFormatted(), text: 'Safety state: SAFE. All background signals normal.', type: 'system' }
  ]
};

function logActivity(text: string, type: 'system' | 'user' | 'responder' | 'escalation' = 'system') {
  const time = getNowFormatted();
  currentState.activity.unshift({
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    time,
    text,
    type
  });
  if (currentState.activity.length > 30) {
    currentState.activity = currentState.activity.slice(0, 30);
  }

  // Also log to audit logs
  dbAuditLogs.unshift({
    id: 'aud_' + Date.now(),
    action: type.toUpperCase(),
    actor: type === 'responder' ? 'COMMUNITY_RESPONDER' : type === 'user' ? 'CITIZEN' : 'SAFEGRID_SYSTEM',
    actorRole: type === 'responder' ? 'RESPONDER' : type === 'user' ? 'USER' : 'SYSTEM',
    timestamp: time,
    details: text
  });
  if (dbAuditLogs.length > 50) {
    dbAuditLogs = dbAuditLogs.slice(0, 50);
  }
}

// ==========================================
// SERVER APP INITIALIZATION
// ==========================================
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ----------------------------------------------------
  // HEALTH & DIAGNOSTIC ENDPOINTS
  // ----------------------------------------------------
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SAFEGRID Emergency & Welfare Core',
      version: '2.4.0',
      time: new Date().toISOString(),
      activeIncidents: dbIncidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length,
      safetyState: currentState.safetyState
    });
  });

  app.get('/api/state', (req: Request, res: Response) => {
    res.json(currentState);
  });

  // ----------------------------------------------------
  // CONTACTS CRUD (/api/contacts)
  // ----------------------------------------------------
  app.get('/api/contacts', (req: Request, res: Response) => {
    res.json({ success: true, contacts: dbContacts });
  });

  app.post('/api/contacts', (req: Request, res: Response) => {
    const { name, phone, relationship, distanceKm, approxLocation, canVerifyWelfare, canReceiveSOS, canTrackLiveJourney, isPrimary } = req.body || {};

    if (!name || !phone) {
      res.status(400).json({ success: false, error: 'Name and phone are required fields' });
      return;
    }

    const newContact: SafetyContact = {
      id: 'contact_' + Date.now(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      relationship: relationship || 'Friend',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isPrimary: Boolean(isPrimary),
      canVerifyWelfare: canVerifyWelfare !== undefined ? Boolean(canVerifyWelfare) : true,
      canReceiveSOS: canReceiveSOS !== undefined ? Boolean(canReceiveSOS) : true,
      canTrackLiveJourney: Boolean(canTrackLiveJourney),
      distanceKm: typeof distanceKm === 'number' ? distanceKm : 1.5,
      approxLocation: approxLocation || 'Nearby (~1.5 km)'
    };

    dbContacts.push(newContact);
    logActivity(`👤 Added contact "${newContact.name}" (${newContact.relationship}) to Safety Circle.`, 'user');
    res.status(201).json({ success: true, contact: newContact, contacts: dbContacts });
  });

  app.put('/api/contacts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dbContacts.findIndex(c => c.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }

    dbContacts[index] = { ...dbContacts[index], ...req.body, id };
    logActivity(`👤 Updated contact "${dbContacts[index].name}" permissions in Safety Circle.`, 'user');
    res.json({ success: true, contact: dbContacts[index], contacts: dbContacts });
  });

  app.delete('/api/contacts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const found = dbContacts.find(c => c.id === id);
    if (!found) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }

    dbContacts = dbContacts.filter(c => c.id !== id);
    logActivity(`👤 Removed contact "${found.name}" from Safety Circle.`, 'user');
    res.json({ success: true, message: 'Contact deleted', contacts: dbContacts });
  });

  // ----------------------------------------------------
  // CHECK-IN SCHEDULES CRUD (/api/schedules)
  // ----------------------------------------------------
  app.get('/api/schedules', (req: Request, res: Response) => {
    res.json({ success: true, schedules: dbSchedules });
  });

  app.post('/api/schedules', (req: Request, res: Response) => {
    const { label, scheduledTime, gracePeriodMinutes, frequency, category } = req.body || {};
    if (!label || !scheduledTime) {
      res.status(400).json({ success: false, error: 'Label and scheduledTime are required' });
      return;
    }

    const newSchedule: CheckInSchedule = {
      id: 'checkin_' + Date.now(),
      label: String(label).trim(),
      scheduledTime: String(scheduledTime).trim(),
      gracePeriodMinutes: gracePeriodMinutes || 15,
      frequency: frequency || 'DAILY',
      category: category || 'WELFARE',
      isCompletedToday: false
    };

    dbSchedules.push(newSchedule);
    logActivity(`🕒 Created scheduled check-in "${newSchedule.label}" at ${newSchedule.scheduledTime}.`, 'user');
    res.status(201).json({ success: true, schedule: newSchedule, schedules: dbSchedules });
  });

  app.put('/api/schedules/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dbSchedules.findIndex(s => s.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Schedule not found' });
      return;
    }

    dbSchedules[index] = { ...dbSchedules[index], ...req.body, id };
    logActivity(`🕒 Updated schedule "${dbSchedules[index].label}".`, 'user');
    res.json({ success: true, schedule: dbSchedules[index], schedules: dbSchedules });
  });

  app.delete('/api/schedules/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    dbSchedules = dbSchedules.filter(s => s.id !== id);
    logActivity(`🕒 Removed check-in schedule #${id}.`, 'user');
    res.json({ success: true, schedules: dbSchedules });
  });

  // ----------------------------------------------------
  // INCIDENTS & TIMELINE REST API
  // ----------------------------------------------------
  app.get('/api/incidents', (req: Request, res: Response) => {
    res.json({ success: true, incidents: dbIncidents });
  });

  app.get('/api/incidents/:id', (req: Request, res: Response) => {
    const incident = dbIncidents.find(i => i.id === req.params.id);
    if (!incident) {
      res.status(404).json({ success: false, error: 'Incident not found' });
      return;
    }
    res.json({ success: true, incident });
  });

  // POST /api/incidents: Create incident
  app.post('/api/incidents', (req: Request, res: Response) => {
    const { type, locationName, approximateArea, latitude, longitude, vicinityCheckResult, emergencyServiceInformed, notes } = req.body || {};
    const nowStr = getNowFormatted();
    const incId = 'INC-' + Math.floor(1000 + Math.random() * 9000);

    const isEmergency = type === 'MANUAL_SOS' || type === 'MEDICAL_ASSIST';
    const safetyState = isEmergency ? 'EMERGENCY' : 'ATTENTION';
    const status = isEmergency ? 'ESCALATED' : 'ATTENTION';

    const events: IncidentEvent[] = [
      {
        id: 'evt_1',
        timestamp: nowStr,
        title: isEmergency ? 'Emergency Signal Triggered' : 'Attention Signal Registered',
        description: notes || `Incident registered at ${locationName || 'Current Location'}.`,
        actor: 'User Signal',
        type: 'user'
      }
    ];

    if (emergencyServiceInformed) {
      events.push({
        id: 'evt_2',
        timestamp: nowStr,
        title: 'Emergency Agency Alerted',
        description: `Automated escalation routed to ${emergencyServiceInformed} due to nearest vicinity status (${vicinityCheckResult || 'Standard'}).`,
        actor: 'SafeGrid Escalation Engine',
        type: 'escalation'
      });
    }

    const newIncident: Incident = {
      id: incId,
      userId: 'user_sarah',
      userName: 'Sarah Jenkins',
      userPhone: '+1 (555) 349-8812',
      type: type || 'MANUAL_SOS',
      priority: isEmergency ? 'CRITICAL' : 'MEDIUM',
      status,
      state: safetyState,
      latitude: typeof latitude === 'number' ? latitude : (currentState.location?.latitude ?? 12.9716),
      longitude: typeof longitude === 'number' ? longitude : (currentState.location?.longitude ?? 77.5946),
      locationPrecision: 15,
      locationName: locationName || currentState.location?.locationName || 'Live GPS Position',
      approximateArea: approximateArea || currentState.location?.approximateArea || 'Active Zone',
      createdAt: nowStr,
      updatedAt: nowStr,
      contactsNotifiedCount: dbContacts.filter(c => c.canReceiveSOS).length,
      events,
      notes,
      vicinityCheckResult: vicinityCheckResult || 'CONTACTS_IN_VICINITY',
      emergencyServiceInformed
    };

    dbIncidents.unshift(newIncident);
    currentState.incident = newIncident;
    currentState.safetyState = safetyState;

    logActivity(`🚨 Incident #${incId} created [${safetyState}] - ${newIncident.locationName}`, 'escalation');
    res.status(201).json({ success: true, incident: newIncident, state: currentState });
  });

  // POST /api/incidents/:id/cancel: Abort countdown / cancel incident
  app.post('/api/incidents/:id/cancel', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body || {};
    const incident = dbIncidents.find(i => i.id === id);

    if (incident) {
      incident.status = 'CANCELLED';
      incident.state = 'SAFE';
      incident.updatedAt = getNowFormatted();
      incident.events.push({
        id: 'evt_' + Date.now(),
        timestamp: getNowFormatted(),
        title: 'Incident Cancelled / Aborted',
        description: reason || 'User aborted alert within grace period.',
        actor: 'User',
        type: 'user'
      });
    }

    if (currentState.incident?.id === id) {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity(`🟢 Incident #${id} cancelled safely by user ("${reason || 'False alarm / cancelled'}").`, 'user');
    res.json({ success: true, message: 'Incident cancelled', state: currentState });
  });

  // POST /api/incidents/:id/resolve: Mark resolved
  app.post('/api/incidents/:id/resolve', (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes, responderName } = req.body || {};
    const incident = dbIncidents.find(i => i.id === id);

    if (incident) {
      incident.status = 'RESOLVED';
      incident.state = 'SAFE';
      incident.updatedAt = getNowFormatted();
      incident.events.push({
        id: 'evt_' + Date.now(),
        timestamp: getNowFormatted(),
        title: 'Incident Resolved',
        description: notes || `Resolved by responder ${responderName || incident.assignedResponderName || 'Community First Responder'}.`,
        actor: responderName || 'Responder',
        type: 'responder'
      });
    }

    currentState.safetyState = 'SAFE';
    if (currentState.incident?.id === id || !currentState.incident) {
      currentState.incident = null;
    }

    logActivity(`🟢 Incident #${id} marked as ASSISTED & RESOLVED. All signals normal.`, 'responder');
    res.json({ success: true, message: 'Incident resolved', state: currentState });
  });

  // ----------------------------------------------------
  // RESPONDER CONFLICT HANDLING & ATOMIC DISPATCH
  // ----------------------------------------------------
  app.get('/api/responders', (req: Request, res: Response) => {
    res.json({ success: true, responders: dbResponders });
  });

  // POST /api/responders/:id/accept - ATOMIC ASSIGNMENT with 409 Conflict check!
  app.post('/api/responders/:id/accept', (req: Request, res: Response) => {
    const { id } = req.params;
    const { incidentId } = req.body || {};

    const responder = dbResponders.find(r => r.id === id);
    if (!responder) {
      res.status(404).json({ success: false, error: 'Responder not found' });
      return;
    }

    let targetIncident = incidentId ? dbIncidents.find(i => i.id === incidentId) : currentState.incident;

    // If no incident currently exists, auto-bootstrap one so assignment succeeds safely
    if (!targetIncident) {
      const incId = 'INC-' + Math.floor(1000 + Math.random() * 9000);
      const nowStr = getNowFormatted();
      targetIncident = {
        id: incId,
        userId: 'user_sarah',
        userName: 'Sarah Jenkins',
        userPhone: '+1 (555) 349-8812',
        type: 'MANUAL_SOS',
        priority: 'CRITICAL',
        status: 'ESCALATED',
        state: 'EMERGENCY',
        latitude: 37.7749,
        longitude: -122.4194,
        locationPrecision: 15,
        locationName: 'Sector 4, West Corridor (~15m)',
        approximateArea: 'Sector 4, West Hub',
        createdAt: nowStr,
        updatedAt: nowStr,
        contactsNotifiedCount: 3,
        events: [],
        vicinityCheckResult: 'CONTACTS_IN_VICINITY'
      };
      dbIncidents.unshift(targetIncident);
      currentState.incident = targetIncident;
      currentState.safetyState = 'EMERGENCY';
    }

    // ATOMIC CONFLICT CHECK: Is this incident already accepted by someone else?
    if (targetIncident.assignedResponderId && targetIncident.assignedResponderId !== id) {
      res.status(409).json({
        success: false,
        error: 'Incident already assigned to another responder',
        assignedTo: targetIncident.assignedResponderName,
        assignedAt: targetIncident.updatedAt
      });
      return;
    }

    // Assign atomically
    targetIncident.assignedResponderId = responder.id;
    targetIncident.assignedResponderName = responder.name;
    targetIncident.assignedResponderDistance = `${responder.distanceKm} km (ETA ~3m)`;
    targetIncident.status = 'EN_ROUTE';
    targetIncident.updatedAt = getNowFormatted();

    responder.isAvailable = false;
    responder.assignedIncidentId = targetIncident.id;

    targetIncident.events.push({
      id: 'evt_' + Date.now(),
      timestamp: getNowFormatted(),
      title: 'Responder Dispatched & En Route',
      description: `Verified responder ${responder.name} accepted dispatch (${responder.distanceKm} km away).`,
      actor: responder.name,
      type: 'responder'
    });

    currentState.incident = targetIncident;
    currentState.safetyState = 'EMERGENCY';

    logActivity(`🚑 Verified Responder ${responder.name} (${responder.distanceKm} km away) accepted dispatch and is en route.`, 'responder');
    res.json({ success: true, message: 'Responder assigned successfully', incident: targetIncident, state: currentState });
  });

  // POST /api/responders/:id/reject - decline offer
  app.post('/api/responders/:id/reject', (req: Request, res: Response) => {
    const { id } = req.params;
    const { incidentId } = req.body || {};
    const responder = dbResponders.find(r => r.id === id);

    logActivity(`⚠️ Responder ${responder?.name || id} declined dispatch for Incident #${incidentId || 'active'}. Routing to next nearby responder.`, 'responder');
    res.json({ success: true, message: 'Responder declined; alert rerouted to standby responders.' });
  });

  // ----------------------------------------------------
  // BACKWARDS-COMPATIBLE WORKFLOW ENDPOINTS
  // ----------------------------------------------------
  app.post('/api/location', (req: Request, res: Response) => {
    const { latitude, longitude, locationName, approximateArea, accuracy, speed } = req.body || {};
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      currentState.location = {
        latitude,
        longitude,
        locationName: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        approximateArea: approximateArea || 'Active Telemetry Zone',
        accuracy: typeof accuracy === 'number' ? accuracy : 15,
        speed: typeof speed === 'number' ? speed : 0,
        updatedAt: getNowFormatted()
      };
      if (currentState.incident) {
        currentState.incident.latitude = latitude;
        currentState.incident.longitude = longitude;
        if (locationName) currentState.incident.locationName = locationName;
        if (approximateArea) currentState.incident.approximateArea = approximateArea;
      }
    }
    res.json({ success: true, location: currentState.location, incident: currentState.incident });
  });

  app.post('/api/sos', (req: Request, res: Response) => {
    currentState.safetyState = 'EMERGENCY';
    const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = getNowFormatted();

    const { latitude, longitude, locationName, approximateArea, userName, userPhone, type, notes } = req.body || {};

    const effLat = typeof latitude === 'number' ? latitude : (currentState.location?.latitude ?? 12.9716);
    const effLng = typeof longitude === 'number' ? longitude : (currentState.location?.longitude ?? 77.5946);
    const effLoc = locationName || currentState.location?.locationName || `GPS: ${effLat.toFixed(4)}, ${effLng.toFixed(4)}`;
    const effArea = approximateArea || currentState.location?.approximateArea || 'Active Telemetry Zone';

    const inc: Incident = {
      id: incId,
      userId: 'user_sarah',
      userName: userName || 'Sarah Jenkins',
      userPhone: userPhone || '+1 (555) 349-8812',
      type: type || 'MANUAL_SOS',
      priority: 'CRITICAL',
      status: 'ESCALATED',
      state: 'EMERGENCY',
      locationName: effLoc,
      approximateArea: effArea,
      latitude: effLat,
      longitude: effLng,
      locationPrecision: 15,
      createdAt: nowStr,
      updatedAt: nowStr,
      contactsNotifiedCount: dbContacts.filter(c => c.canReceiveSOS).length,
      events: [
        {
          id: 'evt_1',
          timestamp: nowStr,
          title: 'Manual SOS Triggered',
          description: notes || 'User activated SOS with immediate escalation.',
          actor: userName || 'Sarah Jenkins',
          type: 'escalation'
        }
      ]
    };

    dbIncidents.unshift(inc);
    currentState.incident = inc;
    if (currentState.location) {
      currentState.location.latitude = effLat;
      currentState.location.longitude = effLng;
      currentState.location.locationName = effLoc;
      currentState.location.approximateArea = effArea;
    }

    logActivity(`🔴 Manual SOS triggered at ${effLoc}! Emergency responders & safety circle alerted. Incident #${incId}`, 'escalation');
    res.json({ success: true, message: 'Emergency SOS triggered', state: currentState, incident: inc });
  });

  app.post('/api/checkin', (req: Request, res: Response) => {
    const { time } = req.body || {};
    const checkinTime = time || '10:00 AM';

    currentState.checkIn = {
      scheduled: true,
      status: 'SCHEDULED',
      time: checkinTime
    };

    logActivity(`🕒 Scheduled check-in configured for ${checkinTime}.`, 'user');
    res.json({ success: true, message: 'Check-in scheduled', state: currentState });
  });

  app.post('/api/checkin/complete', (req: Request, res: Response) => {
    currentState.checkIn.status = 'COMPLETED';
    currentState.checkIn.scheduled = false;

    if (currentState.safetyState === 'ATTENTION' && currentState.incident?.type === 'MISSED_CHECK_IN') {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity('✅ User confirmed welfare check-in ("I\'M OK"). Verification confirmed.', 'user');
    res.json({ success: true, message: 'Check-in completed', state: currentState });
  });

  app.post('/api/checkin/missed', (req: Request, res: Response) => {
    currentState.checkIn.status = 'MISSED';
    currentState.safetyState = 'ATTENTION';
    const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = getNowFormatted();

    const inc: Incident = {
      id: incId,
      userId: 'user_sarah',
      userName: 'Sarah Jenkins',
      userPhone: '+1 (555) 349-8812',
      type: 'MISSED_CHECK_IN',
      priority: 'MEDIUM',
      status: 'ATTENTION',
      state: 'ATTENTION',
      locationName: 'Residence Sector 3 (~18m)',
      approximateArea: 'Sector 3 Residential',
      latitude: 37.7755,
      longitude: -122.4180,
      locationPrecision: 18,
      createdAt: nowStr,
      updatedAt: nowStr,
      contactsNotifiedCount: 2,
      events: [
        {
          id: 'evt_1',
          timestamp: nowStr,
          title: 'Check-in Window Expired',
          description: 'Welfare check-in grace period elapsed without response.',
          actor: 'System Watchdog',
          type: 'system'
        }
      ]
    };

    dbIncidents.unshift(inc);
    currentState.incident = inc;

    logActivity(`🟡 Scheduled check-in window elapsed without confirmation. SAFE → ATTENTION (15m grace period active).`, 'system');
    res.json({ success: true, message: 'Check-in missed simulation active', state: currentState, incident: inc });
  });

  app.post('/api/escalate', (req: Request, res: Response) => {
    currentState.safetyState = 'EMERGENCY';
    const nowStr = getNowFormatted();

    if (currentState.incident) {
      currentState.incident.state = 'EMERGENCY';
      currentState.incident.status = 'ESCALATED';
      currentState.incident.events.push({
        id: 'evt_' + Date.now(),
        timestamp: nowStr,
        title: 'Signal Escalated to EMERGENCY',
        description: 'Verification grace period elapsed or user indicated distress.',
        actor: 'Escalation Engine',
        type: 'escalation'
      });
    } else {
      const inc: Incident = {
        id: 'SG-' + Math.floor(1000 + Math.random() * 9000),
        userId: 'user_sarah',
        userName: 'Sarah Jenkins',
        userPhone: '+1 (555) 349-8812',
        type: 'WELFARE_CHECK',
        priority: 'HIGH',
        status: 'ESCALATED',
        state: 'EMERGENCY',
        locationName: 'Sector 4, West Corridor (~20m)',
        approximateArea: 'Sector 4',
        latitude: 37.7749,
        longitude: -122.4194,
        locationPrecision: 20,
        createdAt: nowStr,
        updatedAt: nowStr,
        contactsNotifiedCount: 3,
        events: []
      };
      dbIncidents.unshift(inc);
      currentState.incident = inc;
    }

    logActivity('🚨 Safety signal escalated to EMERGENCY. Community responder queue notified.', 'escalation');
    res.json({ success: true, message: 'Escalated to Emergency', state: currentState });
  });

  app.post('/api/journey/start', (req: Request, res: Response) => {
    const { destination, expectedArrival, origin, distanceKm } = req.body || {};
    const nowStr = getNowFormatted();

    currentState.journey = {
      active: true,
      status: 'ACTIVE',
      destination: destination || 'City Center',
      origin: origin || 'Current Location',
      expectedArrival: expectedArrival || '08:00 PM',
      startTime: nowStr,
      distanceKmRemaining: distanceKm || 3.5
    };

    logActivity(`🛣️ Safe journey started to "${currentState.journey.destination}". Expected arrival: ${currentState.journey.expectedArrival}.`, 'user');
    res.json({ success: true, message: 'Journey started', state: currentState });
  });

  app.post('/api/journey/arrived', (req: Request, res: Response) => {
    currentState.journey.active = false;
    currentState.journey.status = 'COMPLETED';

    if (currentState.safetyState === 'ATTENTION' && currentState.incident?.type === 'OVERDUE_JOURNEY') {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity(`🏁 Safe arrival confirmed at "${currentState.journey.destination}". Commute completed.`, 'user');
    res.json({ success: true, message: 'Journey completed safely', state: currentState });
  });

  app.post('/api/journey/missed', (req: Request, res: Response) => {
    currentState.journey.status = 'OVERDUE';
    currentState.safetyState = 'ATTENTION';

    const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = getNowFormatted();

    const inc: Incident = {
      id: incId,
      userId: 'user_sarah',
      userName: 'Sarah Jenkins',
      userPhone: '+1 (555) 349-8812',
      type: 'OVERDUE_JOURNEY',
      priority: 'MEDIUM',
      status: 'ATTENTION',
      state: 'ATTENTION',
      locationName: 'Sector 4 Transit Corridor (~24m)',
      approximateArea: 'Sector 4 Transit',
      latitude: 37.7760,
      longitude: -122.4200,
      locationPrecision: 24,
      createdAt: nowStr,
      updatedAt: nowStr,
      contactsNotifiedCount: 2,
      events: [
        {
          id: 'evt_1',
          timestamp: nowStr,
          title: 'Journey Overdue Flagged',
          description: 'Expected arrival exceeded by 10 minutes.',
          actor: 'Journey Monitor',
          type: 'system'
        }
      ]
    };

    dbIncidents.unshift(inc);
    currentState.incident = inc;

    logActivity(`🟡 Expected arrival time exceeded. Safe Journey flagged as ATTENTION with verification grace.`, 'system');
    res.json({ success: true, message: 'Journey overdue simulation active', state: currentState });
  });

  app.post('/api/journey/extend', (req: Request, res: Response) => {
    const { minutes } = req.body || {};
    const ext = minutes || 15;

    currentState.journey.status = 'ACTIVE';
    if (currentState.safetyState === 'ATTENTION' && currentState.incident?.type === 'OVERDUE_JOURNEY') {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity(`⏱️ Journey ETA extended by +${ext} mins due to transit delay. False alarm prevented.`, 'user');
    res.json({ success: true, message: `ETA extended by ${ext} mins`, state: currentState });
  });

  app.post('/api/responders/assign', (req: Request, res: Response) => {
    const primaryResp = dbResponders[0];
    if (currentState.incident) {
      currentState.incident.status = 'EN_ROUTE';
      currentState.incident.assignedResponderId = primaryResp.id;
      currentState.incident.assignedResponderName = primaryResp.name;
      currentState.incident.assignedResponderDistance = `${primaryResp.distanceKm} km (ETA ~3m)`;
      currentState.incident.events.push({
        id: 'evt_' + Date.now(),
        timestamp: getNowFormatted(),
        title: 'Responder Dispatched',
        description: `${primaryResp.name} accepted dispatch.`,
        actor: primaryResp.name,
        type: 'responder'
      });
    }

    logActivity(`🚑 Verified Responder ${primaryResp.name} (${primaryResp.distanceKm} km away) accepted dispatch and is en route.`, 'responder');
    res.json({ success: true, message: 'Responder assigned successfully', state: currentState });
  });

  app.post('/api/incident/resolve', (req: Request, res: Response) => {
    currentState.safetyState = 'SAFE';
    if (currentState.incident) {
      currentState.incident.status = 'RESOLVED';
      currentState.incident.state = 'SAFE';
    }

    logActivity('🟢 Incident marked as ASSISTED & RESOLVED. All signals normal.', 'responder');
    res.json({ success: true, message: 'Incident resolved', state: currentState });
  });

  app.post('/api/reset', (req: Request, res: Response) => {
    currentState = {
      safetyState: 'SAFE',
      checkIn: {
        scheduled: true,
        status: 'SCHEDULED',
        time: '09:00 AM'
      },
      journey: {
        active: false,
        status: 'NONE',
        destination: 'Central Transit Hub',
        origin: 'Campus North Gate',
        expectedArrival: '07:45 PM',
        distanceKmRemaining: 3.2
      },
      incident: null,
      activity: [
        { id: '1', time: getNowFormatted(), text: 'SafeGrid Welfare Core service reset to default SAFE state.', type: 'system' }
      ]
    };
    dbIncidents = [];
    dbResponders.forEach(r => { r.isAvailable = true; r.assignedIncidentId = null; });
    logActivity('🔄 SafeGrid demo state reset to default SAFE configuration.', 'system');
    res.json({ success: true, message: 'State reset to default', state: currentState });
  });

  app.post('/api/offline/sync', (req: Request, res: Response) => {
    const { events } = req.body || {};
    const count = Array.isArray(events) ? events.length : 0;
    const nowStr = getNowFormatted();

    if (count > 0) {
      logActivity(`📡 Reconnected: Synced ${count} offline event(s) with dual timestamps (created vs synced ${nowStr}).`, 'system');
    }

    res.json({ success: true, syncedCount: count, state: currentState });
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json({ success: true, auditLogs: dbAuditLogs });
  });

  app.get('/api/analytics', (req: Request, res: Response) => {
    const totalIncidents = dbIncidents.length;
    const activeIncidents = dbIncidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length;
    const resolvedIncidents = dbIncidents.filter(i => i.status === 'RESOLVED').length;
    const completedCheckIns = dbSchedules.filter(s => s.isCompletedToday).length;

    res.json({
      success: true,
      analytics: {
        totalIncidents,
        activeIncidents,
        resolvedIncidents,
        completedCheckIns,
        totalResponders: dbResponders.length,
        availableResponders: dbResponders.filter(r => r.isAvailable).length,
        averageSimulatedResponseMinutes: 4.2,
        falseAlarmsPreventedViaGrace: 14
      }
    });
  });

  // ----------------------------------------------------
  // VITE STATIC ASSET & SPA SERVING
  // ----------------------------------------------------
  app.use(express.static(path.join(process.cwd(), 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAFEGRID Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
