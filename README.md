# NagpurOne — Unified Urban Infrastructure & Road Maintenance Platform

[![Vite](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018%20%7C%20Tailwind-646CFF?logo=vite)](frontend/)
[![Express](https://img.shields.io/badge/Backend-Express%20%7C%20Node.js%20%7C%20TypeScript-black?logo=node.js)](backend/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Tests-12%2F12%20Passed%20(100%25)-emerald)](backend/tests/)
[![GitHub](https://img.shields.io/badge/GitHub-MithunX7%2FBuildX__028-blue?logo=github)](https://github.com/MithunX7/BuildX_028)

**NagpurOne** is an enterprise-grade municipal infrastructure and road maintenance platform engineered for Nagpur Municipal Corporation (NMC). It features automated civic grievance triage, explainable risk prioritization, department routing, contractor work order dispatch, engineering photo quality verification, and strict role-based access control (RBAC) cleanly separating Citizen and Administrative operational workflows.

---

## 🏛️ Architectural Overview

The repository is organized into distinct, self-contained `frontend/` and `backend/` layers:

```text
BUID-X/
├── backend/                        # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/            # Admin, Auth, Issues, WorkOrders, Construction, Dashboard
│   │   ├── middleware/             # requireAuth, requireAdmin (Strict RBAC)
│   │   ├── models/                 # Mongoose 8 2dsphere GeoJSON Models (Issue, WorkOrder, User, etc.)
│   │   ├── routes/                 # Express REST Endpoints (authRoutes, issueRoutes, adminRoutes, etc.)
│   │   ├── services/               # Prioritization, Duplicate Engine, Routing, Audit Logger
│   │   ├── utils/                  # MongoDB Connection & Logger
│   │   └── server.ts               # Express Entrypoint (Port 5000)
│   ├── scripts/
│   │   ├── seed-data.ts            # Nagpur Atlas Database Seeder
│   │   └── test-rbac-live.js       # Live End-to-End RBAC & API Verification Script
│   ├── tests/unit/                 # Vitest Suite (12 Unit Tests for RBAC, Routing, Prioritization)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Vite + React 18 + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               # ProtectedRoute (Citizen/User), AdminRoute (Strict Admin Guard)
│   │   │   ├── navigation/         # ConsoleNavbar (Role-aware navigation with quick credentials)
│   │   │   └── ui/                 # Accessible Badge, Button, Modal components
│   │   ├── pages/                  
│   │   │   ├── admin/              # Operational Admin: Dashboard, Issues, Triage, Work Orders,
│   │   │   │                       # Verification, Construction, Users, Audit Logs, Admin Profile
│   │   │   ├── DashboardPage.tsx   # Citizen Personal Dashboard (My Reports, Recent Activity, Quick Report)
│   │   │   ├── MyReportsPage.tsx   # Citizen Grievance History with Status Badges & Evidence Photos
│   │   │   ├── PublicReportPage.tsx# Citizen Grievance Reporting with GPS Geolocation & Real Photo Upload
│   │   │   ├── IssueDetailsPage.tsx# Public & Citizen Issue Tracking (Progress steps, Map coordinates, Evidence)
│   │   │   ├── ProfilePage.tsx     # Citizen Profile Management & Session Termination
│   │   │   ├── HomePage.tsx        # Nagpur Civic Public Landing Page
│   │   │   ├── PublicIssuesPage.tsx# Public Civic Transparency Feed
│   │   │   └── LoginPage.tsx       # Secure Authentication & Role Dispatcher
│   │   ├── services/
│   │   │   ├── apiClient.ts        # Centralized Axios Client (Auth Token Injection & Request Interceptors)
│   │   │   ├── authService.ts      # Authentication & Profile Services
│   │   │   ├── issueService.ts     # Grievance & Citizen Report Services
│   │   │   └── adminService.ts     # Administrative Operations & System Telemetry Services
│   │   ├── App.tsx                 # React Router DOM 6 Layout with Route Guards
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts              # Reverse Proxy `/api` -> `http://localhost:5000`
│   └── tailwind.config.js
│
├── package.json                    # Monorepo Script Orchestrator
└── README.md
```

---

## 🔒 Role-Based Access Control (RBAC) & User Separation

NagpurOne strictly isolates the **Citizen (USER)** and **Administrative (ADMIN)** operational portals:

### 👤 Citizen / USER Experience
- **Personal Dashboard (`/dashboard`)**: Displays user-specific metrics (My Reports count, In Progress, Resolved), quick report launcher, and recent submission list.
- **My Reports (`/my-reports`)**: Full history of complaints submitted by the authenticated citizen, complete with real uploaded photo evidence, live status progress bars, and SLA indicators.
- **Submit Report (`/report`)**: Interactive form with real device geolocation capture (`navigator.geolocation`) and real photo file upload (JPEG/PNG converted to base64 evidence).
- **Issue Tracking (`/issues/:id`)**: Public and citizen tracking page showing issue timeline, assigned department, and resolution status.
- **Profile (`/profile`)**: Manage personal details (name, phone, address, ward) and secure logout.
- **Security**: Citizen accounts are completely blocked from administrative APIs. Accessing any `/api/admin/*` endpoint returns `403 Forbidden`. Attempting to open `/admin/*` in the browser triggers the `AdminRoute` guard which displays a security alert and redirects to `/dashboard`.

### 🛡️ Municipal Officer / ADMIN Experience
- **Command Center (`/admin`)**: Municipal-wide key performance indicators, department resolution rates, SLA adherence, and quick operational shortcuts.
- **Issue Management (`/admin/issues`)**: Filter, inspect, and monitor all civic issues citywide.
- **Triage & Risk Prioritization (`/admin/triage`)**: Algorithmic risk scoring breakdown based on severity, landmark proximity (GMC Hospital, Sitabuldi Metro, etc.), duplicate density, and age. Department manual override capabilities.
- **Contractor Work Orders (`/admin/work-orders`)**: SLA countdown timers, contractor assignment, status workflow updates, and real field completion photo upload.
- **Engineering Verification (`/admin/verification`)**: Side-by-side inspection of citizen defect photos vs contractor repair proof with *Approve & Resolve* or *Reject & Reopen* actions.
- **Utility Conflict Engine (`/admin/construction`)**: Active road utility trenching detection to prevent repaving roads scheduled for excavation.
- **User Management (`/admin/users`)**: Municipal roster showing user accounts, assigned roles, and department affiliations.
- **Audit Logs (`/admin/audit-logs`)**: Immutable compliance log of all triage adjustments, work order updates, and administrative actions.
- **Admin Profile (`/admin/profile`)**: Officer profile settings, credentials, and session management.

---

## 👥 Demo User Accounts

All demo accounts share the password: **`nagpur123`** (or select the convenient quick-fill button on the Login page):

| Role | Name | Email | Initial Redirect |
|---|---|---|---|
| **Resident Citizen** | Anand Joshi | `citizen.nagpur@gmail.com` | `/dashboard` (Citizen Portal) |
| **System Administrator** | System Administrator | `admin@nmc.nagpur.gov.in` | `/admin` (Command Center) |
| **Operations Commander** | Cmdr. Rajesh Sharma | `commander@nmc.nagpur.gov.in` | `/admin` (Command Center) |
| **Roads Coordinator** | Er. Amit Deshmukh | `coordinator.roads@nmc.nagpur.gov.in` | `/admin/triage` |
| **Field Contractor** | Sanjay Patel | `inspector.patrol@nmc.nagpur.gov.in` | `/admin/work-orders` |
| **Chief Quality Verifier** | Er. Priya Kulkarni | `verifier.eng@nmc.nagpur.gov.in` | `/admin/verification` |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- Access to MongoDB Atlas (configured in `backend/.env`)

### 2. Quick Launch
```bash
# Terminal 1: Launch Backend Server (Port 5000)
npm run dev:backend

# Terminal 2: Launch Frontend Server (Port 3000)
npm run dev:frontend
```

Frontend application: **`http://localhost:3000`**  
Backend REST API: **`http://localhost:5000`**

### 3. Database Seeding
To populate or refresh the MongoDB Atlas database with demo departments, users, projects, and defects:
```bash
npm run seed:backend
```

### 4. Running Unit Tests
```bash
npm run test:backend
```
Output:
```text
✓ tests/unit/rbac.test.ts (4 tests)
✓ tests/unit/prioritization.test.ts (4 tests)
✓ tests/unit/routing.test.ts (4 tests)
Test Files: 3 passed (3) | Tests: 12 passed (12)
```

### 5. Running Live RBAC Integration Tests
Verify real MongoDB API authentication and role separation against the running server:
```bash
node backend/scripts/test-rbac-live.js
```
All 8 verification checks pass:
- Unauthenticated requests blocked (`401 Unauthorized`)
- Citizen login authenticated
- Citizen forbidden from `/api/admin/users` (`403 Forbidden`)
- Admin permitted on `/api/admin/users` (`200 OK`)
- Real grievance creation with photo evidence
- Citizen `/api/issues/my` filtering
- Public issue detail accessible

---

## 🧭 Application Routes

### Public & Citizen Routes
| Route | Access | Description |
|---|---|---|
| `/` | Public | Nagpur civic public landing page with statistics and navigation |
| `/login` | Public | Secure authentication portal with role auto-fill |
| `/issues` | Public | Public transparency feed of reported issues across Nagpur |
| `/issues/:id` | Public | Detailed grievance status tracking, timeline, and photo proof |
| `/dashboard` | Citizen (USER) | Personal citizen dashboard with user report metrics |
| `/my-reports` | Citizen (USER) | History of reports submitted by the logged-in citizen |
| `/report` | Citizen (USER) | Citizen issue submission with real GPS & photo file upload |
| `/profile` | Citizen (USER) | Citizen profile management & account settings |

### Administrative Operational Routes (Protected by `requireAdmin`)
| Route | Access | Description |
|---|---|---|
| `/admin` | ADMIN | Municipal Command Console with citywide metrics and quick triage |
| `/admin/issues` | ADMIN | Citywide issue repository and filtering |
| `/admin/triage` | ADMIN | Priority scoring breakdown, SLA tracking, and department overrides |
| `/admin/work-orders` | ADMIN | Contractor work order dispatch & completion photo evidence upload |
| `/admin/verification` | ADMIN | Dual-photo engineering inspection & resolution approval |
| `/admin/construction` | ADMIN | Scheduled excavation projects & road cut spatial conflict warnings |
| `/admin/users` | ADMIN | Municipal personnel roster and account permissions |
| `/admin/audit-logs` | ADMIN | Immutable activity log of administrative decisions |
| `/admin/profile` | ADMIN | Officer profile settings and department affiliation |

---

## 📡 Backend REST API Endpoints

### Authentication & Profile (`/api/auth`)
- `POST /api/auth/login` — User authentication returning JWT token and role
- `POST /api/auth/register` — Citizen account registration
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update authenticated user profile details

### Grievances & Issues (`/api/issues`)
- `GET /api/issues` — Paginated list of civic grievances with priority scores
- `GET /api/issues/my` — Reports submitted exclusively by the authenticated citizen
- `GET /api/issues/:id` — Single issue detail with audit history and evidence photos
- `POST /api/issues` — Create civic grievance with GPS coordinates and photo evidence
- `PATCH /api/issues/:id/triage` — Override department or priority with explanation *(Admin only)*

### Administrative Operations (`/api/admin`) *(Strict `requireAdmin` enforcement)*
- `GET /api/admin/summary` — Citywide operational metrics, SLA stats, and category distribution
- `GET /api/admin/users` — List registered users and municipal officers
- `GET /api/admin/audit-logs` — Immutable audit trail of operational actions

### Work Orders & Verification (`/api/work-orders`)
- `GET /api/work-orders` — Contractor work orders with SLA countdowns
- `POST /api/work-orders/:id/evidence` — Submit contractor completion photo evidence
- `POST /api/work-orders/:id/verify` — Quality engineering approval or rejection *(Admin only)*

### Construction Conflicts (`/api/construction-projects`)
- `GET /api/construction-projects` — Active road excavation and utility projects
- `GET /api/construction-projects/conflicts` — Spatial and temporal road cut conflict warnings
