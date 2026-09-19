# SAFEGRID — Smart Community Safety Platform

<div align="center">

![SAFEGRID Banner](public/pwa-512x512.png)

**Don't just wait for an SOS. Recognize when safety changes.**

[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119efe)](https://capacitorjs.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)](https://web.dev/progressive-web-apps/)

</div>

---

## Overview

SAFEGRID is a **multi-layer community safety and emergency response platform** that monitors welfare across four independent safety layers:

1. **Manual SOS** — a 10-second countdown panic button with responder dispatch
2. **Safe Journey** — GPS-tracked commutes with deviation detection and ETA monitoring
3. **Scheduled Check-ins** — automated welfare signals with missed-check-in escalation
4. **Safety Circle** — trusted contact vicinity monitoring and proximity-based dispatch

When a safety signal is overdue or an emergency occurs, SAFEGRID progressively escalates from **SAFE → ATTENTION → EMERGENCY** and dispatches the nearest verified responder while alerting the Safety Circle.

---

## The Problem

Every 4 minutes, someone in India experiences a street safety incident. Existing safety apps provide reactive tools (panic buttons) but miss the gradual deterioration of safety that precedes most emergencies — overdue commutes, missed welfare checks, route deviations, and prolonged silence.

---

## The Solution

SAFEGRID detects **changes in safety state** before they become crises:

```
USER
 ↓
SAFETY SIGNAL (SOS / Check-in / Journey / Session)
 ↓
VERIFICATION (10s countdown / Attention dialog / Grace period)
 ↓
SAFETY STATE (SAFE → ATTENTION → EMERGENCY)
 ↓
RISK ASSESSMENT (Vicinity check: who is closest?)
 ↓
ESCALATION (Safety Circle alert → Emergency Services → Responder)
 ↓
RESPONDER ASSIGNED (Matched by proximity + specialization)
 ↓
MONITORING (Live location + incident timeline)
 ↓
RESOLUTION (Confirmed safe / Responder on scene)
```

---

## Features

### 👤 Personalized Safety Onboarding
Five safety profiles automatically configure the app:
- **Solo Woman / Commuter** → Women Helpline 1091 priority, transit harassment protection
- **Senior Citizen** → Ambulance 108, medication reminders, fall detection check-ins
- **Guardian (Parent)** → Childline 1098, school bus tracking, curfew monitoring
- **Student** → Police 112, campus patrol, buddy tracking
- **Verified Responder** → Receive dispatches, accept/reject incidents, update status

### 🆘 Emergency SOS
- 10-second cancellation countdown (prevents false alarms)
- Real incident created with event timeline
- Vicinity check: if no Safety Circle contact is within radius → auto-escalate to emergency services
- Nearest verified responder auto-assigned
- Full incident lifecycle: CREATED → ASSIGNED → EN_ROUTE → ARRIVED → RESOLVED

### 🗺️ Safe Journey Tracker
- Start journeys with origin, destination, transport mode
- Custom ETA or auto-calculated from distance
- Safety-scored route presets with CCTV coverage info
- ETA extension buttons to prevent false alarms during delays
- Route deviation detection (>300m off corridor → ATTENTION state)
- Live GPS progress tracking with SVG map visualization
- Share with Safety Circle (live journey updates)

### ✅ Scheduled Check-ins
- Configurable daily welfare signals (Morning, Afternoon, Evening)
- Per-type categories: WELFARE, MEDICATION, CURFEW, TRANSIT
- Missed check-in → ATTENTION state → escalation to Emergency if no response
- Senior mode: large, accessible "I'M OK" button

### 👥 Safety Circle
- Add up to 10+ trusted contacts (family, friends, neighbors, doctors)
- Per-contact permission flags: canVerifyWelfare, canReceiveSOS, canTrackLiveJourney
- Configurable vicinity radius (1km – 10km)
- Distance-based escalation: if no circle contact is within radius → auto-dispatch emergency services
- Import contacts from device / manually add

### 📡 Guardian / Friend's Phone View
- Separate companion screen for friends/family monitoring the user
- Real-time state sync via `/api/state` polling (3s intervals)
- Shows live location, safety state, active incident
- Friend can trigger "I'm responding" status

### 🖥️ Web Portals
- **Citizen Web Dashboard**: Safety status, journey monitor, check-in manager, Safety Circle
- **Verified Responder Console**: Active incident list, accept dispatch, update status (EN_ROUTE, ARRIVED, RESOLVED)
- **City Operations Command Center**: All incidents, system stats, responder fleet status, audit trail export

### 🔧 REST API Console
- Interactive test console with all 20+ API endpoints
- Live request/response inspector
- Pre-built test scenarios

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.0 | UI framework |
| TypeScript | 7.0 | Type safety |
| Vite | 8.3 | Build tool + dev server |
| Tailwind CSS | v4 | Utility-first styling |
| Lucide React | 0.546 | Icon system |
| Motion | 12.x | Animations |
| vite-plugin-pwa | 1.3 | PWA + service worker |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 4.21 | REST API server |
| Node.js / tsx | 4.21 | TypeScript execution |
| esbuild | 0.25 | Server bundle |

### Mobile / Android
| Technology | Version | Purpose |
|---|---|---|
| Capacitor | 8.5 | Web-to-native bridge |
| @capacitor/android | 8.5 | Android WebView wrapper |
| @capacitor/geolocation | 8.2 | Native GPS access |
| @capacitor/status-bar | 8.0 | Android status bar theming |
| @capacitor/splash-screen | 8.0 | App launch splash |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SAFEGRID CLIENT                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Mobile View │  │   Web View   │  │  Guardian View   │  │
│  │ (Phone Frame)│  │ (Dashboard)  │  │ (Friend Monitor) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬──────────┘  │
│         │                 │                    │             │
│  ┌──────▼─────────────────▼────────────────────▼──────────┐ │
│  │            SafeGridContext (React Context API)          │ │
│  │  - Safety State Machine (SAFE/ATTENTION/EMERGENCY)     │ │
│  │  - Journey Management    - Check-in Scheduling         │ │
│  │  - SOS Countdown         - Responder Dispatch          │ │
│  │  - Safety Circle         - Notification Queue          │ │
│  │  - Offline Queue         - GPS Location                │ │
│  └─────────────────────────┬──────────────────────────────┘ │
│                             │ fetch()                        │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    EXPRESS BACKEND (server.ts)               │
│                                                              │
│  POST /api/sos              GET/POST /api/contacts          │
│  POST /api/journey/start    GET/POST /api/schedules         │
│  POST /api/journey/arrived  GET/POST /api/incidents         │
│  POST /api/checkin/complete PUT  /api/incidents/:id         │
│  POST /api/escalate         GET  /api/state                 │
│  GET  /api/audit-logs       POST /api/reset                 │
│                                                              │
│              In-memory store (prototype)                     │
│    (swap for PostgreSQL/Firebase/MongoDB in production)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Structure

The backend uses **in-memory data stores** (suitable for hackathon demo). For production, each store maps to a database collection:

| Store | Fields | Notes |
|---|---|---|
| `contacts[]` | id, name, relationship, phone, permissions, distanceKm | Safety Circle contacts |
| `schedules[]` | id, label, scheduledTime, gracePeriod, category | Check-in schedules |
| `incidents[]` | id, type, state, status, location, events[], responder | Emergency events |
| `responders[]` | id, name, badgeId, distanceKm, isAvailable | Verified responders |
| `safetyState` | 'SAFE' \| 'ATTENTION' \| 'EMERGENCY' | Global safety state |
| `location` | lat, lng, locationName, accuracy | Last known GPS |
| `journey` | id, origin, destination, ETA, status, coords | Active journey |

---

## Safety States

```
SAFE ─────────────────────────────────────────────────────┐
 │                                                          │
 │ [Missed check-in]                                        │
 │ [Journey overdue]       ┌── [User verifies safe] ────────┤
 │ [Route deviation]       │                                │
 ▼                         │                                │
ATTENTION ─────────────────┘                               │
 │                                                          │
 │ [SOS pressed]                                            │
 │ [No response to attention]   ┌── [Responder resolves] ──┤
 │ [Escalation timeout]         │                           │
 ▼                              │                           │
EMERGENCY ─────────────────────┘                           │
 │                                                          │
 │ [Responder resolved]                                     │
 └──────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites
- Node.js ≥ 18
- npm ≥ 10

### Development Server

```bash
git clone <repo-url>
cd SAFEGRID-l

# Install dependencies (--legacy-peer-deps is required due to esbuild version conflict)
npm install

# Start development server (serves both frontend and Express API)
npm run dev

# Open http://localhost:5173
```

> **Note:** The `.npmrc` file in this repo already sets `legacy-peer-deps=true` so `npm install` should work without the flag.

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | — | For AI-powered features |
| `APP_URL` | Optional | `http://localhost:5173` | Public app URL |
| `PORT` | Optional | `5173` | Express server port |

### Production Build

```bash
npm run build
# Outputs to: dist/

# Start production server
npm run start
```

---

## Web Application

### Running Locally
```bash
npm run dev
# Opens at http://localhost:5173
```

### View Modes (accessible via top navigation)
| Mode | Description |
|---|---|
| **Mobile App** | Authentic iPhone-frame view of the mobile experience |
| **Web App** | Full desktop/tablet web portal |
| **REST APIs** | Interactive API console with all endpoints |
| **Friend's Phone** | Guardian companion monitoring screen |

### PWA Installation
The app is PWA-ready and installable:
1. Open in Chrome
2. Click the install prompt in the address bar (or the install button in the app)
3. SAFEGRID installs as a standalone app

---

## Android APK

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed
- Android SDK (API level 22+)
- JDK 17+

### Build Steps

```bash
# Step 1: Build the web app
npm run build:web

# Step 2: Sync to Android project
npx cap sync android

# Step 3: Open in Android Studio
npx cap open android

# In Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### APK Location
After a successful Gradle build:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Command Line APK Build (without Android Studio)
```bash
cd android
.\gradlew.bat assembleDebug  # Windows
./gradlew assembleDebug      # Mac/Linux
```

### Installing on Android Phone
```bash
# Enable "Developer Options" and "USB Debugging" on your Android phone
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or simply copy the APK file to your phone and install it.

### App Configuration
| Setting | Value |
|---|---|
| App Name | SAFEGRID |
| Package ID | com.safegrid.app |
| Min SDK | Android 5.1 (API 22) |
| Target SDK | Android 14 (API 34) |
| Web Engine | Capacitor (Chrome WebView) |

---

## Hackathon Demo Flow

Follow this sequence for a complete demonstration:

```
1. OPEN APP → Onboarding modal → Select "Solo Woman / Commuter"
2. HOME → Note safety status SAFE, Safety Circle (3 contacts), SOS button
3. JOURNEY TAB → Start journey with "Main Avenue Safe Corridor" preset
4. JOURNEY → Tap "Simulate Route Deviation" → ATTENTION state activates
5. Resolve deviation → Journey returns to SAFE
6. CHECK-IN TAB → Tap "I'm OK" → confirmed
7. Tap "Simulate Missed Check-in" → ATTENTION state with incident
8. Attention modal → Escalate → EMERGENCY state
9. EMERGENCY VIEW → See incident timeline, responder assigned, ETA 3 mins
10. Tap "SAFE ARRIVAL" / "Resolve" → incident resolved, SAFE state restored
11. Switch to Web App → Responder Console → Citizen Portal
12. Switch to Friend's Phone view → Real-time monitoring
13. Switch to City Ops → See all incidents, responder fleet, export audit trail
```

### Persona Switch (Header → Avatar Dropdown)
| Persona | Demonstrates |
|---|---|
| Sarah Jenkins | Solo commuter / SOLO_WOMAN |
| David Vance | Senior check-ins / medication |
| Maya & Aarav | Guardian / child safety |
| Dr. Anita Roy | Verified Responder portal |
| SafeGrid Control | Admin Command Center |

---

## API Reference

### Safety Events
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sos` | Trigger emergency SOS |
| POST | `/api/escalate` | Escalate from ATTENTION |
| GET | `/api/state` | Current safety state |
| POST | `/api/reset` | Reset all state |

### Journeys
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/journey/start` | Start safe journey |
| POST | `/api/journey/arrived` | Confirm safe arrival |
| POST | `/api/journey/extend` | Extend ETA |
| POST | `/api/journey/missed` | Mark journey overdue |

### Contacts & Check-ins
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/contacts` | Safety Circle contacts |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Remove contact |
| GET/POST | `/api/schedules` | Check-in schedules |
| POST | `/api/checkin/complete` | Mark check-in done |
| POST | `/api/checkin/missed` | Simulate missed |

### Incidents & Responders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/incidents` | All incidents |
| PUT | `/api/incidents/:id/status` | Update status |
| POST | `/api/incidents/:id/resolve` | Resolve incident |
| GET | `/api/responders` | All responders |
| POST | `/api/responders/:id/accept` | Accept dispatch |
| GET | `/api/audit-logs` | Export audit trail |

---

## Offline & Low Connectivity

SAFEGRID handles poor connectivity gracefully:
- Network status indicator in header (toggle simulation available)
- Offline queue: safety actions recorded locally when offline
- On reconnect: queued events automatically synced to backend
- Last-known location preserved
- Clear "Offline Mode" banner in mobile view

> **Note:** True offline-first requires IndexedDB + service worker background sync (marked as future scope).

---

## Security Notes

- No Firebase credentials or external API keys are required to run the prototype
- The Gemini API key is only used for optional AI features and is never exposed to the frontend
- All environment variables are loaded via `dotenv` on the server side
- Frontend never receives or stores secrets
- `.gitignore` excludes all `.env*` files (except `.env.example`)

---

## Future Production Scope

| Feature | Status |
|---|---|
| Real SMS/push notifications | 🔮 Future |
| Firebase Authentication | 🔮 Future |
| Firestore real-time database | 🔮 Future |
| Google Maps tile integration | 🔮 Future |
| Real police/emergency API integration | 🔮 Future |
| ML-based route safety scoring | 🔮 Future |
| True offline IndexedDB sync | 🔮 Future |
| Multi-tenancy / organization accounts | 🔮 Future |
| Wearable integration (smartwatch SOS) | 🔮 Future |

---

## Team

Built for the **SAFEGRID Hackathon** prototype demonstration.

---

## Screenshots

> Use the **Mobile App** view mode and **Web App** view mode to see the full UI.
> Key screens: SOS countdown, Emergency incident view, Safe Journey map, Guardian monitoring.

---

## License

Apache-2.0 — see individual file headers for copyright notices.
