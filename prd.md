# Product Requirements Document (PRD)
## Nagpur Civic Infrastructure Monitoring & Live Video Detection Platform

**Version:** 2.0  
**Date:** 22 September 2026  
**Status:** MVP Technical Redesign  
**Product type:** Full-Stack Civic Infrastructure Monitoring, Live Video Detection, and Grievance-Resolution Platform

---

## 1. Product summary

The Nagpur Civic Infrastructure Platform is a real-time civic operations and infrastructure monitoring system for Nagpur. It combines **live video/camera stream detection** with an automated civic grievance and maintenance workflow.

Urban infrastructure defects (potholes, garbage accumulation, streetlight outages, road obstructions, damaged public assets) are often detected either through mobile camera/patrol feeds or reported through multi-channel citizen intake (app, helpline, WhatsApp, social media). 

The platform provides a unified operations console that:
1. Ingests live video / mobile patrol camera feeds and recorded street survey video.
2. Detects, labels, and localizes specific supported civic infrastructure problems with visual bounding boxes and confidence metrics.
3. Automatically evaluates detected events against existing nearby canonical issues to prevent duplicate ticket generation.
4. Generates or links canonical issues, applies explainable risk-based prioritization (e.g. proximity to schools, hospitals, intersections), and automatically routes issues to the responsible municipal department.
5. Manages work orders, tracks contractor field evidence, and enforces human-in-the-loop verification before issue resolution.

---

## 2. Problem statement

Municipal authorities and citizens in Nagpur face two critical bottlenecks:
1. **Inefficient Issue Discovery & Manual Reporting**: Traditional complaint systems rely entirely on citizens noticing and submitting defects. Patrol vehicles and surveillance feeds are underutilized because manual inspection is slow and labor-intensive.
2. **Fragmented & Unverified Issue Resolution**: The same physical pothole or garbage dump reported across multiple channels creates duplicate work orders, while high-risk defects near critical zones are under-prioritized. Completed work is often closed without verifiable, audit-proof evidence.

---

## 3. Supported Detection Scope & Classes

To maintain realistic feasibility for an MVP, detection classes are clearly categorized:

### 3.1 Demo Supported Detection Classes (MVP Active)
1. **Pothole / Road Surface Damage**: Visible road depressions, asphalt fractures, and craters.
2. **Garbage & Waste Accumulation**: Unattended roadside waste heaps and overflowed bins.
3. **Damaged / Non-Functional Streetlight**: Physical damage to light poles or unlit fixtures during nighttime patrol.
4. **Road & Construction Obstruction**: Uncoordinated road cuts, barricades, debris, and excavation blocking traffic lanes.
5. **Damaged Public Assets / Infrastructure**: Damaged road dividers, broken manhole covers, and compromised guard rails.

### 3.2 Detection Metadata per Detection Event
Every video detection event captures and records:
- `detectedClass`: Identified civic category.
- `confidence`: Confidence score (0.00 – 1.00).
- `boundingBox`: Normalized coordinates `[ymin, xmin, ymax, xmax]` for UI visual overlay.
- `timestamp`: Video frame capture time.
- `location`: Coordinates (latitude, longitude) and nearby landmark if available.
- `frameEvidence`: Base64 / stored frame snapshot showing the bounding box overlay.
- `matchStatus`: Classification as `NEW_ISSUE`, `LINKED_DUPLICATE`, or `PENDING_REVIEW`.

### 3.3 Future Detection Classes (Requires Dataset & Model Verification)
- Underground water pipe leakage (acoustic / thermal).
- Structural bridge micro-fractures.
- Encroachment / illegal hawking detection.
- Traffic signal timing defects.

---

## 4. Product goals

1. **Live Video Detection**: Provide a live video operations feed capable of detecting supported civic problems at controlled sampling intervals with real-time bounding boxes and labels.
2. **Multi-Problem Demonstration**: Visually demonstrate multiple distinct civic infrastructure problems (pothole, garbage, streetlight, obstruction, duplicate) within one live demonstration workflow.
3. **Intelligent Duplicate Consolidation**: Prevent duplicate ticket creation by matching new video detections and citizen reports against active nearby issues.
4. **Explainable Risk Prioritization**: Compute transparent priority scores based on severity, proximity to critical landmarks (schools, hospitals, transit hubs), and report volume.
5. **Automated Department Routing**: Route issues to designated municipal departments (Roads, Sanitation, Electrical, Water Works) with manual coordinator override capability.
6. **Verifiable Work Order Lifecycle**: Enforce field photo evidence upload and human verifier approval before closing work orders.
7. **Spatial Construction Conflict Visibility**: Detect temporal and spatial overlap between planned municipal construction projects and active road repairs.
8. **Immutable Audit Trail**: Log all critical transitions, merges, overrides, and approvals.

---

## 5. Non-goals

- **Not replacing official NMC enterprise ERP or SCADA systems** without authorization.
- **No autonomous actuation or control** of streetlights, traffic systems, or physical equipment.
- **No automated contractor approval or payment dispatch** without human engineering sign-off.
- **No claims of 100% universal computer vision coverage** for unsupported defect types.
- **No training of massive custom neural networks from scratch** during the MVP phase.

---

## 6. Target users and roles

| Role | Operational Scope | Access Privileges |
|---|---|---|
| **Operations Commander / Coordinator** | Central control room monitoring live video feeds, triage queues, priority overrides, and work order dispatching. | Full operations console, live detector, triage, work orders, conflict manager. |
| **Field Inspector / Contractor** | Receives assigned work orders, updates status in the field, uploads completion photo evidence. | Assigned work orders, evidence submission portal. |
| **Verification Engineer** | Reviews completed repairs against submitted photo evidence; approves, requests more data, or reopens work orders. | Verification queue, quality approval controls. |
| **Call-Centre / Intake Operator** | Logs citizen grievances received via helpline, letters, or WhatsApp; reviews duplicate suggestions. | Report intake console, duplicate candidate reviewer. |
| **Citizen** | Submits localized grievances, tracks progress by reference ID, and confirms resolution satisfaction. | Public report portal, status tracker, feedback. |
| **System Administrator** | Manages system users, departments, zones, SLA parameters, and detection confidence thresholds. | System configuration, user management, audit logs. |

---

## 7. Primary user journeys

### 7.1 Live Video Detection & Operations Workflow (Centerpiece)
1. Operations coordinator starts or connects the live video stream (webcam, patrol video file, or simulation stream).
2. The detection pipeline samples video frames at a controlled interval (e.g. 1-2s) and runs object inference.
3. When a civic defect is detected (e.g. Pothole with 88% confidence):
   - A visual bounding box and label overlay appear on the live video player.
   - A new detection event card appears in the **Live Detection Events** panel.
   - The system checks for open issues within 50m of the coordinates.
   - If an existing issue is found, it links the detection as supporting evidence (incrementing duplicate count & boosting priority).
   - If no issue exists, a new canonical issue is created and automatically routed to the Roads Department with an explainable priority score.
4. Coordinator can view the issue, verify the detected frame snapshot, and dispatch a work order directly from the console.

### 7.2 Multi-Problem Live Demonstration Scenarios
- **Scene 1 (Road Damage)**: Live feed detects a severe pothole → System creates canonical issue `ISSUE-ROAD-XXXX`, prioritizes HIGH due to proximity to Sitabuldi junction, routes to Roads Department.
- **Scene 2 (Garbage Accumulation)**: Live feed detects roadside waste pile → System creates issue `ISSUE-SANI-XXXX`, routes to Solid Waste Management.
- **Scene 3 (Streetlight Fault)**: Feed detects unlit/damaged pole → System creates issue `ISSUE-ELEC-XXXX`, routes to Electrical Department.
- **Scene 4 (Construction Obstruction)**: Feed detects road obstruction debris → System flags potential spatial conflict with upcoming Metro water pipe project.
- **Scene 5 (Duplicate Proximity Detection)**: Feed passes the same pothole location again → System flags 94% similarity / 12m proximity, links detection to existing `ISSUE-ROAD-XXXX`, increments evidence count without creating redundant tickets.

### 7.3 Work Order & Evidence Verification Journey
1. Assigned contractor receives work order, performs repair on site, and uploads a timestamped completion photo.
2. The work order transitions to `SUBMITTED_FOR_VERIFICATION`.
3. Verification engineer inspects the completion photo against the original detection frame snapshot.
4. If the repair is inadequate, the engineer clicks **Reopen Work Order** with mandatory feedback notes.
5. If genuine, the engineer clicks **Approve Resolution**, which updates the canonical issue to `RESOLVED` and generates an audit log entry.

---

## 8. Functional requirements

- **FR-1 Live Video Ingestion & Frame Sampling**: Provide an interactive video player with live camera feed, sample street survey video selector, and adjustable frame sampling rate.
- **FR-2 Real-Time Detection Overlay**: Render canvas bounding boxes, defect category labels, confidence percentages, and timestamps directly on the video player.
- **FR-3 Duplicate & Candidate Matching**: Geospatial ($near / Haversine) and category matching against open canonical issues within configurable radius.
- **FR-4 Explainable Prioritization**: Compute composite priority scores (`priorityScore`, `priorityLevel`, `priorityReasons`) based on severity, sensitive zone proximity, duplicate support count, and age.
- **FR-5 Intelligent Department Routing**: Map defect categories to responsible municipal departments with coordinator override capabilities.
- **FR-6 Work Order Lifecycle Management**: State machine supporting `CREATED`, `ASSIGNED`, `IN_PROGRESS`, `SUBMITTED_FOR_VERIFICATION`, `VERIFIED`, `REJECTED`, `REOPENED`, `CANCELLED`.
- **FR-7 Evidence & Verification**: Store detection frame snapshots and field repair photographs with metadata (coordinates, timestamp, uploader).
- **FR-8 Construction Conflict Detection**: Identify spatial and temporal overlap between registered construction road cuts and active issues.
- **FR-9 Multi-Role Authentication & Authorization**: Secure session-based authentication with role-based access control (RBAC).
- **FR-10 Immutable Audit Logging**: Record actor, action, timestamp, entity ID, and metadata for every critical workflow event.

---

## 9. Database requirements (MongoDB)

Replace PostgreSQL/Prisma with **MongoDB** via Mongoose ODM.
Key collections:
1. `users` — Authentication, role, department, active status.
2. `departments` — Municipal department records and routing rules.
3. `issues` — Canonical civic issues with geospatial coordinates (`2dsphere`), priority factors, status, and linked detection count.
4. `detections` — Raw and processed video detection events with bounding boxes, confidence, frame snapshots, and issue references.
5. `reports` — Citizen / operator manual intake reports.
6. `workOrders` — Work order assignments, SLA deadlines, progress, and verification status.
7. `evidence` — Uploaded photo evidence with metadata.
8. `constructionProjects` — Planned public works with date ranges and coordinates.
9. `constructionConflicts` — Detected spatial/temporal overlap records.
10. `auditLogs` — System-wide immutable action audit log.
11. `feedback` — Citizen resolution feedback and ratings.

---

## 10. MVP scope

### Must have (MVP Core)
- Live video detection panel with camera & sample video feed input.
- Bounding box overlay and real-time detection event stream.
- Multi-problem demo scenario support (potholes, garbage, streetlights, obstructions, duplicates).
- MongoDB database schema with 2dsphere indexing and Mongoose ODM.
- Explainable priority scoring engine with human-readable factors.
- Automated department routing with manual override.
- Full work order lifecycle and evidence verification / reopen workflow.
- Operations dashboard bringing video, detection feed, triage queue, and maps together.
- Role-based authentication (Commander, Coordinator, Contractor, Verifier, Operator, Citizen).
- Seeded realistic Nagpur municipal demo data.

### Should have
- Construction project conflict detection engine.
- Public citizen report intake & tracking portal.
- Citizen post-resolution feedback rating.
- Interactive map showing detected issue locations and heatmaps.

### Future
- Edge-device onboard model execution (NVIDIA Jetson / Raspberry Pi).
- Acoustic pipe leak detection and drone survey integration.
- Official NMC citizen app and CRM bi-directional sync.

---

## 11. Success criteria

Evaluators can verify that:
1. Live video feed runs smoothly with real-time detection bounding boxes and confidence scores.
2. Multiple distinct civic problems (pothole, waste, streetlight, obstruction) are detected and correctly categorized.
3. A repeated defect is recognized as a duplicate candidate and linked to an existing canonical issue.
4. An issue is prioritized using explainable criteria (e.g. near hospital / school).
5. A work order is created, assigned, submitted with repair evidence, and verified/reopened by an engineer.
6. The entire data lifecycle is persisted in MongoDB with an immutable audit log.
