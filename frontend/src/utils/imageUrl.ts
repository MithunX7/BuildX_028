/**
 * Resolves image URLs from the backend to fully qualified URLs.
 * Handles relative paths like `/uploads/...`, full URLs, and null/undefined.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // Already a full URL (http/https/data URI)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Relative path like /uploads/... — resolve against API base or current origin
  if (path.startsWith('/')) {
    // In dev, the Vite proxy handles /uploads → backend
    // In production, images are co-served from same origin
    return path;
  }

  // Path without leading slash — add one
  return `/${path}`;
}

/**
 * Extract before/after photos from a work order object.
 * Handles all known field structures from the backend populate chain.
 */
export function extractWorkOrderPhotos(wo: any): {
  beforePhoto: string | null;
  afterPhoto: string | null;
} {
  // BEFORE: from the linked issue
  const beforePhoto = resolveImageUrl(
    wo?.issueId?.evidencePhotos?.[0] ||
    wo?.issueId?.initialDetectionFrame ||
    (Array.isArray(wo?.issueId?.evidencePhotos) && wo.issueId.evidencePhotos.length > 0
      ? wo.issueId.evidencePhotos[0]
      : null)
  );

  // AFTER: from evidence documents linked to the work order
  const afterPhoto = resolveImageUrl(
    // Populated Evidence objects
    wo?.evidenceIds?.[0]?.fileUrl ||
    wo?.evidenceIds?.[0]?.mediaUrl ||
    // String evidence URLs
    (typeof wo?.evidenceIds?.[0] === 'string' && wo.evidenceIds[0].startsWith('/')
      ? wo.evidenceIds[0]
      : null) ||
    // Legacy field
    wo?.completionEvidenceUrl ||
    null
  );

  return { beforePhoto, afterPhoto };
}
