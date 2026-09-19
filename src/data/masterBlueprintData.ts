export interface PPTSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  quote?: string;
  bulletPoints: string[];
  diagram?: string;
  footerNote?: string;
  tag: string;
}

export interface JuryQA {
  id: string;
  question: string;
  answer: string;
  category: 'core' | 'technical' | 'privacy' | 'failure';
}

export interface WhatIfScenario {
  id: string;
  scenario: string;
  systemResponse: string;
  stateTransition: string;
  limitationHonesty: string;
}

export const MASTER_PITCH_30S = 
  "Most emergency systems assume that a person in danger can actively ask for help. But what happens when they cannot? SAFEGRID is a software-only community emergency-response and welfare platform that combines manual SOS with scheduled check-ins, safe-arrival journeys, and safety-session monitoring. Instead of treating every missed signal as an emergency, SAFEGRID progressively verifies the situation through trusted contacts and verified community responders. Our three-state model—SAFE, ATTENTION, and EMERGENCY—helps reduce false alarms while ensuring unresolved welfare concerns can be escalated. The result is not just an SOS application, but a complete safety-state and community-response workflow.";

export const JURY_ONE_LINER = 
  "SAFEGRID doesn't try to predict every emergency; it makes the gap between expected safety and confirmed safety visible, verifiable, and actionable.";

export const TECHNICAL_ONE_LINER = 
  "Our MVP is built around an event-driven safety-state workflow using authenticated users, incident state management, scheduled safety signals, progressive escalation, responder matching, and privacy-aware access control.";

export const THE_FINAL_MESSAGE = 
  "SAFETY SIGNAL → VERIFICATION → SAFETY STATE → ESCALATION → RESPONDER → RESOLUTION";

export const PRODUCT_PRINCIPLES = [
  { id: 1, title: "Do not assume danger", desc: "A missing signal is a reason to verify, not a trigger to panic." },
  { id: 2, title: "Do not assume safety", desc: "A check-in is a user-provided safety signal, not absolute medical proof." },
  { id: 3, title: "Escalate progressively", desc: "Avoid unnecessary emergency escalation through reminders and grace periods." },
  { id: 4, title: "Protect privacy", desc: "Share only what is required: approximate quadrants for public, precision only upon accepted dispatch." },
  { id: 5, title: "Never promise unavailable services", desc: "Do not claim police or ambulance integration unless authorized and officially integrated." },
  { id: 6, title: "Keep the user informed", desc: "Every important safety state change must have an explainable cause." },
  { id: 7, title: "Design for failure", desc: "Assume network, GPS, device, server, and notification failures will occur." },
  { id: 8, title: "Keep humans in the loop", desc: "High-impact safety interventions must never depend blindly on black-box algorithms." }
];

export const PPT_SLIDES: PPTSlide[] = [
  {
    slideNumber: 1,
    title: "SAFEGRID",
    subtitle: "Community Emergency-Response & Welfare Platform",
    quote: "“Don't just wait for an SOS. Recognize when safety changes.”",
    bulletPoints: [
      "Software-only proactive community safety platform",
      "Multi-signal welfare monitoring (SOS, Check-ins, Journeys, Sessions)",
      "Progressive verification protecting against false alarms",
      "Verified community responder coordination network"
    ],
    tag: "Vision"
  },
  {
    slideNumber: 2,
    title: "The Problem",
    subtitle: "Traditional Emergency Systems Assume You Can Press SOS",
    bulletPoints: [
      "Seniors living alone who fall or suffer medical crisis cannot reach their phone",
      "Children commuting from school cannot operate complex dispatch apps",
      "Commuters failing to reach home have no automated check",
      "Victims under duress or with smashed/offline devices cannot send distress calls",
      "Core question: How can a system recognize when an expected safety signal has disappeared?"
    ],
    tag: "Problem"
  },
  {
    slideNumber: 3,
    title: "The Solution",
    subtitle: "Multi-Layer Safety Signal Architecture",
    bulletPoints: [
      "Continuous observation of authorized safety signals",
      "Scheduled check-ins with single-tap 'I'M OK' welfare pings",
      "Safe-arrival journeys with proactive overdue detection",
      "Active safety sessions with heartbeat monitoring",
      "10-second false-alarm countdown on manual SOS"
    ],
    tag: "Solution"
  },
  {
    slideNumber: 4,
    title: "The Innovation",
    subtitle: "Safety Signal → State Machine Pipeline",
    diagram: "SAFETY SIGNAL → VERIFICATION → SAFETY STATE → ESCALATION → RESPONDER → RESOLUTION",
    bulletPoints: [
      "Moves beyond binary 'Panic / No Panic' thinking",
      "Deterministic state engine with explainable transitions",
      "Structured grace periods and gentle reminders",
      "Dual-timestamp local queues for offline resilience"
    ],
    tag: "Core Flow"
  },
  {
    slideNumber: 5,
    title: "The 3-State Model",
    subtitle: "Explaining SAFE, ATTENTION, and EMERGENCY",
    bulletPoints: [
      "🟢 SAFE: Expected safety signal received ('I'M OK' pressed, arrived safely)",
      "🟡 ATTENTION: Signal overdue or unexpected interruption; prompts verification (NOT danger!)",
      "🔴 EMERGENCY: Confirmed manual SOS or unresolved high-risk concern past escalation threshold"
    ],
    tag: "State Engine"
  },
  {
    slideNumber: 6,
    title: "Target User Personas",
    subtitle: "Empowering 4 Distinct Community Segments",
    bulletPoints: [
      "Women: Safe journey monitoring, ETA extensions (+10m/+20m/+30m), emergency SOS",
      "Children: Guardian-managed Safety Circles, school-to-home journey alerts",
      "Senior Citizens: High-contrast large 'I'M OK' button, scheduled wellness pings",
      "Verified Responders: Proximity matching, medical training flags, transparent assignment"
    ],
    tag: "Personas"
  },
  {
    slideNumber: 7,
    title: "System Architecture",
    subtitle: "Full-Stack Software-Only Implementation",
    diagram: "Mobile / Web Client ↔ REST API Gateway ↔ Safety State Engine ↔ Responder Matcher ↔ Database",
    bulletPoints: [
      "Frontend: Responsive PWA / Android WebAPK with offline support",
      "Backend: Node.js + Express REST API with state-machine controllers",
      "Persistence: Structured data models for Users, Check-ins, Journeys, and Incidents",
      "Authority: Server-authoritative state transitions preventing client-side spoofing"
    ],
    tag: "Architecture"
  },
  {
    slideNumber: 8,
    title: "Responder Matching Engine",
    subtitle: "Rule-Based Suitability Scoring (No Black-Box Hallucinations)",
    bulletPoints: [
      "Filter 1: Verified Identity = TRUE & Available = TRUE",
      "Filter 2: Incident Type match (e.g. medical training prioritized for senior pings)",
      "Filter 3: Proximity calculation with quadrant boundaries",
      "Lifecycle: ASSIGNED → ACCEPTED → EN_ROUTE → ARRIVED → RESOLVED",
      "Timeout handling: Automatic reassignment if responder does not acknowledge"
    ],
    tag: "Matching"
  },
  {
    slideNumber: 9,
    title: "Community Dashboards",
    subtitle: "Real-Time Visibility Without Privacy Violation",
    bulletPoints: [
      "Citizen App: Personal Safety Circle, active journey, pending check-ins",
      "Responder Console: Incident queue, approximate distance, accept/decline controls",
      "City Operations Center: Active incidents, attention cases, responders online, timeline",
      "Incident correlation: Clusters multiple reports to flag duplicate incidents"
    ],
    tag: "Dashboards"
  },
  {
    slideNumber: 10,
    title: "Technology Stack",
    subtitle: "Robust, Modern & Lightweight",
    bulletPoints: [
      "Mobile / Web: React 18, TypeScript, Tailwind CSS, Lucide Icons",
      "PWA Core: Service Worker, WebAPK manifest, standalone display",
      "Backend: Express.js REST API with deterministic state logic",
      "Simulators: Network offline queue, low battery warning, GPS precision degradation"
    ],
    tag: "Tech Stack"
  },
  {
    slideNumber: 11,
    title: "Location Privacy & Ethics",
    subtitle: "Consent-First Data Minimization",
    bulletPoints: [
      "No public broadcasting of exact coordinates",
      "Community maps show aggregated zone density only",
      "Safety Circle access is opt-in per active journey",
      "GPS inaccuracy transparency: displays ~Xm precision indicator",
      "Full functionality for SOS & check-ins even if location permission is denied"
    ],
    tag: "Privacy"
  },
  {
    slideNumber: 12,
    title: "Edge-Case Resilience",
    subtitle: "Failure-First Engineering",
    bulletPoints: [
      "No Internet: Local event queue with dual timestamps (eventCreatedAt vs eventReceivedAt)",
      "Phone Smashed: Server acts on last verified signal and expired journey deadline",
      "False Alarms: 10s SOS cancellation countdown & one-tap journey ETA extensions",
      "No Responders: Stays UNASSIGNED and escalates through Safety Circle"
    ],
    tag: "Edge Cases"
  },
  {
    slideNumber: 13,
    title: "Economic & Community Impact",
    subtitle: "Responsible Resource Utilization",
    bulletPoints: [
      "Reduces costly municipal false dispatches through multi-step verification",
      "Empowers neighborhood volunteer first-aiders for rapid local care",
      "Decreases emergency response lag for vulnerable seniors living alone",
      "Establishes a transparent audit log for every incident lifecycle event"
    ],
    tag: "Impact"
  },
  {
    slideNumber: 14,
    title: "Future Scope & Partnerships",
    subtitle: "Extending Beyond the Prototype",
    bulletPoints: [
      "Authorized municipal emergency service (police/ambulance) APIs",
      "Multilingual UI (Telugu, Hindi, regional Indian languages)",
      "Wearable IoT device integrations (smartwatch heartbeat & fall sensors)",
      "Local pharmacy and transport partner network integration"
    ],
    tag: "Future"
  },
  {
    slideNumber: 15,
    title: "Closing & Defense Summary",
    subtitle: "The Master Philosophy of SAFEGRID",
    quote: "“Most safety systems wait for an SOS. SAFEGRID asks a different question: What happens when the expected safety signal disappears?”",
    bulletPoints: [
      "SAFEGRID is not just an SOS button—it is an ecosystem",
      "Progressive escalation prevents alarm fatigue",
      "Built with honesty: software cannot fix a destroyed phone, but it can recognize missing signals",
      "Ready to deploy as an Android WebAPK or standalone web app"
    ],
    tag: "Conclusion"
  }
];

export const JURY_QA_MASTER: JuryQA[] = [
  {
    id: "q1",
    category: "core",
    question: "What happens if the person cannot press SOS?",
    answer: "SAFEGRID doesn't depend entirely on manual SOS. Scheduled check-ins, expected-arrival journeys, and active safety sessions provide proactive signals. If an expected signal is missed, the system starts a progressive verification and welfare-escalation workflow."
  },
  {
    id: "q2",
    category: "failure",
    question: "What if the phone is destroyed or smashed?",
    answer: "A completely destroyed or permanently disconnected device cannot transmit new information. We don't claim otherwise. Our system can only act on the last available safety signal, heartbeat, and active workflow deadline received on the server before the interruption occurred."
  },
  {
    id: "q3",
    category: "technical",
    question: "What if there is no internet?",
    answer: "Temporary connectivity loss is handled using local event queuing and retry synchronization. User actions like 'I'M OK' are stored locally with client timestamps and synced when connectivity returns. If the device remains permanently disconnected, server-side workflow processes overdue deadlines independently."
  },
  {
    id: "q4",
    category: "core",
    question: "Does offline mean kidnapping or emergency?",
    answer: "No. Offline status is only a signal that requires verification. It could be caused by dead battery, poor network, subway commute, airplane mode, or intentional disconnection. That is why it transitions to ATTENTION rather than triggering an emergency dispatch."
  },
  {
    id: "q5",
    category: "core",
    question: "How do you avoid false alarms?",
    answer: "We use progressive verification: a 10-second countdown with cancellation for manual SOS, 15-minute grace periods with gentle reminders for missed check-ins, and one-tap +10/+20/+30 min ETA extensions for transit delays."
  },
  {
    id: "q6",
    category: "technical",
    question: "Does it actually contact the police or 911/112?",
    answer: "Not in our current prototype. We deliberately separated the software workflow from emergency-service integration because real emergency-service access requires municipal authorization and compliance. We demonstrate the verified community responder and private Safety Circle tier."
  },
  {
    id: "q7",
    category: "core",
    question: "Why not just use an existing SOS app?",
    answer: "An SOS application primarily depends on the person actively initiating an emergency while in danger. SAFEGRID focuses on the period before or instead of an SOS—proactive scheduled signals, arrival monitoring, welfare verification, and progressive escalation."
  },
  {
    id: "q8",
    category: "technical",
    question: "Is AI or machine learning used?",
    answer: "The core prototype uses a deterministic, rule-based safety-state engine because it is explainable, auditable, and reliable for life-critical welfare checks. AI can be introduced as future scope for anomaly scoring once sufficient historical telemetry exists."
  },
  {
    id: "q9",
    category: "failure",
    question: "What if nobody responds?",
    answer: "The incident remains visible as UNASSIGNED and continues through the configured escalation workflow to backup contacts. The system never falsely pretends that a responder is on the way."
  },
  {
    id: "q10",
    category: "privacy",
    question: "How do you protect location privacy?",
    answer: "We use permission-based location sharing, role-based access, private Safety Circles, minimum necessary data collection, and approximate quadrant radii (not exact street addresses) for public and community analytics."
  },
  {
    id: "q11",
    category: "core",
    question: "Can SAFEGRID detect a heart attack or medical diagnosis?",
    answer: "No. We deliberately do not make medical diagnosis claims. We detect missing or interrupted safety signals (e.g. an elderly person missing a morning check-in) and initiate a welfare verification process."
  },
  {
    id: "q12",
    category: "core",
    question: "Can it detect kidnapping?",
    answer: "No software signal alone proves kidnapping. SAFEGRID identifies unusual conditions—such as an overdue journey or an abruptly interrupted safety session—and initiates verification and escalation."
  },
  {
    id: "q13",
    category: "failure",
    question: "What happens if the user forgets to mark arrival?",
    answer: "The system provides a grace period and sends a gentle reminder ('Are you safe?'). The user can confirm arrival with one tap, or extend the expected arrival time by +10, +20, or +30 minutes."
  },
  {
    id: "q14",
    category: "technical",
    question: "What if the responder rejects or fails to update status?",
    answer: "The matching engine automatically marks the assignment timed-out and reassigns the incident to the next available verified responder in proximity."
  },
  {
    id: "q15",
    category: "technical",
    question: "What if multiple users report the same incident?",
    answer: "The backend correlates incidents by approximate coordinates (within 200m) and timestamp windows (within 5 minutes) to prevent duplicated responder dispatching and alert administrators."
  }
];

export const WHAT_IF_SCENARIOS: WhatIfScenario[] = [
  {
    id: "w1",
    scenario: "What if SOS is pressed accidentally?",
    systemResponse: "10-second countdown with prominent Cancel button. Incident cancelled without triggering responders.",
    stateTransition: "CANCELLED → SAFE",
    limitationHonesty: "Prevents accidental pocket-dials from spamming community volunteers."
  },
  {
    id: "w2",
    scenario: "What if the user cannot physically press SOS?",
    systemResponse: "Proactive check-ins and expected journey arrival deadlines trigger verification automatically.",
    stateTransition: "SAFE → ATTENTION → ESCALATION",
    limitationHonesty: "Covers incapacitation, falls, and unconsciousness."
  },
  {
    id: "w3",
    scenario: "What if the phone is offline / loses network?",
    systemResponse: "Actions are queued locally. Server detects absence of expected signal and moves to ATTENTION verification.",
    stateTransition: "ONLINE → LOCAL QUEUE → ATTENTION",
    limitationHonesty: "Does not assume kidnapping; avoids false emergencies."
  },
  {
    id: "w4",
    scenario: "What if the battery dies?",
    systemResponse: "Low-battery warning prompts user to notify circle; server treats missed expected signal as ATTENTION.",
    stateTransition: "LOW BATTERY SYNC → ATTENTION",
    limitationHonesty: "No software can run on a dead phone; server acts on last sync."
  },
  {
    id: "w5",
    scenario: "What if the phone is completely smashed / destroyed?",
    systemResponse: "Server-side journey and check-in deadlines expire, escalating based on last known location.",
    stateTransition: "SESSION INTERRUPTED → ATTENTION → EMERGENCY",
    limitationHonesty: "Acknowledged limitation: cannot transmit new data after total destruction."
  },
  {
    id: "w6",
    scenario: "What if GPS accuracy is degraded?",
    systemResponse: "Displays approximate location with precision radius (~X meters) rather than false precision.",
    stateTransition: "EXACT → APPROXIMATE RADIUS",
    limitationHonesty: "Responders are given quadrant guidance, avoiding misleading street addresses."
  },
  {
    id: "w7",
    scenario: "What if location permission is denied by user?",
    systemResponse: "Core features (SOS, scheduled check-ins, circle pings) remain 100% functional without location.",
    stateTransition: "NO LOCATION → MANUAL CHECK-IN",
    limitationHonesty: "Never breaks the entire application over a single denied permission."
  },
  {
    id: "w8",
    scenario: "What if user forgets to mark safe arrival?",
    systemResponse: "System enters grace period with gentle 'Are you safe?' reminder before escalating.",
    stateTransition: "OVERDUE → GRACE PERIOD → CONFIRMED SAFE",
    limitationHonesty: "User can tap 'I HAVE ARRIVED SAFELY' or extend ETA."
  },
  {
    id: "w9",
    scenario: "What if user is delayed in traffic?",
    systemResponse: "One-tap ETA extensions (+10m, +20m, +30m) push back deadlines and update Safety Circle.",
    stateTransition: "DELAYED → ETA EXTENSION → SAFE",
    limitationHonesty: "Eliminates false alarms caused by transit delays."
  },
  {
    id: "w10",
    scenario: "What if user cancels a journey?",
    systemResponse: "'End Journey' terminates active monitoring cleanly without generating an incident.",
    stateTransition: "ACTIVE → ENDED SAFELY",
    limitationHonesty: "Normal user behavior supported with zero penalty."
  },
  {
    id: "w11",
    scenario: "What if user purposely says they are safe while under duress?",
    systemResponse: "Treated as a confirmed safety signal. Software cannot verify mental state without dedicated hardware/duress pins.",
    stateTransition: "SIGNAL RECEIVED → SAFE",
    limitationHonesty: "Honest limitation: software cannot read minds."
  },
  {
    id: "w12",
    scenario: "What if trusted contact does not answer?",
    systemResponse: "Multi-level escalation moves from primary contact to backup circle, then verified community responders.",
    stateTransition: "LEVEL 1 (CONTACT) → LEVEL 2 (RESPONDER)",
    limitationHonesty: "Does not leave incident hanging on an unresponsive contact."
  },
  {
    id: "w13",
    scenario: "What if responder rejects the assignment?",
    systemResponse: "Dispatch engine immediately re-queries available verified responders and routes to next best match.",
    stateTransition: "REJECTED → NEXT CANDIDATE ASSIGNED",
    limitationHonesty: "Incident stays active until accepted or resolved."
  },
  {
    id: "w14",
    scenario: "What if responder accepts but disappears/stalls?",
    systemResponse: "Timeout monitor triggers automated reassignment if status does not advance within configured threshold.",
    stateTransition: "ACCEPTED → TIMEOUT → REASSIGNED",
    limitationHonesty: "Maintains accountability across the volunteer network."
  },
  {
    id: "w15",
    scenario: "What if there are zero verified responders online?",
    systemResponse: "Dashboard flags incident as UNASSIGNED and keeps Safety Circle alerted with direct contact options.",
    stateTransition: "UNASSIGNED → SAFETY CIRCLE FALLBACK",
    limitationHonesty: "Transparently informs user and circle instead of false promises."
  },
  {
    id: "w16",
    scenario: "What if two users report the same incident?",
    systemResponse: "Incident Correlation engine clusters by coordinate proximity and time window to merge into one master incident.",
    stateTransition: "DUPLICATE REPORT → CORRELATED CLUSTER",
    limitationHonesty: "Prevents dispatching multiple responders to the same site."
  },
  {
    id: "w17",
    scenario: "What if the application crashes or restarts?",
    systemResponse: "Server retains authoritative state; app re-fetches latest active journey and incident on reopen.",
    stateTransition: "CLIENT CRASH → SERVER STATE RESTORED",
    limitationHonesty: "State is not lost in volatile client memory."
  },
  {
    id: "w18",
    scenario: "What if the server is temporarily down?",
    systemResponse: "Frontend displays service unavailable banner; user actions queue locally until REST endpoint recovers.",
    stateTransition: "REST 503 → RETRY QUEUE → AUTO RESYNC",
    limitationHonesty: "Offline-first resilience prevents data loss."
  },
  {
    id: "w19",
    scenario: "What if user has no trusted contacts configured?",
    systemResponse: "App permits SOS and directs alerts to verified community responder pool while recommending circle setup.",
    stateTransition: "NO CIRCLE → DIRECT RESPONDER DISPATCH",
    limitationHonesty: "Emergency safety is never gated behind contact configuration."
  },
  {
    id: "w20",
    scenario: "What if an attacker tries to spam the SOS API?",
    systemResponse: "Backend incorporates rate limiting and requires authenticated user tokens on all incident routes.",
    stateTransition: "SPAM DETECTED → RATE LIMITED (429)",
    limitationHonesty: "Protects volunteer network from malicious distributed denial of service."
  }
];
