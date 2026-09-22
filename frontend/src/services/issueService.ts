import { apiClient } from './apiClient';

export interface Issue {
  _id: string;
  referenceCode: string;
  category: 'POTHOLE' | 'ROAD_SURFACE_DAMAGE' | 'GARBAGE_ACCUMULATION' | 'STREETLIGHT_FAULT' | 'ROAD_OBSTRUCTION' | 'CONSTRUCTION_CONFLICT' | 'DAMAGED_ASSET';
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
    addressText: string;
    zoneName?: string;
  };
  departmentId?: {
    _id: string;
    name: string;
    code: string;
    slaHours: Record<string, number>;
  };
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priorityScore: number;
  priorityReasons: string[];
  status: 'NEW' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  duplicateCount: number;
  initialDetectionFrame?: string;
  firstReportedAt: string;
  lastUpdatedAt: string;
  resolvedAt?: string;
}

export const issueService = {
  getIssues: async (params: {
    category?: string;
    status?: string;
    priorityLevel?: string;
    search?: string;
  } = {}): Promise<Issue[]> => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.priorityLevel) query.append('priorityLevel', params.priorityLevel);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    return apiClient.get<Issue[]>(`/issues${queryString ? `?${queryString}` : ''}`);
  },

  getIssueById: async (id: string): Promise<{
    issue: Issue;
    detections: any[];
    workOrders: any[];
    nearbyProjects: any[];
  }> => {
    return apiClient.get(`/issues/${id}`);
  },

  createCitizenReport: async (data: {
    category: string;
    title: string;
    description: string;
    coordinates: [number, number];
    addressText: string;
    imageBase64?: string;
  }): Promise<Issue> => {
    return apiClient.post<Issue>('/issues', data);
  },

  triageIssue: async (id: string, data: {
    departmentId?: string;
    priorityLevel?: string;
    priorityScore?: number;
    assignContractor?: boolean;
    contractorName?: string;
    dueInHours?: number;
  }): Promise<{ issue: Issue; workOrder: any; message: string }> => {
    return apiClient.post(`/issues/${id}/triage`, data);
  },

  verifyIssue: async (id: string, data: {
    action: 'APPROVE' | 'REOPEN';
    notes: string;
  }): Promise<{ issue: Issue; message: string }> => {
    return apiClient.post(`/issues/${id}/verify`, data);
  },
};
