import { apiClient } from './apiClient';

export interface DashboardSummary {
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  totalDetections: number;
  activeWorkOrders: number;
  pendingVerification: number;
  activeConflicts: number;
  resolutionRatePercent: number;
}

export const dashboardService = {
  getDashboardSummary: async (): Promise<{ summary: DashboardSummary; categoryStats: any[] }> => {
    return apiClient.get<{ summary: DashboardSummary; categoryStats: any[] }>('/dashboard/summary');
  },
};
