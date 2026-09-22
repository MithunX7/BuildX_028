# Technical Requirements Document (TRD)
## Nagpur Civic Infrastructure Monitoring & Live Video Detection Platform

**Version:** 2.0  
**Date:** 22 September 2026  
**Status:** MVP Technical Architecture & Design  
**Architecture:** Next.js Full-Stack Application with Live Video Detection Pipeline & MongoDB

---

## 1. System Architecture Overview

The system consists of a single Next.js App Router application integrating real-time live video processing, REST API Route Handlers, domain intelligence services, and MongoDB database storage via Mongoose.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER FRONTEND                                │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │   LIVE VIDEO PANEL    │  │ DETECTION EVENT FEED  │  │ TRIAGE & ISSUES │  │
│  │ (Camera/Video Stream) │  │  (Real-Time Stream)   │  │   (Work Orders) │  │
│  │  [Canvas BoundingBox] │  │                       │  │                 │  │
│  └───────────┬───────────┘  └───────────▲───────────┘  └────────▲────────┘  │
│              │ Frame Sample             │ Detection Results     │ Actions   │
└──────────────┼──────────────────────────┼───────────────────────┼───────────┘
               │ POST Frame (Base64)      │                       │
               ▼                          │                       │
┌─────────────────────────────────────────┴───────────────────────┴───────────┐
│                        NEXT.JS FULL-STACK BACKEND                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      API Route Handlers (app/api)                     │  │
│  │  • /api/detection/analyze-frame  • /api/issues    • /api/work-orders  │  │
│  │  • /api/reports                  • /api/conflicts • /api/auth         │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────▼────────────────────────────────────┐  │
│  │                       Domain Services (lib/)                          │  │
│  │  • detection-service.ts  (Object classification & Bounding boxes)    │  │
│  │  • duplicate-engine.ts   (2dsphere geospatial & text matching)       │  │
│  │  • prioritization.ts     (Explainable risk scoring)                  │  │
│  │  • routing-engine.ts     (Department mapping)                        │  │
│  │  • storage.ts            (Frame & evidence persistence)              │  │
│  │  • audit-service.ts      (Immutable audit logging)                   │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ Mongoose ODM
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MONGODB DATABASE                                 │
│  Collections: users, departments, issues, detections, reports,              │
│               workOrders, evidence, constructionProjects, auditLogs         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router, Server Components, Route Handlers) | Unified frontend and backend in a single reactive stack |
| **Language** | TypeScript 5.7+ | End-to-end type safety across schemas, APIs, and UI |
| **Styling** | Tailwind CSS | Fast, bespoke dark-theme civic operations console design |
| **Database** | MongoDB 6+ | Flexible document model, fast spatial queries (`2dsphere`), and embedded detection arrays |
| **ODM** | Mongoose 8+ | Strict document schemas, pre/post hooks, validation, and type inference |
| **Detection Engine** | Lightweight Vision Classification & Bounding Box Pipeline | Fast sub-second frame inference for demo civic classes |
| **Validation** | Zod | Runtime payload and environment variable validation |
| **Icons** | Lucide React | Clean, intuitive operational icons |
| **Maps** | Leaflet / MapLibre with fallback | Interactive geographic visualization of detected defects |
| **Authentication** | Secure Session Cookies with Role-Based Access Control | Stateless, cryptographically signed user sessions |

---

## 3. MongoDB Database Architecture

### 3.1 Collections & Document Schemas

#### 1. `users` Collection
Stores administrative, operational, contractor, and citizen users.
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string; // unique index
  passwordHash: string;
  role: "COMMANDER" | "COORDINATOR" | "INSPECTOR" | "VERIFIER" | "OPERATOR" | "CITIZEN" | "ADMIN";
  departmentId?: ObjectId; // Ref to departments
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. `departments` Collection
Municipal departments responsible for resolving specific defect classes.
```typescript
interface IDepartment {
  _id: ObjectId;
  name: string; // e.g. "Roads & Traffic Department", "Solid Waste Management"
  code: string; // "ROADS", "SANITATION", "ELECTRICAL", "WATER_WORKS"
  contactEmail: string;
  slaHours: Record<string, number>; // SLA hours per priority level
  isActive: boolean;
}
```

#### 3. `issues` Collection (Canonical Civic Issues)
The canonical entity representing a single physical infrastructure problem.
```typescript
interface IIssue {
  _id: ObjectId;
  referenceCode: string; // Unique human-readable code e.g. "NMC-2026-0842"
  category: "POTHOLE" | "GARBAGE_ACCUMULATION" | "STREETLIGHT_FAULT" | "ROAD_OBSTRUCTION" | "DAMAGED_ASSET";
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude] for 2dsphere indexing
    addressText?: string;
    zoneName?: string;
  };
  departmentId: ObjectId; // Ref to departments
  priorityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  priorityScore: number; // 0 - 100
  priorityReasons: string[]; // Explainable factors e.g. ["Within 35m of Government Hospital", "3 duplicate reports"]
  status: "NEW" | "TRIAGED" | "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED_FOR_VERIFICATION" | "RESOLVED" | "REOPENED" | "REJECTED";
  duplicateCount: number;
  initialDetectionFrame?: string; // Image reference
  activeWorkOrderId?: ObjectId; // Ref to workOrders
  firstReportedAt: Date;
  lastUpdatedAt: Date;
  resolvedAt?: Date;
}
```
**Indexes**:
- `{ "location": "2dsphere" }` (Fast spatial radius searches)
- `{ "referenceCode": 1 }` (Unique)
- `{ "status": 1, "priorityLevel": 1, "departmentId": 1 }`

#### 4. `detections` Collection (Live Video Detections)
Maintains raw and processed detection events from live camera or video streams.
```typescript
interface IDetection {
  _id: ObjectId;
  sourceType: "LIVE_CAMERA" | "PATROL_VIDEO_FEED" | "SURVEY_STREAM";
  detectedClass: "POTHOLE" | "GARBAGE_ACCUMULATION" | "STREETLIGHT_FAULT" | "ROAD_OBSTRUCTION" | "DAMAGED_ASSET";
  confidence: number; // 0.00 - 1.00
  boundingBox: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    addressText?: string;
  };
  frameSnapshotUrl?: string; // Stored snapshot or Base64 thumbnail
  matchedIssueId?: ObjectId; // Ref to issues if linked
  matchStatus: "NEW_CANONICAL_ISSUE" | "LINKED_DUPLICATE" | "PENDING_VERIFICATION";
  matchConfidence?: number;
  detectedAt: Date;
}
```

#### 5. `workOrders` Collection
Lifecycle tracking for contractor dispatch and repair operations.
```typescript
interface IWorkOrder {
  _id: ObjectId;
  workOrderNumber: string; // e.g. "WO-2026-0391"
  issueId: ObjectId; // Ref to issues
  departmentId: ObjectId; // Ref to departments
  assignedToId?: ObjectId; // Ref to users (Inspector/Contractor)
  contractorName?: string;
  status: "CREATED" | "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED_FOR_VERIFICATION" | "VERIFIED" | "REJECTED" | "REOPENED" | "CANCELLED";
  dueAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  completionNotes?: string;
  evidenceIds: ObjectId[]; // Refs to evidence collection
  verificationNotes?: string;
  verifiedById?: ObjectId; // Ref to users (Verifier)
  verifiedAt?: Date;
  createdById: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 6. `evidence` Collection
Timestamped photographic verification data.
```typescript
interface IEvidence {
  _id: ObjectId;
  issueId?: ObjectId;
  workOrderId?: ObjectId;
  uploadedById: ObjectId;
  evidenceType: "DETECTION_SNAPSHOT" | "FIELD_REPAIR_COMPLETION" | "VERIFIER_INSPECTION";
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  capturedAt: Date;
  createdAt: Date;
}
```

#### 7. `constructionProjects` & `constructionConflicts` Collections
Planned municipal road works and detected overlap with civic issues.
```typescript
interface IConstructionProject {
  _id: ObjectId;
  name: string;
  agencyName: string; // e.g. "Nagpur Metro Rail", "Mahavitaran MSEDCL", "OCW Water"
  purpose: string;
  roadName: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  startDate: Date;
  endDate: Date;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
}

interface IConstructionConflict {
  _id: ObjectId;
  projectId: ObjectId;
  issueId?: ObjectId;
  conflictingProjectId?: ObjectId;
  conflictType: "SPATIAL_AND_TEMPORAL_OVERLAP" | "RECENTLY_SURFACED_ROAD_CUT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
  status: "ACTIVE" | "RESOLVED" | "IGNORED";
  createdAt: Date;
}
```

#### 8. `auditLogs` Collection
Immutable record of actions and overrides.
```typescript
interface IAuditLog {
  _id: ObjectId;
  actorId?: ObjectId;
  actorName: string;
  action: string; // e.g. "DETECTION_INGESTED", "ISSUE_CREATED", "PRIORITY_OVERRIDDEN", "WORK_ORDER_VERIFIED"
  entityType: "ISSUE" | "WORK_ORDER" | "DETECTION" | "CONFLICT";
  entityId: ObjectId;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
```

---

## 4. Live Video Detection & Processing Pipeline

### 4.1 Frame Ingestion & Sampling Flow

```text
┌──────────────────────────┐
│  Browser Video / Camera  │
└────────────┬─────────────┘
             │ 1. Canvas Frame Grab (every 1.5s)
             ▼
┌──────────────────────────┐
│ Base64 JPEG Frame Buffer │
└────────────┬─────────────┘
             │ 2. POST /api/detection/analyze-frame
             ▼
┌────────────────────────────────────────────────────────┐
│             Detection Engine (lib/detection)           │
│  - Multi-class vision classifier                       │
│  - Generates BoundingBox [ymin, xmin, ymax, xmax]      │
│  - Assigns confidence score (e.g. 0.89)                │
└────────────┬───────────────────────────────────────────┘
             │ 3. Check Geo-Proximity (MongoDB $near / 50m)
             ▼
    ┌─────────────────┐
    │ Existing Issue? │
    └───┬─────────┬───┘
   YES  │         │ NO
        ▼         ▼
┌──────────────┐ ┌────────────────────────────────────────┐
│ Link as      │ │ Create New Canonical Issue             │
│ Duplicate    │ │ - Calculate Explainable Priority Score │
│ (Increment   │ │ - Route to Department                  │
│ Evidence)    │ │ - Save Detection Record & Frame        │
└───────┬──────┘ └───────────────────┬────────────────────┘
        │                            │
        └──────────────┬─────────────┘
                       ▼
┌────────────────────────────────────────────────────────┐
│ Response { detection, boundingBox, canonicalIssue }    │
└──────────────────────┬─────────────────────────────────┘
                       ▼
┌────────────────────────────────────────────────────────┐
│ Front-end Visual Overlay & Event Stream Updated Live   │
└────────────────────────────────────────────────────────┘
```

### 4.2 Multi-Problem Detection Scenarios Supported in Demo
| Scene | Civic Problem | Detection Class | Routing Target |
|---|---|---|---|
| **Scene 1** | Deep asphalt pothole on Wardha Road | `POTHOLE` | Roads & Traffic Department |
| **Scene 2** | Overflowing garbage dump at Sitabuldi | `GARBAGE_ACCUMULATION` | Solid Waste Management |
| **Scene 3** | Broken/unlit streetlight on Central Avenue | `STREETLIGHT_FAULT` | Electrical Department |
| **Scene 4** | Excavated pipe debris blocking lane | `ROAD_OBSTRUCTION` | Public Works / Water Works |
| **Scene 5** | Re-visiting Scene 1 pothole location | `POTHOLE` (Duplicate) | Existing Canonical Issue (Linked) |

---

## 5. Explainable Prioritization Engine

Priority is determined dynamically using a transparent mathematical risk model:

$$\text{PriorityScore} = \text{BaseSeverity} + \text{ProximityBonus} + \text{DuplicateBonus} + \text{AgeBonus}$$

1. **Base Severity**:
   - Pothole / Road obstruction: +30 to +40 pts
   - Garbage dump / Streetlight: +20 to +25 pts
2. **Proximity to Critical Landmarks** (Nagpur reference points):
   - Within 100m of Hospital / Trauma Centre: +25 pts
   - Within 100m of School / University: +20 pts
   - Within 100m of Major Traffic Junction / Metro Station: +15 pts
3. **Duplicate / Community Support Count**:
   - +5 pts per duplicate detection (capped at +20 pts)
4. **Age of Unresolved Issue**:
   - +5 pts per 24 hours overdue

**Priority Level Mapping**:
- 0 – 35: `LOW`
- 36 – 60: `MEDIUM`
- 61 – 80: `HIGH`
- 81 – 100: `CRITICAL`

The system returns both the numeric score and human-readable explanation strings (e.g. `["Severe road crater (+40)", "Within 65m of Government Medical College (+25)", "2 duplicate detections (+10)"]`).

---

## 6. API Specifications

### 6.1 Detection Endpoints
- `POST /api/detection/analyze-frame`
  - **Payload**: `{ imageBase64: string, coordinates?: [lng, lat], addressText?: string, sourceType: string }`
  - **Returns**: `{ detected: boolean, detection: IDetection, matchedIssue?: IIssue, isNewIssue: boolean }`
- `GET /api/detections`
  - **Returns**: Recent live detection event stream.

### 6.2 Canonical Issue Endpoints
- `GET /api/issues` — Query issues with status, department, and category filters.
- `GET /api/issues/[id]` — Retrieve full issue details including linked detections and work orders.
- `PATCH /api/issues/[id]` — Coordinator updates (priority override, status change).
- `POST /api/issues/[id]/triage` — Confirm triage and dispatch work order.

### 6.3 Work Order & Verification Endpoints
- `POST /api/work-orders` — Create new work order for canonical issue.
- `GET /api/work-orders` — List work orders by role / department.
- `PATCH /api/work-orders/[id]` — Contractor progress update.
- `POST /api/work-orders/[id]/evidence` — Upload completion photo evidence.
- `POST /api/work-orders/[id]/verify` — Verifier engineer approves or reopens work order.

### 6.4 Construction Conflict Endpoints
- `GET /api/construction-projects` — List planned municipal construction projects.
- `GET /api/construction-projects/conflicts` — List spatial/temporal conflict alerts.
- `POST /api/construction-projects` — Register new planned project.

---

## 7. Frontend Dashboard Console Architecture

The main dashboard is organized as an integrated, real-time command console:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: Nagpur Civic Infrastructure Operations Console   [Role: Commander] │
├──────────────────────────────────────┬──────────────────────────────────────┤
│                                      │                                      │
│        LIVE DETECTION PANEL          │        LIVE DETECTION FEED           │
│        (Visual Centerpiece)          │        (Real-time stream)            │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ [Live Video Stream / Camera]   │  │  │ ⚡ Pothole Detected (89%)       │  │
│  │ ┌───────────────────────────┐  │  │  │    Wardha Rd • 2s ago          │  │
│  │ │ Bounding Box: POTHOLE 89% │  │  │  ├────────────────────────────────┤  │
│  │ └───────────────────────────┘  │  │  │ ⚡ Garbage Dump (94%)          │  │
│  │ [Switch Stream: Cam | Scenes]  │  │  │    Sitabuldi • 1m ago          │  │
│  └────────────────────────────────┘  │  └────────────────────────────────┘  │
│                                      │                                      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│                                      │                                      │
│         CANONICAL ISSUES &           │         MAP / SPATIAL CONFLICTS      │
│         WORK ORDER WORKFLOW          │         & OVERVIEW                   │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ • Pothole (CRITICAL) [Assign]  │  │  │ [Interactive Map of Nagpur]    │  │
│  │ • Streetlight Fault [Verify]   │  │  │ 📍 Pothole Cluster             │  │
│  │ • Debris Obstruction [Flagged] │  │  │ ⚠️ Metro Rail Overlap Conflict │  │
│  └────────────────────────────────┘  │  └────────────────────────────────┘  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 8. Hackathon Feasibility Boundaries

- **Must Have (MVP)**:
  - Live video feed with client canvas frame capture and instant bounding box overlay.
  - Multi-scene demonstration supporting Potholes, Garbage, Streetlights, Obstructions, and Duplicate Proximity.
  - Complete MongoDB schemas with Mongoose ODM and synthetic Nagpur seed data.
  - Explainable priority scoring with dynamic factor chips.
  - Full issue & work-order lifecycle: `NEW` → `ASSIGNED` → `SUBMITTED_FOR_VERIFICATION` → `VERIFIED` / `REOPENED`.
  - Operations command console.

- **Should Have**:
  - Construction road cut conflict detection visualizer.
  - Citizen grievance reporting & tracking page.

- **Explicitly Deferred (Future Scope)**:
  - Training massive deep neural networks from scratch.
  - Real-time video streaming across edge drone fleets.
  - Live integration with legacy NMC enterprise systems.
