# Nagpur Civic Platform — Evaluator Demo Script

Follow this step-by-step walkthrough during product demonstrations or hackathon judging.

---

### Step 1: Launch & Initial Command Console
1. Open the browser at `http://localhost:3000/operations/dashboard`.
2. Observe the **Live Video Detection Centerpiece**:
   - The top video player continuously ingests patrol frames with glowing canvas bounding boxes, confidence tags, and coordinates HUD.
   - The **Real-Time Detection Feed** on the right appends detected events with timestamps and confidence pills.

---

### Step 2: Multi-Problem Live Demonstration (5 Scenes)
1. **Scene 1 (Pothole)**: Click the **Scene 1: Pothole** tab.
   - Observe bounding box `POTHOLE • 89%`.
   - Notice the **Quick Triage Panel** loads `NMC-2026-0101` with **HIGH Priority (75 Pts)** and explainable risk factor: `Within 350m of Wardha Road High-Speed Corridor (+25)`.
2. **Scene 2 (Garbage)**: Click **Scene 2: Overflowing Waste Dump**.
   - Observe category switches to `GARBAGE_ACCUMULATION • 94%`.
   - Notice department routing automatically directs ticket to **Solid Waste Management**.
3. **Scene 3 (Streetlight)**: Click **Scene 3: Broken Luminaire**.
   - Observe category switches to `STREETLIGHT_FAULT • 86%` routed to **Electrical Department**.
4. **Scene 4 (Obstruction)**: Click **Scene 4: Excavation Pipe Debris**.
   - Observe `ROAD_OBSTRUCTION • 92%` with **CRITICAL Priority (85 Pts)**.
   - Notice the **Operations Map** highlights the active **MahaMetro Utility Cut Conflict Zone**.
5. **Scene 5 (Duplicate Proximity Detection)**: Click **Scene 5: Re-surveying Wardha Road**.
   - Observe the system recognizes proximity (12m) to Scene 1.
   - The status badge shows `MATCHED TO EXISTING ISSUE (NMC-2026-0101)`.
   - Duplicate count increments without creating a redundant ticket.

---

### Step 3: Triage & Work Order Dispatch
1. In the **Quick Triage Panel**, click **Dispatch Work Order**.
2. Select Contractor name (`Nagpur Smart Roads Infra Team`), set SLA to `24 Hours`, and click **Confirm & Dispatch**.
3. Observe the issue status changes to `ASSIGNED`.

---

### Step 4: Field Contractor Repair & Evidence Upload
1. Navigate to **Work Orders** (`/operations/work-orders`).
2. Locate the assigned work order (`WO-2026-0042`).
3. Click **Upload Repair Photo**, enter field completion notes, and click **Submit for Engineering Verification**.
4. Observe the status transitions to `SUBMITTED_FOR_VERIFICATION`.

---

### Step 5: Engineering Quality Verification & Reopen Workflow
1. Navigate to **Verification** (`/operations/verification`).
2. Inspect the **Side-by-Side Photo Comparison** (Initial AI Detection Frame vs. Contractor Repair Photo).
3. Test **Reopen Work Order** (requires mandatory engineer audit notes) OR click **Approve & Resolve Issue**.
4. Notice the canonical issue status updates to `RESOLVED` and generates an immutable audit record in MongoDB.

---

### Step 6: Citizen Grievance Reporting & Public Tracking
1. Open `/report` in a new tab.
2. Submit a pothole complaint at `Wardha Road`.
3. Notice the system instantly informs the citizen: *“Consolidated with Existing Issue NMC-2026-0101”*.
4. Click **View Public Tracking** (`/issues/[id]`) to see the transparent 5-step lifecycle progress bar and citizen satisfaction star rating!
