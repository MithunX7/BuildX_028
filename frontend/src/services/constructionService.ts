import { apiClient } from './apiClient';

export interface ConstructionProject {
  _id: string;
  name: string;
  agencyName: string;
  projectType: string;
  roadName: string;
  location: {
    type: string;
    coordinates: number[][]; // LineString or Polygon
  };
  startDate: string;
  endDate: string;
  status: string;
  permitReference?: string;
  trafficImpactLevel: string;
}

export interface ConstructionConflict {
  _id: string;
  projectId: any;
  issueId: any;
  conflictType: string;
  description: string;
  detectedAt: string;
  status: string;
}

export const constructionService = {
  getProjects: async (status?: string): Promise<ConstructionProject[]> => {
    return apiClient.get<ConstructionProject[]>(`/construction-projects${status ? `?status=${status}` : ''}`);
  },

  getConflicts: async (): Promise<{ conflicts: ConstructionConflict[]; count: number }> => {
    return apiClient.get<{ conflicts: ConstructionConflict[]; count: number }>('/construction-projects/conflicts');
  },
};
