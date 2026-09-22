import { apiClient } from './apiClient';

export interface RoadData {
  _id: string;
  roadName: string;
  location: string;
  latitude: number;
  longitude: number;
  trafficDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  accidentHistory: 'LOW' | 'MEDIUM' | 'HIGH';
  complaintCount: number;
  economicImportance: 'LOW' | 'MEDIUM' | 'HIGH';
  damageSeverity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  estimatedRepairCost: number; // Lakhs
  priorityScore: number;
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  maintenanceDecision: 'RECOMMENDED' | 'DEFERRED' | 'PENDING';
  decisionReason?: string;
  status: 'ACTIVE' | 'UNDER_REPAIR' | 'REPAIRED';
}

export interface BudgetConfig {
  _id: string;
  originalBudget: number;
  reductionPercentage: number;
  availableBudget: number;
  usedBudget: number;
  remainingBudget: number;
  lastCalculatedAt: string;
}

export interface PrioritySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  recommended: number;
  deferred: number;
}

export interface MaintenanceDashboard {
  budget: BudgetConfig;
  prioritySummary: PrioritySummary;
  roads: RoadData[];
  liveComplaintCount: number;
}

export interface ScoreBreakdown {
  priorityScore: number;
  priorityLevel: string;
  trafficScore: number;
  accidentScore: number;
  complaintScore: number;
  economicScore: number;
  reasons: string[];
}

export const maintenanceService = {
  getDashboard: async (): Promise<MaintenanceDashboard> => {
    const res = await apiClient.get<MaintenanceDashboard>('/maintenance/dashboard');
    return res;
  },

  calculatePlan: async (): Promise<{ message: string; roads: RoadData[]; budget: Partial<BudgetConfig> }> => {
    const res = await apiClient.post<{ message: string; roads: RoadData[]; budget: Partial<BudgetConfig> }>(
      '/maintenance/calculate'
    );
    return res;
  },

  updateBudget: async (originalBudget: number, reductionPercentage = 40): Promise<{ config: BudgetConfig; message: string }> => {
    const res = await apiClient.put<{ config: BudgetConfig; message: string }>('/maintenance/budget', {
      originalBudget,
      reductionPercentage,
    });
    return res;
  },

  getRoadDetail: async (id: string): Promise<{ road: RoadData; scoreBreakdown: ScoreBreakdown }> => {
    const res = await apiClient.get<{ road: RoadData; scoreBreakdown: ScoreBreakdown }>(
      `/maintenance/roads/${id}`
    );
    return res;
  },
};
