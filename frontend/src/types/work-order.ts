export type WorkOrderStatus =
  | "CREATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED_FOR_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "REOPENED"
  | "CANCELLED";

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  issueId: string;
  departmentId: string;
  assignedToId?: string;
  contractorName?: string;
  status: WorkOrderStatus;
  dueAt: string;
  startedAt?: string;
  completedAt?: string;
  completionNotes?: string;
  evidenceIds: string[];
  verificationNotes?: string;
  verifiedById?: string;
  verifiedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}
