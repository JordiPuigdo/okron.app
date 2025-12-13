import {
  CreateVacationRequestDto,
  SyncStatus,
  VacationBalance,
  VacationRequest,
  VacationStatus,
} from "@interfaces/Vacation";
import NetInfo from "@react-native-community/netinfo";
import { holidayService } from "./holidayService";

/**
 * Vacation Service - Handles API communication for vacation requests
 * Following Single Responsibility and Dependency Inversion principles
 */

class VacationService {
  private API = process.env.EXPO_PUBLIC_API_URL;

  /**
   * Check if device has internet connection
   */
  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Get vacation balance for an operator
   */
  async getVacationBalance(operatorId: string): Promise<VacationBalance> {
    try {
      const currentYear = new Date().getFullYear();
      const [availableResponse, usedResponse] = await Promise.all([
        fetch(
          `${this.API}vacation-request/operator/${operatorId}/available-days/${currentYear}`
        ),
        fetch(
          `${this.API}vacation-request/operator/${operatorId}/used-days/${currentYear}`
        ),
      ]);

      if (!availableResponse.ok || !usedResponse.ok) {
        throw new Error("Failed to fetch vacation balance");
      }

      const availableData = await availableResponse.json();
      const usedData = await usedResponse.json();

      const availableDays = availableData.availableDays || 22;
      const usedDays = usedData.usedDays || 0;

      return {
        operatorId,
        availableDays,
        usedDays,
        totalDays: 22,
      };
    } catch (error) {
      console.error("Error fetching vacation balance:", error);
      throw error;
    }
  }

  /**
   * Get all vacation requests for an operator
   */
  async getVacationRequests(operatorId: string): Promise<VacationRequest[]> {
    try {
      const url = `${this.API}vacation-request/operator/${operatorId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch vacation requests");
      }

      if (response.status === 204) {
        return [];
      }

      const data = await response.json();

      // Transform dates from string to Date objects
      return data.map((item: any) => ({
        ...item,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        creationDate: new Date(item.creationDate),
        approvedDate: item.approvedDate
          ? new Date(item.approvedDate)
          : undefined,
        syncStatus: SyncStatus.Synced,
      }));
    } catch (error) {
      console.error("Error fetching vacation requests:", error);
      throw error;
    }
  }

  /**
   * Create a new vacation request
   * Returns the created request with server-generated ID
   */
  async createVacationRequest(
    operatorId: string,
    operatorName: string,
    dto: CreateVacationRequestDto
  ): Promise<VacationRequest> {
    const isOnline = await this.isOnline();

    const newRequest: VacationRequest = {
      id: this.generateTemporaryId(),
      operatorId,
      operatorName,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason || "",
      status: VacationStatus.Pending,
      creationDate: new Date(),
      active: true,
      syncStatus: isOnline ? SyncStatus.Synced : SyncStatus.Pending,
    };

    if (isOnline) {
      try {
        const requestBody = {
          operatorId,
          startDate: dto.startDate.toISOString(),
          endDate: dto.endDate.toISOString(),
          reason: dto.reason || "",
          status: VacationStatus.Pending,
        };

        const response = await fetch(`${this.API}vacation-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to create vacation request");
        }

        // API returns just a success message, so we return our newRequest
        return { ...newRequest, syncStatus: SyncStatus.Synced };
      } catch (error) {
        console.error("Error creating vacation request online:", error);
        // If API fails, mark as pending and queue for later
        return { ...newRequest, syncStatus: SyncStatus.Pending };
      }
    }

    // Offline mode - will be queued for sync
    return newRequest;
  }

  /**
   * Sync a pending vacation request when connection is restored
   */
  async syncVacationRequest(
    request: VacationRequest
  ): Promise<VacationRequest> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        throw new Error("Cannot sync while offline");
      }

      const requestBody = {
        operatorId: request.operatorId,
        startDate: request.startDate.toISOString(),
        endDate: request.endDate.toISOString(),
        reason: request.reason,
        status: VacationStatus.Pending,
      };

      const response = await fetch(`${this.API}vacation-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to sync vacation request");
      }

      return { ...request, syncStatus: SyncStatus.Synced };
    } catch (error) {
      console.error("Error syncing vacation request:", error);
      return { ...request, syncStatus: SyncStatus.Failed };
    }
  }

  /**
   * Update vacation request status (approve/reject/cancel)
   */
  async updateVacationRequestStatus(
    id: string,
    status: VacationStatus,
    userId?: string,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      let url = `${this.API}vacation-request/${id}`;
      let method = "POST";
      let body: any = {};

      switch (status) {
        case VacationStatus.Approved:
          url += "/approve";
          body = { userId };
          break;
        case VacationStatus.Rejected:
          url += "/reject";
          body = { userId, rejectionReason };
          break;
        case VacationStatus.Cancelled:
          url += "/cancel";
          method = "POST";
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update vacation request status");
      }

      return true;
    } catch (error) {
      console.error("Error updating vacation request status:", error);
      throw error;
    }
  }

  /**
   * Delete a vacation request
   */
  async deleteVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API}vacation-request/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete vacation request");
      }

      return true;
    } catch (error) {
      console.error("Error deleting vacation request:", error);
      throw error;
    }
  }

  /**
   * Get pending vacation requests (for admin/manager view)
   */
  async getPendingRequests(): Promise<VacationRequest[]> {
    try {
      const response = await fetch(`${this.API}vacation-request/pending`);

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      if (response.status === 204) {
        return [];
      }

      const data = await response.json();

      return data.map((item: any) => ({
        ...item,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        creationDate: new Date(item.creationDate),
        approvedDate: item.approvedDate
          ? new Date(item.approvedDate)
          : undefined,
        syncStatus: SyncStatus.Synced,
      }));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      throw error;
    }
  }

  /**
   * Validate vacation request dates
   */
  validateVacationRequest(dto: CreateVacationRequestDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Check if start date is in the past
    if (dto.startDate < now) {
      errors.push("La fecha de inicio no puede ser anterior a hoy");
    }

    // Check if end date is before start date
    if (dto.endDate < dto.startDate) {
      errors.push("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    // Check if dates are valid
    if (isNaN(dto.startDate.getTime()) || isNaN(dto.endDate.getTime())) {
      errors.push("Las fechas no son válidas");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate number of vacation days between two dates
   * Includes both start and end dates, excludes weekends and holidays
   */
  async calculateVacationDays(startDate: Date, endDate: Date): Promise<number> {
    let count = 0;
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Get all holidays in the date range
    const holidays = await holidayService.getHolidaysBetweenDates(
      startDate,
      endDate
    );
    const holidayDates = new Set(
      holidays.map((h) => {
        const d = new Date(h.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayDates.has(current.getTime());

      // Count only weekdays that are not holidays
      if (!isWeekend && !isHoliday) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
  /**
   * Generate a temporary ID for offline requests
   */
  private generateTemporaryId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const vacationService = new VacationService();
