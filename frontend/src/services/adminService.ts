import { apiClient } from './apiClient';

export interface AdminDashboardData {
  summary: {
    totalIssues: number;
    openIssues: number;
    criticalIssues: number;
    resolvedIssues: number;
    totalWorkOrders: number;
    pendingVerification: number;
    activeConflicts: number;
    resolutionRatePercent: number;
  };
  categoryStats: Array<{ _id: string; count: number }>;
}

export const adminService = {
  getDashboardSummary: async (): Promise<AdminDashboardData> => {
    return apiClient.get<AdminDashboardData>('/admin/dashboard/summary');
  },

  getIssues: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ issues: any[]; pagination: any }> => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.category) q.append('category', params.category);
    if (params?.priority) q.append('priority', params.priority);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<{ issues: any[]; pagination: any }>(`/admin/issues${queryStr}`);
  },

  getIssueById: async (id: string): Promise<{ issue: any; auditHistory: any[] }> => {
    return apiClient.get<{ issue: any; auditHistory: any[] }>(`/admin/issues/${id}`);
  },

  triageIssue: async (
    id: string,
    payload: {
      departmentId?: string;
      priorityLevel?: string;
      priorityScore?: number;
      assignContractor?: boolean;
      contractorName?: string;
      dueInHours?: number;
    }
  ): Promise<{ message: string; issue: any; workOrder?: any }> => {
    return apiClient.patch<{ message: string; issue: any; workOrder?: any }>(
      `/admin/issues/${id}/triage`,
      payload
    );
  },

  updateIssueStatus: async (
    id: string,
    status: string,
    resolutionNotes?: string
  ): Promise<{ message: string; issue: any }> => {
    return apiClient.patch<{ message: string; issue: any }>(`/admin/issues/${id}/status`, {
      status,
      resolutionNotes,
    });
  },

  getWorkOrders: async (): Promise<any[]> => {
    const res = await apiClient.get<{ workOrders: any[] }>('/admin/work-orders');
    return res.workOrders || [];
  },

  createWorkOrder: async (payload: {
    issueId: string;
    contractorName: string;
    dueInHours?: number;
  }): Promise<{ message: string; workOrder: any }> => {
    return apiClient.post<{ message: string; workOrder: any }>('/admin/work-orders', payload);
  },

  verifyWorkOrder: async (
    id: string,
    action: 'APPROVE' | 'REOPEN',
    verificationNotes?: string
  ): Promise<{ message: string; workOrder: any }> => {
    return apiClient.post<{ message: string; workOrder: any }>(
      `/admin/work-orders/${id}/verify`,
      { action, verificationNotes }
    );
  },

  getUsers: async (): Promise<any[]> => {
    const res = await apiClient.get<{ users: any[] }>('/admin/users');
    return res.users || [];
  },

  updateUserStatus: async (
    id: string,
    payload: { isActive?: boolean; role?: string }
  ): Promise<{ message: string; user: any }> => {
    return apiClient.patch<{ message: string; user: any }>(`/admin/users/${id}/status`, payload);
  },

  getAuditLogs: async (limit = 100): Promise<any[]> => {
    const res = await apiClient.get<{ logs: any[] }>(`/admin/audit-logs?limit=${limit}`);
    return res.logs || [];
  },
};
