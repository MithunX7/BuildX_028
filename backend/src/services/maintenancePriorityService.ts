/**
 * Smart Maintenance Priority Service
 * ────────────────────────────────────
 * Transparent rule-based scoring for road maintenance prioritisation.
 * Max score = 110.
 */

export type TrafficDensity = "LOW" | "MEDIUM" | "HIGH";
export type AccidentHistory = "LOW" | "MEDIUM" | "HIGH";
export type EconomicImportance = "LOW" | "MEDIUM" | "HIGH";

export interface SmartPriorityInput {
  trafficDensity: TrafficDensity;
  accidentHistory: AccidentHistory;
  complaintCount: number;
  economicImportance: EconomicImportance;
}

export interface SmartPriorityResult {
  priorityScore: number;        // 0–110
  priorityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  trafficScore: number;
  accidentScore: number;
  complaintScore: number;
  economicScore: number;
  reasons: string[];
}

// ─── Scoring Tables ─────────────────────────────────────────────

function trafficScore(density: TrafficDensity): number {
  switch (density) {
    case "HIGH":   return 30;
    case "MEDIUM": return 20;
    case "LOW":    return 10;
  }
}

function accidentScore(history: AccidentHistory): number {
  switch (history) {
    case "HIGH":   return 30;
    case "MEDIUM": return 20;
    case "LOW":    return 10;
  }
}

function complaintScore(count: number): number {
  if (count >= 31) return 25;
  if (count >= 16) return 20;
  if (count >= 6)  return 10;
  return 5;
}

function economicScore(importance: EconomicImportance): number {
  switch (importance) {
    case "HIGH":   return 25;
    case "MEDIUM": return 20;
    case "LOW":    return 10;
  }
}

function priorityLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// ─── Main Calculation ────────────────────────────────────────────

export function calculateSmartPriority(input: SmartPriorityInput): SmartPriorityResult {
  const ts = trafficScore(input.trafficDensity);
  const as = accidentScore(input.accidentHistory);
  const cs = complaintScore(input.complaintCount);
  const es = economicScore(input.economicImportance);

  const total = ts + as + cs + es; // max = 30+30+25+25 = 110

  const reasons: string[] = [];

  if (input.trafficDensity === "HIGH")        reasons.push("✓ High traffic volume");
  else if (input.trafficDensity === "MEDIUM") reasons.push("○ Medium traffic volume");
  else                                        reasons.push("○ Low traffic volume");

  if (input.accidentHistory === "HIGH")        reasons.push("✓ High accident history");
  else if (input.accidentHistory === "MEDIUM") reasons.push("○ Medium accident history");
  else                                         reasons.push("○ Low accident history");

  if (input.complaintCount >= 31)       reasons.push(`✓ ${input.complaintCount} public complaints (31+)`);
  else if (input.complaintCount >= 16)  reasons.push(`○ ${input.complaintCount} public complaints (16–30)`);
  else if (input.complaintCount >= 6)   reasons.push(`○ ${input.complaintCount} public complaints (6–15)`);
  else                                  reasons.push(`○ ${input.complaintCount} public complaints (0–5)`);

  if (input.economicImportance === "HIGH")        reasons.push("✓ High economic importance");
  else if (input.economicImportance === "MEDIUM") reasons.push("○ Medium economic importance");
  else                                            reasons.push("○ Low economic importance");

  return {
    priorityScore: total,
    priorityLevel: priorityLevel(total),
    trafficScore: ts,
    accidentScore: as,
    complaintScore: cs,
    economicScore: es,
    reasons,
  };
}

// ─── Budget Selection Algorithm ──────────────────────────────────

export interface RoadWithScore {
  _id: any;
  roadName: string;
  location: string;
  estimatedRepairCost: number; // Lakhs
  priorityScore: number;
  priorityLevel: string;
  maintenanceDecision: "RECOMMENDED" | "DEFERRED" | "PENDING";
  decisionReason?: string;
  [key: string]: any;
}

export function applyBudgetSelectionAlgorithm(
  roads: RoadWithScore[],
  originalBudget: number,   // Lakhs
  reductionPercent = 40
): {
  roads: RoadWithScore[];
  usedBudget: number;
  availableBudget: number;
  remainingBudget: number;
} {
  const availableBudget = originalBudget * (1 - reductionPercent / 100);

  // Sort by priorityScore descending
  const sorted = [...roads].sort((a, b) => b.priorityScore - a.priorityScore);

  let usedBudget = 0;
  const result: RoadWithScore[] = [];

  for (const road of sorted) {
    if (usedBudget + road.estimatedRepairCost <= availableBudget) {
      result.push({
        ...road,
        maintenanceDecision: "RECOMMENDED",
        decisionReason: `Score ${road.priorityScore}/110 — fits within ₹${availableBudget}L budget`,
      });
      usedBudget += road.estimatedRepairCost;
    } else {
      result.push({
        ...road,
        maintenanceDecision: "DEFERRED",
        decisionReason: `Budget exhausted — ₹${road.estimatedRepairCost}L cost exceeds remaining ₹${Math.round((availableBudget - usedBudget) * 100) / 100}L`,
      });
    }
  }

  return {
    roads: result,
    usedBudget: Math.round(usedBudget * 100) / 100,
    availableBudget: Math.round(availableBudget * 100) / 100,
    remainingBudget: Math.round((availableBudget - usedBudget) * 100) / 100,
  };
}
