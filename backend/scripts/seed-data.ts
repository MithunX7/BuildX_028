import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Department } from "../src/models/Department";
import { User } from "../src/models/User";
import { Issue } from "../src/models/Issue";
import { ConstructionProject } from "../src/models/ConstructionProject";
import { ConstructionConflict } from "../src/models/ConstructionConflict";
import { WorkOrder } from "../src/models/WorkOrder";
import { AuditLog } from "../src/models/AuditLog";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/nagpur_civic";

async function seed() {
  console.log("🌱 Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log("🧹 Cleaning existing collections...");
  await Department.deleteMany({});
  await User.deleteMany({});
  await Issue.deleteMany({});
  await ConstructionProject.deleteMany({});
  await ConstructionConflict.deleteMany({});
  await WorkOrder.deleteMany({});
  await AuditLog.deleteMany({});

  console.log("🏛️ Creating Municipal Departments...");
  const roadsDept = await Department.create({
    name: "Roads & Traffic Department",
    code: "ROADS",
    contactEmail: "roads.engineering@nmc.nagpur.gov.in",
    slaHours: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 12 },
    isActive: true,
  });

  const sanitationDept = await Department.create({
    name: "Solid Waste Management Department",
    code: "SANITATION",
    contactEmail: "sanitation@nmc.nagpur.gov.in",
    slaHours: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 6 },
    isActive: true,
  });

  const electricalDept = await Department.create({
    name: "Electrical & Public Lighting Department",
    code: "ELECTRICAL",
    contactEmail: "electrical@nmc.nagpur.gov.in",
    slaHours: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 12 },
    isActive: true,
  });

  const waterDept = await Department.create({
    name: "Water Works & Drainage Department",
    code: "WATER_WORKS",
    contactEmail: "waterworks@nmc.nagpur.gov.in",
    slaHours: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 6 },
    isActive: true,
  });

  console.log("👥 Creating Demo Users for All 7 Roles...");
  const passwordHash = await bcrypt.hash("nagpur123", 10);

  const commander = await User.create({
    name: "Cmdr. Rajesh Sharma",
    email: "commander@nmc.nagpur.gov.in",
    passwordHash,
    role: "COMMANDER",
    phone: "+91-98230-11001",
    isActive: true,
  });

  const coordinator = await User.create({
    name: "Er. Amit Deshmukh",
    email: "coordinator.roads@nmc.nagpur.gov.in",
    passwordHash,
    role: "COORDINATOR",
    departmentId: roadsDept._id,
    phone: "+91-98230-11002",
    isActive: true,
  });

  const inspector = await User.create({
    name: "Sanjay Patel (Field Patrol)",
    email: "inspector.patrol@nmc.nagpur.gov.in",
    passwordHash,
    role: "INSPECTOR",
    departmentId: roadsDept._id,
    phone: "+91-98230-11003",
    isActive: true,
  });

  const verifier = await User.create({
    name: "Er. Priya Kulkarni (Chief Quality Verifier)",
    email: "verifier.eng@nmc.nagpur.gov.in",
    passwordHash,
    role: "VERIFIER",
    departmentId: roadsDept._id,
    phone: "+91-98230-11004",
    isActive: true,
  });

  const operator = await User.create({
    name: "Kavita Rao (Helpline Operator)",
    email: "operator.helpline@nmc.nagpur.gov.in",
    passwordHash,
    role: "OPERATOR",
    phone: "+91-98230-11005",
    isActive: true,
  });

  const citizen = await User.create({
    name: "Anand Joshi (Citizen)",
    email: "citizen.nagpur@gmail.com",
    passwordHash,
    role: "CITIZEN",
    phone: "+91-98230-11006",
    isActive: true,
  });

  const admin = await User.create({
    name: "System Administrator",
    email: "admin@nmc.nagpur.gov.in",
    passwordHash,
    role: "ADMIN",
    phone: "+91-98230-11000",
    isActive: true,
  });

  console.log("🚧 Creating Planned Construction Projects...");
  const metroPipeProject = await ConstructionProject.create({
    name: "Nagpur Metro Feeder Pipeline Replacement",
    agencyName: "Nagpur Metro Rail Corporation (MahaMetro)",
    purpose: "Excavation and installation of 600mm underground municipal water feeder line.",
    roadName: "West High Court Road, Dharampeth",
    location: {
      type: "Point",
      coordinates: [79.0621, 21.1418],
    },
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: "IN_PROGRESS",
    restorationPlan: "Complete road milling and bituminous macadam resurfacing upon pipe testing.",
  });

  const wardhaResurfacing = await ConstructionProject.create({
    name: "Wardha Road Smart Corridor Asphalting",
    agencyName: "Public Works Department (PWD)",
    purpose: "Full surface micro-surfacing and bituminous overlay.",
    roadName: "Wardha Road, Sai Mandir Stretch",
    location: {
      type: "Point",
      coordinates: [79.0754, 21.1092],
    },
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    status: "PLANNED",
    restorationPlan: "Direct wearing course laying.",
  });

  console.log("📍 Creating Sample Canonical Issues in Nagpur...");
  const samplePothole = await Issue.create({
    referenceCode: "NMC-2026-0101",
    category: "POTHOLE",
    title: "Deep Asphalt Pothole near Sai Mandir",
    description: "60cm diameter crater in middle lane causing severe two-wheeler deceleration.",
    location: {
      type: "Point",
      coordinates: [79.0754, 21.1092],
      addressText: "Wardha Road, Near Sai Mandir Metro Pillar 142",
      zoneName: "Laxmi Nagar Zone",
    },
    departmentId: roadsDept._id,
    priorityLevel: "HIGH",
    priorityScore: 75,
    priorityReasons: [
      "Severe road asphalt crater (+40)",
      "Proximity bonus: within 350m of Wardha Road High-Speed Corridor (+25)",
      "Community impact: 2 duplicate detection(s) linked (+10)",
    ],
    status: "ASSIGNED",
    duplicateCount: 2,
    firstReportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastUpdatedAt: new Date(),
  });

  const sampleGarbage = await Issue.create({
    referenceCode: "NMC-2026-0102",
    category: "GARBAGE_ACCUMULATION",
    title: "Overflowing Bio-Waste Dump at Sitabuldi Market",
    description: "Debris and commercial garbage overflowing onto pedestrian walkway.",
    location: {
      type: "Point",
      coordinates: [79.0825, 21.1465],
      addressText: "Sitabuldi Main Road, Opp Metro Station Gate 2",
      zoneName: "Dharampeth Zone",
    },
    departmentId: sanitationDept._id,
    priorityLevel: "HIGH",
    priorityScore: 70,
    priorityReasons: [
      "Public health bio-waste accumulation (+30)",
      "Proximity bonus: within 50m of Sitabuldi Metro Interchange (+20)",
      "Community impact: 4 duplicate reports (+20)",
    ],
    status: "NEW",
    duplicateCount: 4,
    firstReportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lastUpdatedAt: new Date(),
  });

  const sampleObstruction = await Issue.create({
    referenceCode: "NMC-2026-0103",
    category: "ROAD_OBSTRUCTION",
    title: "Unmarked Pipe Excavation Mound blocking West High Court Rd",
    description: "Debris mound without safety reflectors adjacent to metro utility cut.",
    location: {
      type: "Point",
      coordinates: [79.0621, 21.1418],
      addressText: "West High Court Road, Dharampeth Junction",
      zoneName: "Dharampeth Zone",
    },
    departmentId: waterDept._id,
    priorityLevel: "CRITICAL",
    priorityScore: 85,
    priorityReasons: [
      "Traffic carriageway obstruction (+35)",
      "Proximity bonus: within 120m of Dharampeth Premier High School (+20)",
      "Spatial conflict detected with MahaMetro utility cut (+30)",
    ],
    status: "TRIAGED",
    duplicateCount: 1,
    firstReportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lastUpdatedAt: new Date(),
  });

  console.log("⚠️ Creating Construction Spatial Conflict Record...");
  await ConstructionConflict.create({
    projectId: metroPipeProject._id,
    issueId: sampleObstruction._id,
    conflictType: "SPATIAL_AND_TEMPORAL_OVERLAP",
    severity: "CRITICAL",
    explanation: "Active water pipe excavation overlaps with emergency obstruction grievance at Dharampeth Junction. Coordinated traffic diversion required.",
    status: "ACTIVE",
  });

  console.log("🛠️ Creating Initial Work Order...");
  const workOrder = await WorkOrder.create({
    workOrderNumber: "WO-2026-0042",
    issueId: samplePothole._id,
    departmentId: roadsDept._id,
    assignedToId: inspector._id,
    contractorName: "Nagpur Roadworks Infra Pvt Ltd",
    status: "IN_PROGRESS",
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    startedAt: new Date(),
    completionNotes: "Cold-mix asphalt patch scheduled for afternoon shift.",
    createdById: coordinator._id,
  });

  // Link work order to issue
  samplePothole.activeWorkOrderId = workOrder._id;
  await samplePothole.save();

  console.log("📜 Logging Initial Audit Trail...");
  await AuditLog.create({
    actorId: commander._id,
    actorName: "Cmdr. Rajesh Sharma",
    action: "SYSTEM_INITIALIZED",
    entityType: "USER",
    entityId: admin._id,
    metadata: { note: "Nagpur Civic Infrastructure Platform Initialized" },
    timestamp: new Date(),
  });

  console.log("✅ Database seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Demo Credentials (Password for all: nagpur123):");
  console.log("• Commander:   commander@nmc.nagpur.gov.in");
  console.log("• Coordinator: coordinator.roads@nmc.nagpur.gov.in");
  console.log("• Inspector:   inspector.patrol@nmc.nagpur.gov.in");
  console.log("• Verifier:    verifier.eng@nmc.nagpur.gov.in");
  console.log("• Operator:    operator.helpline@nmc.nagpur.gov.in");
  console.log("• Citizen:     citizen.nagpur@gmail.com");
  console.log("• Admin:       admin@nmc.nagpur.gov.in");
  console.log("--------------------------------------------------");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
