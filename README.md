# Nagpur Civic Infrastructure Monitoring & Live Video Detection Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-12%20Passed-emerald)](https://vitest.dev/)

An enterprise-grade, real-time civic operations and infrastructure monitoring platform for Nagpur Municipal Corporation (NMC). It integrates **Live Video Stream Detection** with an automated civic grievance, explainable risk prioritization, department routing, work order dispatch, and engineering quality verification workflow.

---

## 🌟 Key Features

1. **Live Video Detection Console (Visual Centerpiece)**
   - Real-time camera or simulated patrol stream ingestion with animated canvas bounding boxes and confidence gauges.
   - **5 Multi-Problem Demonstration Scenes**:
     - *Scene 1*: Severe Pothole Crater on Wardha Road (`POTHOLE`, 89% conf, High Priority)
     - *Scene 2*: Overflowing Garbage Dump at Sitabuldi (`GARBAGE_ACCUMULATION`, 94% conf)
     - *Scene 3*: Broken Streetlight Luminaire on Central Avenue (`STREETLIGHT_FAULT`, 86% conf)
     - *Scene 4*: Uncoordinated Pipe Excavation Debris (`ROAD_OBSTRUCTION`, 92% conf, flags spatial conflict)
     - *Scene 5*: Re-surveying Wardha Road Pothole (Duplicate Proximity Detection within 12m)

2. **Explainable Risk Prioritization Engine**
   - Transparent mathematical scoring: $\text{BaseSeverity} + \text{ProximityBonus} + \text{DuplicateBonus} + \text{AgeBonus}$.
   - Evaluates proximity to key Nagpur landmarks (GMC Hospital, Sitabuldi Metro, Dharampeth School, Wardha Road Corridor).

3. **Geospatial Duplicate Consolidation**
   - Uses MongoDB `2dsphere` spatial radius queries ($near / 50m) to group repeated reports into single canonical issues.

4. **Municipal Department Routing**
   - Automatically maps defects to Roads, Solid Waste, Electrical, or Water Works departments with coordinator override capabilities.

5. **Work Order Lifecycle & Quality Verification**
   - Contractor dispatch, SLA deadline countdowns, and mobile field photo evidence upload.
   - **Engineering Verification Queue**: Side-by-side photo comparison (Initial Detection vs. Repair Photo) with *Approve & Resolve* and *Reopen with Audit Notes* workflows.

6. **Construction Conflict Engine**
   - Detects spatial and temporal overlap between utility road cuts (e.g. MahaMetro Feeder Pipe) and road repairs to avoid digging up newly paved roads.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Verify your `.env` file contains your MongoDB URI:
```env
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.pycykvl.mongodb.net/nagpur_civic?retryWrites=true&w=majority"
AUTH_SECRET="nagpur-civic-dev-super-secret-key-change-in-production-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Seed Database with Nagpur Demo Data
```bash
npm run db:seed
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo User Credentials

Password for all demo accounts: **`nagpur123`** (or use the 1-Click Role Switcher on `/login` or console navbar):

| Role | Name | Email |
|---|---|---|
| **Operations Commander** | Cmdr. Rajesh Sharma | `commander@nmc.nagpur.gov.in` |
| **Roads Coordinator** | Er. Amit Deshmukh | `coordinator.roads@nmc.nagpur.gov.in` |
| **Field Patrol / Contractor** | Sanjay Patel | `inspector.patrol@nmc.nagpur.gov.in` |
| **Chief Quality Verifier** | Er. Priya Kulkarni | `verifier.eng@nmc.nagpur.gov.in` |
| **Helpline Operator** | Kavita Rao | `operator.helpline@nmc.nagpur.gov.in` |
| **Resident Citizen** | Anand Joshi | `citizen.nagpur@gmail.com` |
| **System Administrator** | System Administrator | `admin@nmc.nagpur.gov.in` |

---

## 🧭 Page Routes

- **`/operations/dashboard`**: Central Command Console (Live Video Player, Detection Event Stream, Triage Panel, Spatial Map).
- **`/operations/triage`**: Triage Queue with Priority Overrides.
- **`/operations/work-orders`**: Contractor Work Order Dispatch & Evidence Upload.
- **`/operations/verification`**: Quality Verification Photo Review Queue.
- **`/operations/construction`**: Construction Road Cut Conflicts Manager.
- **`/login`**: Multi-role authentication with 1-Click login buttons.
- **`/report`**: Citizen Grievance Portal with instant duplicate detection.
- **`/issues/[id]`**: Public-safe grievance tracking timeline.
