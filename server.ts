import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Incident {
  id: string;
  state: 'ATTENTION' | 'EMERGENCY' | 'RESPONDER ASSIGNED' | 'RESOLVED';
  type: string;
  location: string;
  approximateArea?: string;
  createdAt: string;
  responder?: {
    name: string;
    distance: string;
    phone?: string;
    badgeId?: string;
  } | null;
}

interface ActivityItem {
  id: string;
  time: string;
  text: string;
  type?: 'system' | 'user' | 'responder' | 'escalation';
}

interface ServerState {
  safetyState: 'SAFE' | 'ATTENTION' | 'EMERGENCY';
  checkIn: {
    scheduled: boolean;
    status: string; // 'NONE' | 'SCHEDULED' | 'COMPLETED' | 'MISSED'
    time: string;
  };
  journey: {
    active: boolean;
    status: string; // 'NONE' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'
    destination: string;
    origin?: string;
    expectedArrival: string;
    startTime?: string;
  };
  incident: Incident | null;
  activity: ActivityItem[];
}

function getInitialState(): ServerState {
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
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
      expectedArrival: '07:45 PM'
    },
    incident: null,
    activity: [
      { id: '1', time: nowStr, text: 'SafeGrid Welfare Core service initialized.', type: 'system' },
      { id: '2', time: nowStr, text: 'Safety state: SAFE. All background signals normal.', type: 'system' }
    ]
  };
}

let currentState: ServerState = getInitialState();

function logActivity(text: string, type: 'system' | 'user' | 'responder' | 'escalation' = 'system') {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  currentState.activity.unshift({
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    time,
    text,
    type
  });
  if (currentState.activity.length > 25) {
    currentState.activity = currentState.activity.slice(0, 25);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS for local development / testing flexibility
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Healthcheck endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. GET /api/state: Authoritative current state
  app.get('/api/state', (req: Request, res: Response) => {
    res.json(currentState);
  });

  // 2. POST /api/sos: Trigger emergency SOS
  app.post('/api/sos', (req: Request, res: Response) => {
    currentState.safetyState = 'EMERGENCY';
    const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentState.incident = {
      id: incId,
      state: 'EMERGENCY',
      type: 'MANUAL SOS',
      location: 'Sector 4, West Corridor (~15m)',
      approximateArea: 'Sector 4, West Hub',
      createdAt: nowStr,
      responder: null
    };

    logActivity(`🔴 Manual SOS triggered! Emergency responders & safety circle alerted. Incident #${incId}`, 'escalation');
    res.json({ success: true, message: 'Emergency SOS triggered', state: currentState });
  });

  // 3. POST /api/checkin: Schedule welfare check-in
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

  // 4. POST /api/checkin/complete: Confirm check-in ("I'M OK")
  app.post('/api/checkin/complete', (req: Request, res: Response) => {
    const prevStatus = currentState.checkIn.status;
    currentState.checkIn.status = 'COMPLETED';
    currentState.checkIn.scheduled = false;

    if (currentState.safetyState === 'ATTENTION' && currentState.incident?.type === 'MISSED CHECK-IN') {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity('✅ User confirmed welfare check-in ("I\'M OK"). Verification confirmed.', 'user');
    res.json({ success: true, message: 'Check-in completed', state: currentState });
  });

  // 5. POST /api/checkin/missed: Simulate missed check-in -> ATTENTION
  app.post('/api/checkin/missed', (req: Request, res: Response) => {
    currentState.checkIn.status = 'MISSED';
    currentState.safetyState = 'ATTENTION';

    const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentState.incident = {
      id: incId,
      state: 'ATTENTION',
      type: 'MISSED CHECK-IN',
      location: 'Residence Sector 3 (~18m)',
      approximateArea: 'Sector 3 Residential',
      createdAt: nowStr,
      responder: null
    };

    logActivity(`🟡 Scheduled check-in window elapsed without confirmation. SAFE → ATTENTION (15m grace period active).`, 'system');
    res.json({ success: true, message: 'Check-in missed simulation active', state: currentState });
  });

  // 6. POST /api/escalate: Escalate ATTENTION to EMERGENCY
  app.post('/api/escalate', (req: Request, res: Response) => {
    currentState.safetyState = 'EMERGENCY';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (currentState.incident) {
      currentState.incident.state = 'EMERGENCY';
    } else {
      currentState.incident = {
        id: 'SG-' + Math.floor(1000 + Math.random() * 9000),
        state: 'EMERGENCY',
        type: 'WELFARE ESCALATION',
        location: 'Sector 4, West Corridor (~20m)',
        approximateArea: 'Sector 4',
        createdAt: nowStr,
        responder: null
      };
    }

    logActivity('🚨 Safety signal escalated to EMERGENCY. Community responder queue notified.', 'escalation');
    res.json({ success: true, message: 'Escalated to Emergency', state: currentState });
  });

  // 7. POST /api/journey/start: Start safe commute
  app.post('/api/journey/start', (req: Request, res: Response) => {
    const { destination, expectedArrival, origin } = req.body || {};
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentState.journey = {
      active: true,
      status: 'ACTIVE',
      destination: destination || 'City Center',
      origin: origin || 'Current Location',
      expectedArrival: expectedArrival || '08:00 PM',
      startTime: nowStr
    };

    logActivity(`🛣️ Safe journey started to "${currentState.journey.destination}". Expected arrival: ${currentState.journey.expectedArrival}.`, 'user');
    res.json({ success: true, message: 'Journey started', state: currentState });
  });

  // 8. POST /api/journey/arrived: User arrived safely
  app.post('/api/journey/arrived', (req: Request, res: Response) => {
    currentState.journey.active = false;
    currentState.journey.status = 'COMPLETED';

    if (currentState.safetyState === 'ATTENTION' && currentState.incident?.type === 'OVERDUE JOURNEY') {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity(`🏁 Safe arrival confirmed at "${currentState.journey.destination}". Commute completed.`, 'user');
    res.json({ success: true, message: 'Journey completed safely', state: currentState });
  });

  // 9. POST /api/journey/missed: Simulate overdue journey -> ATTENTION
  app.post('/api/journey/missed', (req: Request, res: Response) => {
    currentState.journey.status = 'OVERDUE';
    currentState.safetyState = 'ATTENTION';

    const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentState.incident = {
      id: incId,
      state: 'ATTENTION',
      type: 'OVERDUE JOURNEY',
      location: 'Sector 4 Transit Corridor (~24m)',
      approximateArea: 'Sector 4 Transit',
      createdAt: nowStr,
      responder: null
    };

    logActivity(`🟡 Expected arrival time exceeded. Safe Journey flagged as ATTENTION with verification grace.`, 'system');
    res.json({ success: true, message: 'Journey overdue simulation active', state: currentState });
  });

  // 10. POST /api/journey/extend: Extend ETA (+15m) preventing false alarm
  app.post('/api/journey/extend', (req: Request, res: Response) => {
    const { minutes } = req.body || {};
    const ext = minutes || 15;

    currentState.journey.status = 'ACTIVE';
    if (currentState.safetyState === 'ATTENTION' && currentState.incident?.type === 'OVERDUE JOURNEY') {
      currentState.safetyState = 'SAFE';
      currentState.incident = null;
    }

    logActivity(`⏱️ Journey ETA extended by +${ext} mins due to transit delay. False alarm prevented.`, 'user');
    res.json({ success: true, message: `ETA extended by ${ext} mins`, state: currentState });
  });

  // 11. POST /api/responders/assign: Assign verified responder
  app.post('/api/responders/assign', (req: Request, res: Response) => {
    if (!currentState.incident) {
      // Auto-create an emergency incident if assigning directly
      const incId = 'SG-' + Math.floor(1000 + Math.random() * 9000);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentState.incident = {
        id: incId,
        state: 'RESPONDER ASSIGNED',
        type: 'MANUAL SOS',
        location: 'Sector 4, West Corridor (~15m)',
        approximateArea: 'Sector 4, West Hub',
        createdAt: nowStr,
        responder: {
          name: 'Dr. Anita Roy',
          distance: '0.8 km (ETA ~3m)',
          phone: '+1 (555) 902-1133',
          badgeId: 'MED-9042'
        }
      };
      currentState.safetyState = 'EMERGENCY';
    } else {
      currentState.incident.state = 'RESPONDER ASSIGNED';
      currentState.incident.responder = {
        name: 'Dr. Anita Roy',
        distance: '0.8 km (ETA ~3m)',
        phone: '+1 (555) 902-1133',
        badgeId: 'MED-9042'
      };
    }

    logActivity('🚑 Verified Responder Dr. Anita Roy (0.8 km away) accepted dispatch and is en route.', 'responder');
    res.json({ success: true, message: 'Responder assigned successfully', state: currentState });
  });

  // 12. POST /api/incident/resolve: Mark incident as resolved
  app.post('/api/incident/resolve', (req: Request, res: Response) => {
    currentState.safetyState = 'SAFE';
    if (currentState.incident) {
      currentState.incident.state = 'RESOLVED';
    }

    logActivity('🟢 Incident marked as ASSISTED & RESOLVED. All signals normal.', 'responder');
    res.json({ success: true, message: 'Incident resolved', state: currentState });
  });

  // 13. POST /api/reset: Reset to initial state
  app.post('/api/reset', (req: Request, res: Response) => {
    currentState = getInitialState();
    logActivity('🔄 SafeGrid demo state reset to default SAFE configuration.', 'system');
    res.json({ success: true, message: 'State reset to default', state: currentState });
  });

  // 14. POST /api/offline/sync: Process offline queued events
  app.post('/api/offline/sync', (req: Request, res: Response) => {
    const { events } = req.body || {};
    const count = Array.isArray(events) ? events.length : 0;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (count > 0) {
      logActivity(`📡 Reconnected: Synced ${count} offline event(s) with dual timestamps (created vs synced ${nowStr}).`, 'system');
    }

    res.json({ success: true, syncedCount: count, state: currentState });
  });

  // Serve static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware setup
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
