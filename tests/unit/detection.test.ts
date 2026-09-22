import { describe, it, expect } from "vitest";
import { DEMO_SCENES, detectDefectFromFrame } from "../../lib/detection-service";

describe("Live Vision Detection Service", () => {
  it("provides 5 distinct calibrated demo scenes covering different civic categories", () => {
    expect(DEMO_SCENES.length).toBe(5);
    const categories = DEMO_SCENES.map((s) => s.category);
    expect(categories).toContain("POTHOLE");
    expect(categories).toContain("GARBAGE_ACCUMULATION");
    expect(categories).toContain("STREETLIGHT_FAULT");
    expect(categories).toContain("ROAD_OBSTRUCTION");
  });

  it("normalizes bounding box coordinates within [0.0, 1.0]", () => {
    for (const scene of DEMO_SCENES) {
      const { ymin, xmin, ymax, xmax } = scene.boundingBox;
      expect(ymin).toBeGreaterThanOrEqual(0);
      expect(xmin).toBeGreaterThanOrEqual(0);
      expect(ymax).toBeLessThanOrEqual(1.0);
      expect(xmax).toBeLessThanOrEqual(1.0);
      expect(ymax).toBeGreaterThan(ymin);
      expect(xmax).toBeGreaterThan(xmin);
    }
  });

  it("correctly identifies Scene 1 (Wardha Road Pothole)", async () => {
    const result = await detectDefectFromFrame({ sceneHint: "scene-1-pothole" });
    expect(result.detected).toBe(true);
    expect(result.sceneDef.category).toBe("POTHOLE");
    expect(result.sceneDef.confidence).toBeGreaterThan(0.8);
    expect(result.sceneDef.location.addressText).toContain("Wardha Road");
  });

  it("correctly identifies Scene 2 (Sitabuldi Garbage Accumulation)", async () => {
    const result = await detectDefectFromFrame({ sceneHint: "scene-2-garbage" });
    expect(result.detected).toBe(true);
    expect(result.sceneDef.category).toBe("GARBAGE_ACCUMULATION");
    expect(result.sceneDef.confidence).toBeGreaterThan(0.9);
  });
});
