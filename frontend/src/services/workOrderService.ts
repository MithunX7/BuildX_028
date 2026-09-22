import { apiClient } from './apiClient';

export interface WorkOrder {
  _id: string;
  workOrderNumber: string;
  issueId: any;
  departmentId: any;
  contractorName?: string;
  status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED_FOR_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'REOPENED' | 'CANCELLED';
  dueAt: string;
  startedAt?: string;
  completedAt?: string;
  completionNotes?: string;
  evidenceIds: any[];
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const workOrderService = {
  getWorkOrders: async (params: { status?: string; departmentId?: string } = {}): Promise<WorkOrder[]> => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.departmentId) query.append('departmentId', params.departmentId);

    const queryString = query.toString();
    return apiClient.get<WorkOrder[]>(`/work-orders${queryString ? `?${queryString}` : ''}`);
  },

  getWorkOrderById: async (id: string): Promise<{ workOrder: WorkOrder; evidence: any[] }> => {
    return apiClient.get(`/work-orders/${id}`);
  },

  updateProgress: async (id: string, status: string, notes?: string): Promise<WorkOrder> => {
    return apiClient.post<WorkOrder>(`/work-orders/${id}/progress`, { status, notes });
  },

  uploadEvidence: async (id: string, data: {
    imageBase64: string;
    completionNotes?: string;
    coordinates?: [number, number];
    evidenceType?: string;
  }): Promise<{ workOrder: WorkOrder; evidence: any; message: string }> => {
    return apiClient.post(`/work-orders/${id}/evidence`, data);
  },

  verifyWorkOrder: async (id: string, action: 'APPROVE' | 'REOPEN', notes: string): Promise<{ workOrder: WorkOrder; message: string }> => {
    return apiClient.post(`/work-orders/${id}/verify`, { action, notes });
  },
};
