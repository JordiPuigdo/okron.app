// @store/workOrderFiltersStore.ts
import { WorkOrderPriority, WorkOrderType } from "@interfaces/WorkOrder";
import { create } from "zustand";

export type WorkOrderOrderBy =
  | "code_asc"
  | "code_desc"
  | "date_asc"
  | "date_desc"
  | "state_asc"
  | "state_desc"
  | "priority_asc"
  | "priority_desc"
  | null;

export type WorkOrderFiltersState = {
  startDate?: Date;
  endDate?: Date;
  priority?: WorkOrderPriority | null;
  showFinishedToday?: boolean;
  workOrderType?: WorkOrderType | null;
  orderBy?: WorkOrderOrderBy;
};

type WorkOrderFiltersStore = {
  // Estado de filtros (solo sesión)
  filters: WorkOrderFiltersState;

  // Texto de búsqueda global para usarlo también desde otras pantallas
  searchQuery: string;

  // Acciones
  setFilters: (filters: WorkOrderFiltersState) => void;
  updateFilter: <K extends keyof WorkOrderFiltersState>(
    key: K,
    value: WorkOrderFiltersState[K]
  ) => void;
  resetFilters: () => void;

  setSearchQuery: (q: string) => void;
};

const initialFilters: WorkOrderFiltersState = {
  startDate: undefined,
  endDate: undefined,
  priority: null,
  showFinishedToday: false,
  workOrderType: null,
  orderBy: null,
};

export const useWorkOrderFiltersStore = create<WorkOrderFiltersStore>(
  (set) => ({
    filters: initialFilters,
    searchQuery: "",

    setFilters: (filters) =>
      set(() => ({
        filters: {
          ...initialFilters,
          ...filters,
        },
      })),

    updateFilter: (key, value) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
      })),

    resetFilters: () =>
      set(() => ({
        filters: initialFilters,
      })),

    setSearchQuery: (q) => set({ searchQuery: q }),
  })
);

// Helper para seleccionar con shallow y evitar renders innecesarios
export const selectFilters = (s: WorkOrderFiltersStore) => s.filters;
export const selectSearch = (s: WorkOrderFiltersStore) => ({
  searchQuery: s.searchQuery,
  setSearchQuery: s.setSearchQuery,
});

// Utilidad pura: saber si hay filtros activos
export const areFiltersActive = (filters: WorkOrderFiltersState) =>
  filters.priority != null ||
  !!filters.startDate ||
  !!filters.endDate ||
  filters.showFinishedToday === true ||
  filters.workOrderType != null ||
  !!filters.orderBy;
