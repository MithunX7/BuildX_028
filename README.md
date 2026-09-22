# NagpurOne — Unified Urban Infrastructure & Road Maintenance Platform

[![Vite](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018%20%7C%20Tailwind-646CFF?logo=vite)](frontend/)
[![Express](https://img.shields.io/badge/Backend-Express%20%7C%20Node.js%20%7C%20TypeScript-black?logo=node.js)](backend/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Tests-12%2F12%20Passed%20(100%25)-emerald)](backend/tests/)
[![GitHub](https://img.shields.io/badge/GitHub-MithunX7%2FBuildX__028-blue?logo=github)](https://github.com/MithunX7/BuildX_028)

**NagpurOne** is an enterprise-grade, responsive municipal infrastructure and road maintenance platform engineered for Nagpur Municipal Corporation (NMC). It integrates **Live Video Stream Computer Vision Detection** with automated civic grievance triage, explainable risk prioritization, department routing, contractor work order dispatch, and engineering photo quality verification.

---

## 🏛️ Architectural Overview

The repository has been decoupled into dedicated, self-contained `frontend/` and `backend/` layers:

```text
BUID-X/
├── backend/                        # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/            # Auth, Detection, Issues, WorkOrders, Construction, Dashboard
│   │   ├── models/                 # Mongoose 8 2dsphere GeoJSON Models
│   │   ├── routes/                 # Express REST Endpoints
│   │   ├── services/               # Explainable Prioritization, Duplicate Engine, Routing, Detection
│   │   ├── utils/                  # MongoDB Connection & Logging
│   │   └── server.ts               # Express Entrypoint (Port 5000)
│   ├── scripts/
│   │   └── seed-data.ts            # Nagpur Atlas Database Seeder (7 roles, departments, issues, conflicts)
│   ├── tests/unit/                 # Vitest Suite (12 Unit Tests for Routing, Detection, Prioritization)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Vite + React 18 + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── console/            # LiveVideoPlayer, DetectionStream, QuickTriagePanel, OperationsMap
│   │   │   ├── navigation/         # ConsoleNavbar (Responsive Hamburger Drawer + 1-Click Role Switcher)
│   │   │   └── ui/                 # Accessible Badge, Button, Modal components
│   │   ├── pages/                  # Responsive pages: Home, Dashboard, Triage, WorkOrders, Verification, Construction, Citizen Report, Issue Tracking, Login
│   │   ├── services/
│   │   │   └── apiClient.ts        # Centralized Axios Client (Auth Token Injection, Reverse Proxy)
│   │   ├── App.tsx                 # React Router DOM 6 Layout
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts              # Reverse Proxy `/api` -> `http://localhost:5000`
│   └── tailwind.config.js
│
├── package.json                    # Monorepo Root Script Orchestrator
└── README.md
```

---

## 📱 Full Responsive Design System

The frontend is designed with dynamic layouts and micro-animations for three responsive tiers:
- **Mobile (320px – 767px)**:
  - Collapsible slide-over drawer navigation with touch-friendly touch targets.
  - Stacked full-width camera player with quick control toggles.
  - Scrollable detection pills and swipeable triage cards.
  - Sticky bottom action bars for field contractors uploading evidence.
- **Tablet (768px – 1023px)**:
  - 2-column adaptive layout for camera stream and real-time detection telemetry.
  - Side-by-side photo comparison for engineering verification.
- **Desktop (1024px+)**:
  - Full widescreen operations dashboard with synchronized multi-panel triage, detection telemetry, interactive zone map, and instant drawer overrides.

---

## 🌟 Key Features

1. **Live Video Detection Console (Visual Centerpiece)**
   - Real-time video canvas detection with animated bounding boxes, label tags, and confidence scores.
   - Built-in webcam support or 5 multi-problem Nagpur patrol scenes:
     - **Scene 1**: Severe Pothole Crater on Wardha Road (`POTHOLE`, 89% conf, High Priority).
     - **Scene 2**: Overflowing Garbage Dump at Sitabuldi (`GARBAGE_ACCUMULATION`, 94% conf).
     - **Scene 3**: Broken Streetlight Luminaire on Central Avenue (`STREETLIGHT_FAULT`, 86% conf).
     - **Scene 4**: Unmarked Pipe Excavation Debris (`ROAD_OBSTRUCTION`, 92% conf, flags utility conflict).
     - **Scene 5**: Re-surveying Wardha Road Pothole (Duplicate Proximity Detection within 12m).

2. **Explainable Risk Prioritization Engine**
   - Transparent, audit-proof scoring formula:
     $$\text{Score} = \text{BaseSeverity} + \text{ProximityBonus} + \text{DuplicateBonus} + \text{AgeBonus}$$
   - Geospatial bonuses calculated for key Nagpur landmarks: GMC Hospital, Sitabuldi Metro Interchange, Dharampeth High School, and Wardha Road High-Speed Corridor.

3. **Geospatial Duplicate Consolidation Engine**
   - Uses MongoDB `2dsphere` geospatial indexing and `$near` queries within a 50m radius.
   - Automatically increments duplicate counters and links detection evidence rather than cluttering municipal queues with redundant tickets.

4. **Municipal Department Routing**
   - Automatic routing rules for:
     - Roads & Traffic Department (`ROADS`, SLA: 24h)
     - Solid Waste Management (`SANITATION`, SLA: 12h)
     - Electrical & Public Lighting (`ELECTRICAL`, SLA: 24h)
     - Water Works & Drainage (`WATER_WORKS`, SLA: 18h)
   - Coordinator override capabilities with persistent audit logging.

5. **Work Order Lifecycle & Quality Verification**
   - Automated SLA countdowns, priority dispatch to contractors, and photo evidence upload.
   - Verification queue with side-by-side before/after photo inspection, *Approve & Resolve*, or *Reject & Reopen with Notes*.

6. **Construction Conflict Engine**
   - Cross-checks reported road defects against scheduled utility excavations (e.g. MahaMetro Feeder Pipe or Water Pipeline trenching) to prevent repaving roads scheduled for immediate digging.

---

## 👥 Demo User Credentials

All demo accounts share the password: **`nagpur123`** (or click any role in the navbar **1-Click Role Switcher**):

| Role | Name | Email | Default Dashboard Access |
|---|---|---|---|
| **Operations Commander** | Cmdr. Rajesh Sharma | `commander@nmc.nagpur.gov.in` | Complete System Overview & Analytics |
| **Roads Coordinator** | Er. Amit Deshmukh | `coordinator.roads@nmc.nagpur.gov.in` | Triage Queue & Department Dispatch |
| **Field Patrol / Contractor** | Sanjay Patel | `inspector.patrol@nmc.nagpur.gov.in` | Work Orders & Evidence Upload |
| **Chief Quality Verifier** | Er. Priya Kulkarni | `verifier.eng@nmc.nagpur.gov.in` | Engineering Photo Verification |
| **Helpline Operator** | Kavita Rao | `operator.helpline@nmc.nagpur.gov.in` | Public Ingestion & Triage |
| **Resident Citizen** | Anand Joshi | `citizen.nagpur@gmail.com` | Grievance Reporting & Tracking |
| **System Administrator** | System Administrator | `admin@nmc.nagpur.gov.in` | Full Administrative Permissions |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- Access to MongoDB Atlas (pre-configured in `backend/.env`)

### 2. Quick Launch from Root
```bash
# Start backend (Port 5000)
npm run dev:backend

# Start frontend (Port 3000)
npm run dev:frontend
```

Frontend application: **`http://localhost:3000`**  
Backend REST API: **`http://localhost:5000`**

### 3. Database Seeding
To re-seed the MongoDB Atlas database with demo departments, users, projects, and defects:
```bash
npm run seed:backend
```

### 4. Running Unit Tests
```bash
npm run test:backend
```
Output:
```text
✓ tests/unit/detection.test.ts (4 tests)
✓ tests/unit/prioritization.test.ts (4 tests)
✓ tests/unit/routing.test.ts (4 tests)
Test Files: 3 passed (3) | Tests: 12 passed (12)
```

---

## 🧭 Application Routes

| Route | Description |
|---|---|
| `/` | NagpurOne Public Portal (Citizen Hero, Key Statistics, Quick Access) |
| `/operations/dashboard` | Central Command Console (Live Video Player, Real-Time Detection Feed, Quick Triage, Ward Map) |
| `/operations/triage` | Operational Triage Queue with explainable risk breakdown & manual overrides |
| `/operations/work-orders` | Contractor Work Order Management & Photo Evidence Submission |
| `/operations/verification` | Quality Engineering Photo Verification (Before / After Comparison) |
| `/operations/construction` | Scheduled Excavations & Spatial Conflict Detection |
| `/report` | Citizen Grievance Reporting Portal with GPS Geolocation |
| `/issues/:id` | Citizen Public Issue Tracking Status |
| `/login` | Multi-role login with 1-Click Role Switcher |

---

## 📡 Backend REST API Endpoints

- `GET /api/health` — System health and MongoDB Atlas connectivity status
- `POST /api/auth/login` — Role authentication with JWT token generation
- `GET /api/auth/me` — Current authenticated user profile
- `GET /api/dashboard/summary` — Aggregate metrics, SLA compliance, defect category breakdown
- `GET /api/issues` — Paginated list of civic grievances with priority scores and duplicate counts
- `GET /api/issues/:id` — Single issue detail with audit history and evidence photos
- `POST /api/issues` — Create citizen complaint or system defect with duplicate detection
- `PATCH /api/issues/:id/triage` — Override department or priority with explanation
- `POST /api/detection/analyze-frame` — Run computer vision detection simulation on video frame
- `GET /api/work-orders` — List contractor work orders with SLA countdowns
- `POST /api/work-orders/:id/evidence` — Submit field contractor completion photo evidence
- `POST /api/work-orders/:id/verify` — Engineering verification approval or rejection
- `GET /api/construction-projects` — Active road utility projects
- `GET /api/construction-projects/conflicts` — Spatial and temporal road cut conflict warnings
