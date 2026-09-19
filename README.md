# 🛡️ SAFEGRID

### Smart, Connected & Proactive Personal Safety Platform

> **From a simple SOS button to a complete safety-response ecosystem.**

SAFEGRID is a smart personal safety platform designed to help users **prepare for emergencies, trigger safety signals, share critical information, involve trusted contacts, monitor journeys, and manage safety incidents through a structured response workflow.**

The system combines **personal safety configuration, Safety Circles, Safe Journey monitoring, location services, emergency escalation, and responder workflows** into one centralized platform.

---

## 🚨 The Problem

In an emergency, the biggest challenge is often not only **calling for help**.

A person may:

* Have very little time to react.
* Be travelling alone.
* Be unable to explain their location clearly.
* Need their family or trusted contacts to know what is happening.
* Need their journey to be monitored.
* Require different levels of emergency response.
* Lose internet connectivity.
* Need responders to understand the situation quickly.

Traditional safety applications often focus mainly on:

> **"Press SOS."**

But an emergency does not end after pressing SOS.

There needs to be a complete process for:

**Detection → Verification → Escalation → Response → Resolution**

---

# 💡 Our Solution

SAFEGRID converts an emergency signal into a structured **Safety Event**.

Instead of treating SOS as an isolated notification, the platform creates a safety workflow around the event.

### Core Workflow

```text
                 USER
                  │
                  ▼
            SAFETY SIGNAL
                  │
                  ▼
             VERIFICATION
                  │
                  ▼
             SAFETY STATE
                  │
                  ▼
            RISK ASSESSMENT
                  │
                  ▼
              ESCALATION
                  │
                  ▼
        SAFETY CIRCLE / RESPONDER
                  │
                  ▼
           LIVE MONITORING
                  │
                  ▼
              RESOLUTION
```

---

# 🎯 Project Objective

SAFEGRID aims to create a centralized digital safety platform that can:

* Improve emergency communication.
* Provide contextual safety information.
* Connect users with trusted contacts.
* Support safe journeys.
* Provide location-based assistance.
* Track safety-event states.
* Create a structured escalation workflow.
* Support future integration with authorized emergency responders.

---

# ✨ Key Features

## 🚨 1. Smart SOS

Users can trigger an emergency safety signal.

The system can associate the signal with relevant information such as:

* User identity
* Current location
* Emergency configuration
* Safety Circle
* Current journey
* Emergency agency configuration
* Nearby safety context

The objective is to provide **context instead of only an alert**.

---

# 👤 2. Personalized Safety Onboarding

SAFEGRID allows users to configure their safety experience according to their situation.

Example user categories:

* 👩 Women / Solo Commuters
* 👴 Senior Citizens
* 🎓 Students
* 🌙 Late-Shift Workers
* 👤 General Citizens

During setup, users can configure information such as:

* Emergency preferences
* Emergency medical notes
* Emergency agency
* Safety vicinity radius
* Trusted contacts

This makes the system adaptable to different safety requirements.

---

# 👥 3. Safety Circle

The **Safety Circle** is a trusted group of people who can be involved during a safety event.

Users can manage:

* Family members
* Friends
* Guardians
* Trusted contacts

Each contact can contain information such as:

```text
Name
Relationship
Contact Information
Area / Distance
Permissions
Emergency Access
Vicinity Radius
```

Users can:

* Add contacts
* Edit contacts
* Remove contacts
* Configure permissions

---

# 🗺️ 4. Safe Journey

SAFEGRID provides a dedicated **Safe Journey** workflow.

Users can define:

```text
Origin
   ↓
Destination
   ↓
Route
   ↓
Journey Monitoring
   ↓
Safety Status
```

Example destinations:

* 🏠 Home
* 🏥 Hospital
* 🎓 College
* 🏫 School
* 🚓 Police Station
* 🏢 Workplace
* 🏘️ Residential Area

The journey provides additional context if a safety event occurs.

---

# 📍 5. Location & Maps

SAFEGRID integrates map functionality to provide location-aware safety features.

Maps can be used for:

* Current location
* Journey routes
* Destination selection
* Location sharing
* Nearby safety context
* Emergency response context

The Maps API provides the underlying location and mapping functionality.

---

# 🔔 6. Emergency Escalation

A safety event can move through different stages.

Example:

```text
SIGNAL
  ↓
VERIFY
  ↓
WARNING
  ↓
ALERT
  ↓
EMERGENCY
  ↓
RESPONDER ASSIGNED
  ↓
RESOLVED
```

This allows the platform to represent the **current state of an emergency**.

---

# 📊 7. Safety Dashboard

The dashboard provides a centralized view of safety information.

It can display:

* Active safety events
* User status
* Journey status
* Emergency alerts
* Location information
* Responder information
* Resolution status

This creates a unified safety-management interface.

---

# 🧠 8. Safety State Management

SAFEGRID uses states to represent what is happening during a safety event.

Example:

```text
SAFE
 ↓
WARNING
 ↓
ALERT
 ↓
EMERGENCY
 ↓
RESPONDER ASSIGNED
 ↓
RESOLVED
```

This state-based approach makes the system easier to monitor, extend, and integrate with future response systems.

---

# 🔐 9. Authentication

SAFEGRID uses **Firebase Authentication** for user authentication.

Authentication is responsible for:

* User registration
* User login
* Identity management
* Session management
* Protected access

---

# 🗄️ 10. Cloud Firestore Database

Cloud Firestore is used to store application data.

Example data includes:

* User profiles
* Safety preferences
* Safety Circle contacts
* Journey information
* Safety events
* Emergency settings
* Responder information
* Event status

---

# 🔌 11. Backend APIs

The backend provides an API layer between the frontend and application services.

Example API structure:

```text
POST   /register
POST   /login

POST   /reports
GET    /reports
GET    /reports/:id

PUT    /reports/:id/status
PUT    /reports/:id/assign
```

The exact API implementation can evolve as the prototype develops.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         │   Mobile / Browser  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       FLUTTER       │
                         │      FRONTEND       │
                         │                     │
                         │ UI + Screens        │
                         │ State + Services    │
                         └──────────┬──────────┘
                                    │
                              API / HTTPS
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     NODE.JS +       │
                         │      EXPRESS       │
                         │      BACKEND       │
                         │                     │
                         │ Routes              │
                         │ Controllers         │
                         │ Validation          │
                         │ Business Logic      │
                         └──────┬──────┬───────┘
                                │      │
                    ┌───────────┘      └──────────────┐
                    ▼                                  ▼
          ┌──────────────────┐              ┌──────────────────┐
          │     FIREBASE     │              │     MAPS API     │
          │                  │              │                  │
          │ Authentication   │              │ Maps             │
          │ Firestore        │              │ Location         │
          │                  │              │ Routes           │
          └──────────────────┘              └──────────────────┘
```

---

# 🛠️ Technology Stack

| Technology                  | Role                                   |
| --------------------------- | -------------------------------------- |
| **Flutter**                 | Cross-platform frontend                |
| **Flutter Web**             | Browser-based hackathon prototype      |
| **Dart**                    | Flutter programming language           |
| **Node.js**                 | Backend runtime                        |
| **Express.js**              | REST API framework                     |
| **Firebase Authentication** | Authentication                         |
| **Cloud Firestore**         | Cloud database                         |
| **Maps API**                | Maps, location and route functionality |
| **Git**                     | Version control                        |
| **GitHub**                  | Repository and collaboration           |

---

# 🎨 Frontend

The frontend is developed using **Flutter**.

Flutter allows the application interface to be developed from a common codebase.

### Frontend responsibilities

```text
UI
 ↓
User Interaction
 ↓
Form Validation
 ↓
State Management
 ↓
API / Firebase Services
 ↓
Display Response
```

The frontend handles:

* Login
* Registration
* User onboarding
* Safety configuration
* Safety Circle
* Safe Journey
* SOS
* Safety dashboard
* Emergency status
* Maps
* Notifications/status information

---

# ⚙️ Backend

The backend uses:

**Node.js + Express.js**

The backend provides the application API layer.

### Backend workflow

```text
Frontend Request
       ↓
Express Route
       ↓
Controller
       ↓
Validation
       ↓
Business Logic
       ↓
Database / External Service
       ↓
API Response
       ↓
Frontend
```

This separates the user interface from backend application logic.

---

# 🔥 Firebase

Firebase provides important cloud services.

## Firebase Authentication

Used for:

```text
Registration
Login
Identity
Authentication
```

## Cloud Firestore

Used for:

```text
Users
Safety Circles
Journeys
Safety Events
Emergency Settings
Application Data
```

---

# 🗺️ Maps API

The Maps API provides location-related functionality.

Potential use cases include:

* Displaying maps
* Selecting locations
* Showing routes
* Displaying current position
* Calculating journey context
* Supporting emergency location sharing

---

# 🔄 Complete Application Workflow

```text
┌───────────────────────┐
│ 1. USER REGISTRATION  │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 2. USER AUTHENTICATES │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 3. SAFETY ONBOARDING  │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 4. CONFIGURE SAFETY   │
│    PREFERENCES        │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 5. ADD SAFETY CIRCLE  │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 6. START SAFE JOURNEY │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 7. LOCATION CONTEXT   │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 8. SAFETY SIGNAL      │
│    OCCURS             │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 9. SAFETY EVENT       │
│    CREATED            │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 10. VERIFICATION      │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 11. SAFETY STATE      │
│     UPDATED           │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 12. ESCALATION        │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 13. SAFETY CIRCLE /   │
│     RESPONDER         │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 14. MONITORING        │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ 15. RESOLUTION        │
└───────────────────────┘
```

---

# 🔗 Frontend → Backend → Database Flow

Example:

```text
User
 ↓
Flutter UI
 ↓
API Request
 ↓
Express.js
 ↓
Route
 ↓
Controller
 ↓
Validation
 ↓
Firestore
 ↓
Database Response
 ↓
Express.js
 ↓
JSON Response
 ↓
Flutter
 ↓
Updated UI
```

This architecture allows each layer to have a specific responsibility.

---

# 📦 Example Project Structure

```text
SAFEGRID/
│
├── frontend/
│   │
│   ├── lib/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── main.dart
│   │
│   ├── assets/
│   ├── web/
│   └── pubspec.yaml
│
├── backend/
│   │
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── models/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── architecture/
│   ├── diagrams/
│   └── screenshots/
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# 🗃️ Example Database Structure

A simplified Firestore structure can look like:

```text
users/
   userId/
      name
      email
      phone
      userType
      emergencySettings

safetyCircles/
   circleId/
      userId
      contactName
      relationship
      permissions
      vicinityRadius

journeys/
   journeyId/
      userId
      origin
      destination
      route
      status

safetyEvents/
   eventId/
      userId
      eventType
      location
      timestamp
      safetyState
      status
      responderId
```

---

# 🔒 Security

Because SAFEGRID deals with safety and location-related information, security is an important part of the system.

The application should follow principles such as:

* Authentication before accessing private data
* User-specific authorization
* Protected API endpoints
* Firestore security rules
* HTTPS communication
* Controlled Safety Circle access
* Minimum necessary data sharing
* Secure environment variables
* No API secrets inside GitHub

### ⚠️ Never commit:

```text
.env
Firebase private keys
Service account credentials
Passwords
Secret API keys
Private tokens
```

---

# 🌐 Low-Connectivity Considerations

A real-world safety application cannot depend entirely on internet connectivity.

A production version of SAFEGRID should support fallback mechanisms such as:

* Network availability detection
* Cached emergency contacts
* Last-known location
* Retry mechanisms
* SMS/cellular fallback
* Offline emergency information
* Local emergency configuration

The current hackathon prototype focuses primarily on demonstrating the **digital safety workflow and architecture**.

---

# 🧪 Testing

Important test cases include:

### Authentication

* Registration
* Login
* Invalid credentials
* Session handling

### Safety Circle

* Add contact
* Edit contact
* Delete contact
* Permission handling

### Safe Journey

* Origin selection
* Destination selection
* Route display
* Journey start
* Journey status

### Emergency

* SOS activation
* Safety event creation
* State transition
* Escalation
* Resolution

### Backend

* API request validation
* Database operations
* Error handling
* Invalid requests
* Authentication checks

### Network

* Slow connection
* Network failure
* API failure
* Retry behavior

---

# 🚀 Future Scope

SAFEGRID can be extended beyond the current hackathon prototype.

## 🤖 AI-Based Risk Detection

Future versions could analyze contextual signals and identify potential safety risks.

---

## 📡 Low-Network Emergency Communication

Future versions could support alternative communication methods when internet connectivity is unavailable.

---

## 📞 Authorized Emergency-Service Integration

The platform could integrate with authorized emergency agencies where appropriate.

Such integration would require official APIs, permissions, authentication, and operational agreements.

---

## 🧠 Anomaly Detection

Future versions could detect unusual journey patterns such as:

* Unexpected route deviation
* Unexpected long stops
* Journey abandonment
* Unusual movement patterns

---

## 🎙️ Voice-Based Emergency Activation

Users could potentially trigger safety workflows through voice commands.

---

## ⌚ Wearable Integration

Future versions could connect with:

* Smartwatches
* Wearable safety devices
* Health/safety sensors

---

## 🏙️ Smart-City Integration

SAFEGRID could eventually connect authorized safety systems with:

```text
Citizens
   ↓
Safety Platform
   ↓
Authorized Responders
   ↓
Institutions
   ↓
Smart-City Infrastructure
```

---

# 🧩 Challenges & Solutions

| Challenge                              | SAFEGRID Approach                  |
| -------------------------------------- | ---------------------------------- |
| User may be unable to explain location | Location context                   |
| Family may not know about an emergency | Safety Circle                      |
| SOS alone lacks context                | Safety Event                       |
| Emergencies change over time           | Safety States                      |
| Users travel alone                     | Safe Journey                       |
| Different users have different needs   | Personalized onboarding            |
| Internet may fail                      | Future offline/fallback mechanisms |
| Emergency response needs structure     | Escalation workflow                |
| Multiple systems need communication    | API-based architecture             |

---

# 📈 Scalability

SAFEGRID is designed with separate application layers:

```text
Frontend
   ↓
Backend
   ↓
Authentication
   ↓
Database
   ↓
External APIs
```

This separation makes it possible to extend the platform in the future.

Potential expansion:

```text
Individual User
       ↓
Family / Safety Circle
       ↓
Educational Institutions
       ↓
Organizations
       ↓
Authorized Responders
       ↓
Smart-City Ecosystem
```

---

# 💻 Installation

## Prerequisites

Install the following:

* Flutter SDK
* Dart
* Node.js
* npm
* Git
* VS Code
* Firebase project
* Maps API configuration

Verify installations:

```bash
flutter --version
dart --version
node --version
npm --version
git --version
```

---

# 📥 Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd SAFEGRID
```

---

# 🎨 Frontend Setup

```bash
cd frontend
```

Install Flutter dependencies:

```bash
flutter pub get
```

Run the application:

```bash
flutter run
```

For Chrome/Web:

```bash
flutter run -d chrome
```

---

# ⚙️ Backend Setup

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

---

# 🔑 Environment Configuration

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

MAPS_API_KEY=your_maps_api_key
```

Do not upload the actual `.env` file to GitHub.

Add it to `.gitignore`:

```text
.env
```

---

# 🔄 Development Workflow

```text
Create Feature
     ↓
Develop Frontend
     ↓
Develop API
     ↓
Connect Database
     ↓
Test
     ↓
Fix Errors
     ↓
Git Commit
     ↓
Git Push
```

---

# 🌿 Git Workflow

Example:

```bash
git status

git add .

git commit -m "Add safety journey module"

git push
```

For feature branches:

```bash
git checkout -b feature/safe-journey
```

---

# 📸 Screenshots

Add screenshots of the application here.

Example:

```text
docs/screenshots/
├── login.png
├── onboarding.png
├── dashboard.png
├── safety-circle.png
├── safe-journey.png
├── sos.png
└── emergency-dashboard.png
```

Then add them to this README using:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

---

# 🎥 Demo Flow

For a hackathon demonstration, the recommended flow is:

```text
1. Open SAFEGRID
       ↓
2. Register / Login
       ↓
3. Complete Safety Onboarding
       ↓
4. Configure Emergency Settings
       ↓
5. Add Safety Circle
       ↓
6. Start Safe Journey
       ↓
7. Show Map / Location
       ↓
8. Trigger Safety Signal
       ↓
9. Show Safety Event
       ↓
10. Show Verification
       ↓
11. Show Safety State
       ↓
12. Show Escalation
       ↓
13. Show Safety Circle / Responder
       ↓
14. Resolve Event
```

---

# 🏆 Hackathon Value

SAFEGRID demonstrates more than a single emergency button.

The prototype combines:

```text
Personal Safety
      +
Trusted Contacts
      +
Journey Monitoring
      +
Location Services
      +
Emergency Events
      +
Safety States
      +
Escalation
      +
Responder Workflow
```

The core idea is:

> **A safety signal should become an actionable safety event, not just a notification.**

---

# 🎯 Project Vision

### Make safety proactive, connected and actionable.

SAFEGRID aims to create a future where personal safety systems can connect users, trusted contacts, journeys, location information and authorized response systems through one structured platform.

---

# 👨‍💻 Team

## SAFEGRID Team

**Project:** SAFEGRID
**Domain:** Social Impact / Public Safety
**Platform:** Flutter Web / Cross-Platform Application

### Team Areas

| Area            | Responsibility                   |
| --------------- | -------------------------------- |
| 🎨 Frontend     | Flutter UI and user experience   |
| ⚙️ Backend      | Node.js, Express and APIs        |
| 🔥 Firebase     | Authentication and Firestore     |
| 🗺️ Maps        | Location and route functionality |
| 🧪 Testing      | Testing and debugging            |
| 📊 Presentation | Documentation and demonstration  |

---

# 📜 License

This project is currently developed as a **hackathon prototype**.

If the project is later released as open source, add an appropriate license such as MIT, Apache 2.0, or another license suitable for the project.

---

# ❤️ SAFEGRID

> **Detect. Verify. Escalate. Respond. Resolve.**

**Building a safer and more connected digital environment through technology.**

