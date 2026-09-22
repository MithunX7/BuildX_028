export type CivicDefectCategory =
  | "POTHOLE"
  | "ROAD_SURFACE_DAMAGE"
  | "GARBAGE_ACCUMULATION"
  | "STREETLIGHT_FAULT"
  | "ROAD_OBSTRUCTION"
  | "CONSTRUCTION_CONFLICT"
  | "DAMAGED_ASSET";

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DemoSceneDef {
  id: string;
  sceneName: string;
  category: CivicDefectCategory;
  label: string;
  description: string;
  confidence: number;
  boundingBox: BoundingBox;
  estimatedSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: {
    coordinates: [number, number]; // [lng, lat]
    addressText: string;
    zoneName: string;
  };
  sampleVideoUrl?: string;
  sampleImageUrl?: string;
}

export const DEMO_SCENES: DemoSceneDef[] = [
  {
    id: "scene-1-pothole",
    sceneName: "Scene 1: Severe Asphalt Pothole on Wardha Road",
    category: "POTHOLE",
    label: "Severe Pothole / Carriageway Crater",
    description: "Deep asphalt depression with exposed sub-base measuring approx 60cm diameter. High hazard for two-wheelers.",
    confidence: 0.89,
    boundingBox: { ymin: 0.55, xmin: 0.35, ymax: 0.86, xmax: 0.65 },
    estimatedSeverity: "HIGH",
    location: {
      coordinates: [79.0754, 21.1092],
      addressText: "Wardha Road, Near Sai Mandir Metro Pillar 142",
      zoneName: "Laxmi Nagar Zone",
    },
  },
  {
    id: "scene-2-garbage",
    sceneName: "Scene 2: Overflowing Waste Dump at Sitabuldi",
    category: "GARBAGE_ACCUMULATION",
    label: "Commercial Waste & Garbage Accumulation",
    description: "Unattended municipal bio-waste pile obstructing pedestrian pathway outside commercial market complex.",
    confidence: 0.94,
    boundingBox: { ymin: 0.42, xmin: 0.58, ymax: 0.84, xmax: 0.92 },
    estimatedSeverity: "MEDIUM",
    location: {
      coordinates: [79.0825, 21.1465],
      addressText: "Sitabuldi Main Road, Opp Metro Station Gate 2",
      zoneName: "Dharampeth Zone",
    },
  },
  {
    id: "scene-3-streetlight",
    sceneName: "Scene 3: Broken Luminaire / Pole on Central Avenue",
    category: "STREETLIGHT_FAULT",
    label: "Damaged Luminaire Pole & Wiring Hazard",
    description: "Streetlight fixture with exposed wiring and bent luminaire casing. Nighttime illumination blackout in sector.",
    confidence: 0.86,
    boundingBox: { ymin: 0.15, xmin: 0.42, ymax: 0.68, xmax: 0.58 },
    estimatedSeverity: "MEDIUM",
    location: {
      coordinates: [79.0903, 21.1524],
      addressText: "Central Avenue, Near Agrasen Square",
      zoneName: "Gandhibagh Zone",
    },
  },
  {
    id: "scene-4-obstruction",
    sceneName: "Scene 4: Uncoordinated Pipe Excavation Debris",
    category: "ROAD_OBSTRUCTION",
    label: "Excavation Debris & Pipe Barrier Obstruction",
    description: "Unmarked water pipeline excavation mound and steel barrier blocking 1.5 traffic lanes without warning signboards.",
    confidence: 0.92,
    boundingBox: { ymin: 0.48, xmin: 0.22, ymax: 0.88, xmax: 0.78 },
    estimatedSeverity: "CRITICAL",
    location: {
      coordinates: [79.0621, 21.1418],
      addressText: "West High Court Road, Dharampeth Junction",
      zoneName: "Dharampeth Zone",
    },
  },
  {
    id: "scene-5-duplicate",
    sceneName: "Scene 5: Re-surveying Wardha Road Pothole (Duplicate)",
    category: "POTHOLE",
    label: "Pothole Re-Detection (Proximity Candidate)",
    description: "Second patrol detection of the existing Wardha Road crater within 12 meters of previous report.",
    confidence: 0.91,
    boundingBox: { ymin: 0.52, xmin: 0.38, ymax: 0.84, xmax: 0.68 },
    estimatedSeverity: "HIGH",
    location: {
      coordinates: [79.0756, 21.1094], // 15m away from Scene 1
      addressText: "Wardha Road, Metro Pillar 143 (Opposite Sai Mandir)",
      zoneName: "Laxmi Nagar Zone",
    },
  },
];

export async function detectDefectFromFrame(params: {
  imageBase64?: string;
  sceneHint?: string;
  customCoordinates?: [number, number];
}): Promise<{
  detected: boolean;
  sceneDef: DemoSceneDef;
}> {
  if (params.sceneHint) {
    const found = DEMO_SCENES.find((s) => s.id === params.sceneHint);
    if (found) {
      return { detected: true, sceneDef: found };
    }
  }

  const defaultScene = DEMO_SCENES[0];
  return {
    detected: true,
    sceneDef: {
      ...defaultScene,
      location: {
        ...defaultScene.location,
        coordinates: params.customCoordinates || defaultScene.location.coordinates,
      },
    },
  };
}
