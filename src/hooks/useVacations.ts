import {
  CreateVacationRequestDto,
  SyncStatus,
  VacationStatus,
} from "@interfaces/Vacation";
import NetInfo from "@react-native-community/netinfo";
import { vacationService } from "@services/vacationService";
import { useAuthStore } from "@store/authStore";
import { useVacationStore } from "@store/vacationStore";
import { useCallback, useEffect } from "react";

/**
 * Custom hook for managing vacation requests with offline support
 * Following Single Responsibility and Dependency Inversion principles
 */

export const useVacations = () => {
  const { factoryWorker } = useAuthStore();
  const {
    requests,
    availableDays,
    totalDays,
    isLoading,
    error,
    pendingSyncQueue,
    addRequest,
    setRequests,
    setAvailableDays,
    setTotalDays,
    setLoading,
    setError,
    getPendingQueue,
    removeFromPendingQueue,
  } = useVacationStore();

  /**
   * Initialize total days from operator data
   */
  useEffect(() => {
    if (factoryWorker?.annualVacationDays) {
      setTotalDays(factoryWorker.annualVacationDays);
    }
  }, [factoryWorker, setTotalDays]);

  /**
   * Load vacation data from API
   */
  const loadVacationData = useCallback(async () => {
    if (!factoryWorker) return;

    setLoading(true);
    setError(null);

    try {
      const isOnline = await vacationService.isOnline();

      if (isOnline) {
        // Fetch vacation balance and requests from API
        const [balance, vacationRequests] = await Promise.all([
          vacationService.getVacationBalance(factoryWorker.id),
          vacationService.getVacationRequests(factoryWorker.id),
        ]);

        setAvailableDays(balance.availableDays);
        setRequests(vacationRequests);

        // Update total days if available from API
        if (balance.totalDays) {
          setTotalDays(balance.totalDays);
        }
      } else {
        // Offline mode - use cached data
        console.log("Offline mode - using cached vacation data");
      }
    } catch (err) {
      console.error("Error loading vacation data:", err);
      setError("Error al cargar los datos de vacaciones");
    } finally {
      setLoading(false);
    }
  }, [
    factoryWorker,
    setLoading,
    setError,
    setAvailableDays,
    setRequests,
    setTotalDays,
  ]);

  /**
   * Create a new vacation request
   */
  const createVacationRequest = useCallback(
    async (dto: CreateVacationRequestDto) => {
      if (!factoryWorker) {
        throw new Error("No factory worker found");
      }

      setLoading(true);
      setError(null);

      try {
        // Create the request (will be queued if offline)
        const newRequest = await vacationService.createVacationRequest(
          factoryWorker.id,
          factoryWorker.name,
          dto
        );

        // Add to store
        await addRequest(newRequest);

        // Update available days (optimistic update)
        const requestedDays = vacationService.calculateVacationDays(
          dto.startDate,
          dto.endDate
        );
        setAvailableDays(availableDays - requestedDays);

        return newRequest;
      } catch (err) {
        console.error("Error creating vacation request:", err);
        setError("Error al crear la solicitud de vacaciones");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      factoryWorker,
      availableDays,
      addRequest,
      setAvailableDays,
      setLoading,
      setError,
    ]
  );

  /**
   * Sync pending requests when connection is restored
   */
  const syncPendingRequests = useCallback(async () => {
    const queue = await getPendingQueue();

    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} pending vacation requests...`);

    for (const request of queue) {
      try {
        const syncedRequest = await vacationService.syncVacationRequest(
          request
        );

        if (syncedRequest.syncStatus === SyncStatus.Synced) {
          // Remove from pending queue
          await removeFromPendingQueue(request.id);
          console.log(`Successfully synced request ${request.id}`);
        }
      } catch (err) {
        console.error(`Failed to sync request ${request.id}:`, err);
      }
    }

    // Reload data after sync
    await loadVacationData();
  }, [getPendingQueue, removeFromPendingQueue, loadVacationData]);

  /**
   * Set up network listener for automatic sync
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log("Connection restored - syncing pending requests...");
        syncPendingRequests();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [syncPendingRequests]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadVacationData();
  }, [loadVacationData]);

  /**
   * Calculate total pending sync items
   */
  const pendingSyncCount = pendingSyncQueue.length;

  /**
   * Get pending requests for approval (admin/manager view)
   */
  const getPendingRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const isOnline = await vacationService.isOnline();

      if (!isOnline) {
        throw new Error("No hay conexión a internet");
      }

      const pendingRequests = await vacationService.getPendingRequests();
      return pendingRequests;
    } catch (err) {
      console.error("Error loading pending requests:", err);
      setError("Error al cargar las solicitudes pendientes");
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Approve a vacation request
   */
  const approveRequest = useCallback(
    async (requestId: string, userId: string) => {
      try {
        await vacationService.updateVacationRequestStatus(
          requestId,
          VacationStatus.Approved,
          userId
        );
        // Reload data
        await loadVacationData();
      } catch (err) {
        console.error("Error approving request:", err);
        throw err;
      }
    },
    [loadVacationData]
  );

  /**
   * Reject a vacation request
   */
  const rejectRequest = useCallback(
    async (requestId: string, userId: string, reason: string) => {
      try {
        await vacationService.updateVacationRequestStatus(
          requestId,
          VacationStatus.Rejected,
          userId,
          reason
        );
        // Reload data
        await loadVacationData();
      } catch (err) {
        console.error("Error rejecting request:", err);
        throw err;
      }
    },
    [loadVacationData]
  );

  return {
    // State
    requests,
    availableDays,
    totalDays,
    isLoading,
    error,
    pendingSyncCount,
    hasPendingSync: pendingSyncCount > 0,

    // Actions
    createVacationRequest,
    loadVacationData,
    syncPendingRequests,
    getPendingRequests,
    approveRequest,
    rejectRequest,
  };
};
