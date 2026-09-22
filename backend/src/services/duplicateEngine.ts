import { Issue, IIssue } from "../models/Issue";
import { CivicDefectCategory } from "../types/issue";

export interface DuplicateMatchCandidate {
  issue: IIssue;
  distanceMeters: number;
  isDuplicate: boolean;
  matchConfidence: number; // 0.0 - 1.0
  reason: string;
}

export async function findNearbyDuplicateIssue(params: {
  category: CivicDefectCategory;
  coordinates: [number, number]; // [lng, lat]
  maxDistanceMeters?: number; // default 50 meters
}): Promise<DuplicateMatchCandidate | null> {
  const maxDistance = params.maxDistanceMeters || 50;

  try {
    const candidate = await Issue.findOne({
      category: params.category,
      status: { $nin: ["RESOLVED", "REJECTED"] },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: params.coordinates,
          },
          $maxDistance: maxDistance,
        },
      },
    });

    if (candidate && candidate.location?.coordinates) {
      const [lng1, lat1] = params.coordinates;
      const [lng2, lat2] = candidate.location.coordinates;
      
      const R = 6371e3;
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.round(R * c);

      const confidence = Math.max(0.7, 1.0 - dist / (maxDistance * 2));

      return {
        issue: candidate,
        distanceMeters: dist,
        isDuplicate: true,
        matchConfidence: Number(confidence.toFixed(2)),
        reason: `Matched open issue ${candidate.referenceCode} within ${dist}m (${candidate.category})`,
      };
    }
  } catch {
    const openIssues = await Issue.find({
      category: params.category,
      status: { $nin: ["RESOLVED", "REJECTED"] },
    }).limit(20);

    for (const issue of openIssues) {
      if (issue.location?.coordinates) {
        const [lng1, lat1] = params.coordinates;
        const [lng2, lat2] = issue.location.coordinates;
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = Math.round(R * c);

        if (dist <= maxDistance) {
          return {
            issue,
            distanceMeters: dist,
            isDuplicate: true,
            matchConfidence: 0.9,
            reason: `Matched existing canonical issue ${issue.referenceCode} (${dist}m away)`,
          };
        }
      }
    }
  }

  return null;
}
