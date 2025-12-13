/**
 * Vacation domain interfaces and types
 * Following Single Responsibility Principle - each interface has one clear purpose
 */

export enum VacationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
}

export interface VacationRequest {
  id: string;
  operatorId: string;
  operatorName?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: VacationStatus;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  creationDate: Date;
  active: boolean;
  syncStatus: SyncStatus;
}

export enum SyncStatus {
  Synced = "Synced",
  Pending = "Pending",
  Failed = "Failed",
}

export interface VacationBalance {
  operatorId: string;
  availableDays: number;
  usedDays: number;
  totalDays: number;
}

export interface CreateVacationRequestDto {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface VacationRequestValidation {
  isValid: boolean;
  errors: string[];
}
