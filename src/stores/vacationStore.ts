import { SyncStatus, VacationRequest } from "@interfaces/Vacation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

/**
 * Vacation Store - Manages vacation state and offline synchronization queue
 * Following Single Responsibility Principle and Dependency Inversion
 */

const STORAGE_KEY = "@vacation_requests_queue";

interface VacationState {
  requests: VacationRequest[];
  pendingSyncQueue: VacationRequest[];
  availableDays: number;
  totalDays: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  addRequest: (request: VacationRequest) => Promise<void>;
  updateRequest: (id: string, request: Partial<VacationRequest>) => void;
  deleteRequest: (id: string) => void;
  setRequests: (requests: VacationRequest[]) => void;
  setAvailableDays: (days: number) => void;
  setTotalDays: (days: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Offline sync actions
  addToPendingQueue: (request: VacationRequest) => Promise<void>;
  removeFromPendingQueue: (id: string) => Promise<void>;
  getPendingQueue: () => Promise<VacationRequest[]>;
  clearPendingQueue: () => Promise<void>;
  syncPendingRequests: () => Promise<void>;
}

export const useVacationStore = create<VacationState>((set, get) => ({
  requests: [],
  pendingSyncQueue: [],
  availableDays: 22, // Default available days
  totalDays: 22, // Default total days
  isLoading: false,
  error: null,

  addRequest: async (request: VacationRequest) => {
    set((state) => ({
      requests: [...state.requests, request],
    }));

    // If request is pending sync, add to queue
    if (request.syncStatus === SyncStatus.Pending) {
      await get().addToPendingQueue(request);
    }
  },

  updateRequest: (id: string, updatedRequest: Partial<VacationRequest>) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updatedRequest } : req
      ),
    }));
  },

  deleteRequest: (id: string) => {
    set((state) => ({
      requests: state.requests.filter((req) => req.id !== id),
    }));
  },

  setRequests: (requests: VacationRequest[]) => {
    set({ requests });
  },

  setAvailableDays: (days: number) => {
    set({ availableDays: days });
  },

  setTotalDays: (days: number) => {
    set({ totalDays: days });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Offline queue management
  addToPendingQueue: async (request: VacationRequest) => {
    try {
      const queue = await get().getPendingQueue();
      const updatedQueue = [...queue, request];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
      set({ pendingSyncQueue: updatedQueue });
    } catch (error) {
      console.error("Error adding to pending queue:", error);
    }
  },

  removeFromPendingQueue: async (id: string) => {
    try {
      const queue = await get().getPendingQueue();
      const updatedQueue = queue.filter((req) => req.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
      set({ pendingSyncQueue: updatedQueue });
    } catch (error) {
      console.error("Error removing from pending queue:", error);
    }
  },

  getPendingQueue: async (): Promise<VacationRequest[]> => {
    try {
      const queueJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (!queueJson) return [];

      const queue = JSON.parse(queueJson);
      // Restore Date objects from JSON
      return queue.map((req: any) => ({
        ...req,
        startDate: new Date(req.startDate),
        endDate: new Date(req.endDate),
        creationDate: new Date(req.creationDate),
        approvedDate: req.approvedDate ? new Date(req.approvedDate) : undefined,
      }));
    } catch (error) {
      console.error("Error getting pending queue:", error);
      return [];
    }
  },

  clearPendingQueue: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ pendingSyncQueue: [] });
    } catch (error) {
      console.error("Error clearing pending queue:", error);
    }
  },

  syncPendingRequests: async () => {
    // This will be called by the service when connection is restored
    const queue = await get().getPendingQueue();
    set({ pendingSyncQueue: queue });
  },
}));
