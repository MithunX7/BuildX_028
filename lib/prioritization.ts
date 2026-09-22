import { CivicDefectCategory } from "@/types/detection";
import { PriorityLevel } from "@/types/issue";

interface SensitiveLandmark {
  name: string;
  type: "HOSPITAL" | "SCHOOL" | "TRANSIT_HUB" | "HIGH_SPEED_CORRIDOR";
  coordinates: [number, number]; // [lng, lat]
  bonusPoints: number;
  radiusMeters: number;
}

// Nagpur Known Sensitive Landmarks
export const NAGPUR_LANDMARKS: SensitiveLandmark[] = [
  {
    name: "Government Medical College & Hospital (GMC)",
    type: "HOSPITAL",
    coordinates: [79.0945, 21.1352],
    bonusPoints: 25,
    radiusMeters: 400,
  },
  {
    name: "Sitabuldi Metro Interchange",
    type: "TRANSIT_HUB",
    coordinates: [79.0825, 21.1465],
    bonusPoints: 20,
    radiusMeters: 300,
  },
  {
    name: "Dharampeth Premier High School",
    type: "SCHOOL",
    coordinates: [79.0621, 21.1418],
    bonusPoints: 20,
    radiusMeters: 250,
  },
  {
    name: "Wardha Road High-Speed Corridor",
    type: "HIGH_SPEED_CORRIDOR",
    coordinates: [79.0754, 21.1092],
    bonusPoints: 25,
    radiusMeters: 500,
  },
  {
    name: "Nagpur Central Railway Station",
    type: "TRANSIT_HUB",
    coordinates: [79.0903, 21.1524],
    bonusPoints: 20,
    radiusMeters: 350,
  },
];

function calculateDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface PrioritizationResult {
  priorityScore: number;
  priorityLevel: PriorityLevel;
  priorityReasons: string[];
}

export function calculateExplainablePriority(params: {
  category: CivicDefectCategory;
  coordinates?: [number, number]; // [lng, lat]
  duplicateCount?: number;
  hoursUnresolved?: number;
  severityOverride?: number;
}): PrioritizationResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Base Severity by Category
  switch (params.category) {
    case "POTHOLE":
      score += 40;
      reasons.push("Severe road asphalt crater (+40)");
      break;
    case "ROAD_OBSTRUCTION":
      score += 35;
      reasons.push("Traffic carriageway obstruction (+35)");
      break;
    case "GARBAGE_ACCUMULATION":
      score += 30;
      reasons.push("Public health bio-waste accumulation (+30)");
      break;
    case "STREETLIGHT_FAULT":
      score += 25;
      reasons.push("Nighttime vision & safety hazard (+25)");
      break;
    case "DAMAGED_ASSET":
      score += 20;
      reasons.push("Damaged municipal barrier / divider (+20)");
      break;
  }

  // 2. Sensitive Landmark Proximity (Nagpur)
  if (params.coordinates && params.coordinates.length === 2) {
    for (const landmark of NAGPUR_LANDMARKS) {
      const distance = calculateDistanceMeters(params.coordinates, landmark.coordinates);
      if (distance <= landmark.radiusMeters) {
        score += landmark.bonusPoints;
        reasons.push(
          `Proximity bonus: within ${Math.round(distance)}m of ${landmark.name} (+${landmark.bonusPoints})`
        );
        break; // Count highest proximity landmark
      }
    }
  }

  // 3. Duplicate and Support Count
  const duplicates = params.duplicateCount || 0;
  if (duplicates > 0) {
    const dupBonus = Math.min(duplicates * 5, 20);
    score += dupBonus;
    reasons.push(`Community impact: ${duplicates} duplicate detection(s) linked (+${dupBonus})`);
  }

  // 4. Aging / Overdue Escalation
  const hours = params.hoursUnresolved || 0;
  if (hours > 24) {
    const ageBonus = Math.min(Math.floor(hours / 24) * 5, 15);
    score += ageBonus;
    reasons.push(`SLA age escalation: unresolved for ${Math.round(hours)}h (+${ageBonus})`);
  }

  // Clamp score 0 - 100
  score = Math.min(Math.max(score, 0), 100);

  // Map to Priority Level
  let level: PriorityLevel = "LOW";
  if (score >= 80) {
    level = "CRITICAL";
  } else if (score >= 60) {
    level = "HIGH";
  } else if (score >= 35) {
    level = "MEDIUM";
  }

  return {
    priorityScore: score,
    priorityLevel: level,
    priorityReasons: reasons,
  };
}
