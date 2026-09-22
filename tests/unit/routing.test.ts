import { describe, it, expect } from "vitest";
import { suggestDepartmentForCategory } from "../../lib/routing-engine";

describe("Department Routing Engine", () => {
  it("routes POTHOLE category to Roads Department", async () => {
    const suggestion = await suggestDepartmentForCategory("POTHOLE");
    expect(suggestion.departmentCode).toBe("ROADS");
    expect(suggestion.departmentName).toContain("Roads");
    expect(suggestion.routingReason).toContain("asphalt");
  });

  it("routes GARBAGE_ACCUMULATION to Sanitation Department", async () => {
    const suggestion = await suggestDepartmentForCategory("GARBAGE_ACCUMULATION");
    expect(suggestion.departmentCode).toBe("SANITATION");
    expect(suggestion.departmentName).toContain("Waste");
  });

  it("routes STREETLIGHT_FAULT to Electrical Department", async () => {
    const suggestion = await suggestDepartmentForCategory("STREETLIGHT_FAULT");
    expect(suggestion.departmentCode).toBe("ELECTRICAL");
    expect(suggestion.departmentName).toContain("Electrical");
  });

  it("routes ROAD_OBSTRUCTION to Water Works / Public Works", async () => {
    const suggestion = await suggestDepartmentForCategory("ROAD_OBSTRUCTION");
    expect(suggestion.departmentCode).toBe("WATER_WORKS");
  });
});
