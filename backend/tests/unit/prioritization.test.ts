import { describe, it, expect } from "vitest";
import { calculateExplainablePriority } from "../../src/services/prioritizationService";

describe("Explainable Prioritization Engine", () => {
  it("calculates base severity correctly for potholes", () => {
    const result = calculateExplainablePriority({
      category: "POTHOLE",
      duplicateCount: 0,
    });

    expect(result.priorityScore).toBeGreaterThanOrEqual(40);
    expect(result.priorityReasons).toContain("Severe road asphalt crater (+40)");
  });

  it("applies proximity bonus when defect is near sensitive landmark (GMC Hospital)", () => {
    const gmcCoords: [number, number] = [79.0945, 21.1352];
    const result = calculateExplainablePriority({
      category: "POTHOLE",
      coordinates: gmcCoords,
      duplicateCount: 0,
    });

    expect(result.priorityScore).toBeGreaterThanOrEqual(65);
    expect(result.priorityLevel).toBe("HIGH");
    expect(result.priorityReasons.some((r) => r.includes("Government Medical College"))).toBe(true);
  });

  it("adds community impact bonus when duplicate detections are linked", () => {
    const result = calculateExplainablePriority({
      category: "POTHOLE",
      duplicateCount: 3,
    });

    expect(result.priorityScore).toBe(55); // 40 + 15
    expect(result.priorityReasons).toContain("Community impact: 3 duplicate detection(s) linked (+15)");
  });

  it("escalates to CRITICAL when combined with landmark proximity and duplicate volume", () => {
    const sitabuldiCoords: [number, number] = [79.0825, 21.1465];
    const result = calculateExplainablePriority({
      category: "POTHOLE",
      coordinates: sitabuldiCoords,
      duplicateCount: 4,
      hoursUnresolved: 48,
    });

    expect(result.priorityScore).toBeGreaterThanOrEqual(80);
    expect(result.priorityLevel).toBe("CRITICAL");
  });
});
