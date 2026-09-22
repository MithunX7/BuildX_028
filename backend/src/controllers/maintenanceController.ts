import { Request, Response } from "express";
import { Road, IRoad } from "../models/Road";
import { MaintenanceConfig } from "../models/MaintenanceConfig";
import { Issue } from "../models/Issue";
import {
  calculateSmartPriority,
  applyBudgetSelectionAlgorithm,
  RoadWithScore,
} from "../services/maintenancePriorityService";

// ─── Demo seed data ──────────────────────────────────────────────
const DEMO_ROADS = [
  { roadName: "Main Road",        location: "Central City, Nagpur",         latitude: 21.1458, longitude: 79.0882, trafficDensity: "HIGH",   accidentHistory: "HIGH",   complaintCount: 35, economicImportance: "HIGH",   damageSeverity: "CRITICAL", estimatedRepairCost: 20 },
  { roadName: "Market Road",      location: "Sitabuldi, Nagpur",            latitude: 21.1465, longitude: 79.0825, trafficDensity: "HIGH",   accidentHistory: "MEDIUM", complaintCount: 25, economicImportance: "HIGH",   damageSeverity: "SEVERE",   estimatedRepairCost: 15 },
  { roadName: "Ring Road",        location: "Outer Ring, Nagpur",           latitude: 21.1092, longitude: 79.0754, trafficDensity: "HIGH",   accidentHistory: "HIGH",   complaintCount: 15, economicImportance: "MEDIUM", damageSeverity: "SEVERE",   estimatedRepairCost: 10 },
  { roadName: "Station Road",     location: "Railway Colony, Nagpur",       latitude: 21.1524, longitude: 79.0903, trafficDensity: "HIGH",   accidentHistory: "MEDIUM", complaintCount: 18, economicImportance: "HIGH",   damageSeverity: "MODERATE", estimatedRepairCost: 5  },
  { roadName: "Colony Road",      location: "Dharampeth, Nagpur",           latitude: 21.1418, longitude: 79.0621, trafficDensity: "LOW",    accidentHistory: "LOW",    complaintCount: 4,  economicImportance: "LOW",    damageSeverity: "MINOR",    estimatedRepairCost: 8  },
  { roadName: "Lake Road",        location: "Futala Lake Area, Nagpur",     latitude: 21.1385, longitude: 79.0701, trafficDensity: "LOW",    accidentHistory: "LOW",    complaintCount: 3,  economicImportance: "LOW",    damageSeverity: "MINOR",    estimatedRepairCost: 6  },
  { roadName: "Industrial Road",  location: "Butibori Industrial Zone",     latitude: 21.0823, longitude: 79.0461, trafficDensity: "HIGH",   accidentHistory: "HIGH",   complaintCount: 20, economicImportance: "HIGH",   damageSeverity: "SEVERE",   estimatedRepairCost: 18 },
  { roadName: "School Road",      location: "Sadar, Nagpur",                latitude: 21.1502, longitude: 79.0891, trafficDensity: "MEDIUM", accidentHistory: "MEDIUM", complaintCount: 12, economicImportance: "MEDIUM", damageSeverity: "MODERATE", estimatedRepairCost: 7  },
] as const;

// ─── Seed demo roads if DB empty ─────────────────────────────────
async function ensureSeedData(): Promise<void> {
  const count = await Road.countDocuments();
  if (count === 0) {
    const scored = DEMO_ROADS.map((r) => {
      const result = calculateSmartPriority({
        trafficDensity: r.trafficDensity as any,
        accidentHistory: r.accidentHistory as any,
        complaintCount: r.complaintCount,
        economicImportance: r.economicImportance as any,
      });
      return {
        ...r,
        priorityScore: result.priorityScore,
        priorityLevel: result.priorityLevel,
        maintenanceDecision: "PENDING" as const,
      };
    });
    await Road.insertMany(scored);
  }
}

async function ensureDefaultConfig(): Promise<void> {
  const count = await MaintenanceConfig.countDocuments();
  if (count === 0) {
    await MaintenanceConfig.create({
      originalBudget: 100,
      reductionPercentage: 40,
      availableBudget: 60,
      usedBudget: 0,
      remainingBudget: 60,
    });
  }
}

// ─── GET /api/maintenance/dashboard ──────────────────────────────
export const getMaintenanceDashboard = async (req: Request, res: Response) => {
  try {
    await ensureSeedData();
    await ensureDefaultConfig();

    const [roads, config] = await Promise.all([
      Road.find().sort({ priorityScore: -1 }),
      MaintenanceConfig.findOne().sort({ updatedAt: -1 }),
    ]);

    // Pull complaint counts from actual Issue records to live-sync
    const activeIssues = await Issue.find({ status: { $nin: ["RESOLVED", "REJECTED"] } });
    // Group by location zone as proxy for road complaints
    const locationComplaintMap: Record<string, number> = {};
    for (const issue of activeIssues) {
      const zone = issue.location?.zoneName || issue.location?.addressText || "Unknown";
      locationComplaintMap[zone] = (locationComplaintMap[zone] || 0) + 1;
    }

    const prioritySummary = {
      critical: roads.filter((r) => r.priorityLevel === "CRITICAL").length,
      high:     roads.filter((r) => r.priorityLevel === "HIGH").length,
      medium:   roads.filter((r) => r.priorityLevel === "MEDIUM").length,
      low:      roads.filter((r) => r.priorityLevel === "LOW").length,
      recommended: roads.filter((r) => r.maintenanceDecision === "RECOMMENDED").length,
      deferred:    roads.filter((r) => r.maintenanceDecision === "DEFERRED").length,
    };

    res.json({
      success: true,
      data: {
        budget: config,
        prioritySummary,
        roads,
        liveComplaintCount: activeIssues.length,
      },
    });
  } catch (err: any) {
    console.error("[Maintenance] Dashboard error:", err);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// ─── POST /api/maintenance/calculate ─────────────────────────────
export const calculateMaintenancePlan = async (req: Request, res: Response) => {
  try {
    await ensureSeedData();
    await ensureDefaultConfig();

    const config = await MaintenanceConfig.findOne().sort({ updatedAt: -1 });
    if (!config) throw new Error("No maintenance config found");

    // Get all active roads
    const roads = await Road.find({ status: { $ne: "REPAIRED" } });

    // Sync complaint counts from live Issue model
    const activeIssues = await Issue.find({ status: { $nin: ["RESOLVED", "REJECTED"] } });

    // Recalculate priority scores for each road
    const scoredRoads: RoadWithScore[] = roads.map((road) => {
      // Add real complaint data as bonus
      const liveComplaintBonus = Math.min(
        activeIssues.filter(
          (i) =>
            i.location?.addressText?.toLowerCase().includes(road.roadName.toLowerCase().split(" ")[0]) ||
            i.location?.zoneName?.toLowerCase().includes(road.location.toLowerCase().split(",")[0].toLowerCase())
        ).length,
        10
      );
      const effectiveComplaintCount = Math.min(road.complaintCount + liveComplaintBonus, 40);

      const result = calculateSmartPriority({
        trafficDensity: road.trafficDensity,
        accidentHistory: road.accidentHistory,
        complaintCount: effectiveComplaintCount,
        economicImportance: road.economicImportance,
      });

      return {
        ...road.toObject(),
        complaintCount: effectiveComplaintCount,
        priorityScore: result.priorityScore,
        priorityLevel: result.priorityLevel,
      } as RoadWithScore;
    });

    // Apply budget selection algorithm
    const { roads: decided, usedBudget, availableBudget, remainingBudget } =
      applyBudgetSelectionAlgorithm(scoredRoads, config.originalBudget, config.reductionPercentage);

    // Persist decisions to DB
    await Promise.all(
      decided.map((r) =>
        Road.findByIdAndUpdate(r._id, {
          priorityScore: r.priorityScore,
          priorityLevel: r.priorityLevel,
          complaintCount: r.complaintCount,
          maintenanceDecision: r.maintenanceDecision,
          decisionReason: r.decisionReason,
        })
      )
    );

    // Update config with used/remaining budget
    await MaintenanceConfig.findByIdAndUpdate(config._id, {
      availableBudget,
      usedBudget,
      remainingBudget,
      lastCalculatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        message: "Maintenance plan updated successfully.",
        roads: decided,
        budget: { originalBudget: config.originalBudget, availableBudget, usedBudget, remainingBudget },
      },
    });
  } catch (err: any) {
    console.error("[Maintenance] Calculate error:", err);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// ─── PUT /api/maintenance/budget ─────────────────────────────────
export const updateMaintenanceBudget = async (req: Request, res: Response) => {
  try {
    const { originalBudget, reductionPercentage } = req.body;
    if (!originalBudget || originalBudget <= 0) {
      return res.status(400).json({ success: false, error: { message: "Invalid originalBudget" } });
    }
    const reduction = reductionPercentage ?? 40;
    const availableBudget = originalBudget * (1 - reduction / 100);

    let config = await MaintenanceConfig.findOne().sort({ updatedAt: -1 });
    if (config) {
      config.originalBudget = originalBudget;
      config.reductionPercentage = reduction;
      config.availableBudget = availableBudget;
      config.usedBudget = 0;
      config.remainingBudget = availableBudget;
      await config.save();
    } else {
      config = await MaintenanceConfig.create({ originalBudget, reductionPercentage: reduction, availableBudget, usedBudget: 0, remainingBudget: availableBudget });
    }

    res.json({ success: true, data: { config, message: "Budget updated. Run Recalculate to apply." } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// ─── GET /api/maintenance/roads ──────────────────────────────────
export const getAllRoads = async (req: Request, res: Response) => {
  try {
    await ensureSeedData();
    const roads = await Road.find().sort({ priorityScore: -1 });
    res.json({ success: true, data: { roads } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// ─── GET /api/maintenance/roads/:id ──────────────────────────────
export const getRoadDetail = async (req: Request, res: Response) => {
  try {
    const road = await Road.findById(req.params.id);
    if (!road) return res.status(404).json({ success: false, error: { message: "Road not found" } });

    const result = calculateSmartPriority({
      trafficDensity: road.trafficDensity,
      accidentHistory: road.accidentHistory,
      complaintCount: road.complaintCount,
      economicImportance: road.economicImportance,
    });

    res.json({ success: true, data: { road, scoreBreakdown: result } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// ─── PATCH /api/maintenance/roads/:id ────────────────────────────
export const updateRoad = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    // Recalculate score after update
    const road = await Road.findById(req.params.id);
    if (!road) return res.status(404).json({ success: false, error: { message: "Road not found" } });

    Object.assign(road, updates);
    const result = calculateSmartPriority({
      trafficDensity: road.trafficDensity,
      accidentHistory: road.accidentHistory,
      complaintCount: road.complaintCount,
      economicImportance: road.economicImportance,
    });
    road.priorityScore = result.priorityScore;
    road.priorityLevel = result.priorityLevel;
    road.maintenanceDecision = "PENDING";
    await road.save();

    res.json({ success: true, data: { road, message: "Road updated. Re-run Recalculate to update plan." } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
