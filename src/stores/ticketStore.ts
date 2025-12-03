import type { WorkOrder } from "@interfaces/WorkOrder";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CreateCorrectiveJob = {
  id: string; // id local del job
  type: "CREATE_CORRECTIVE";
  ticketId: string;
  payload: any; // Partial<RepairReport>
  createdAt: number;
};

type TicketsState = {
  byId: Record<string, WorkOrder>;
  allIds: string[];
  lastSync?: number;
  // cola offline
  queue: CreateCorrectiveJob[];

  // setters
  setTickets: (items: WorkOrder[]) => void;
  upsertTicket: (item: WorkOrder) => void;
  getTicket: (id: string) => WorkOrder | undefined;

  // cola
  enqueueCreateCorrective: (ticketId: string, payload: any) => void;
  removeJob: (jobId: string) => void;
  replaceTicketId?: (args: {
    oldId: string;
    newId: string;
    patch?: Partial<WorkOrder>;
  }) => void;
};

const safeNoopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const storage = Platform.select({
  web:
    typeof window !== "undefined"
      ? createJSONStorage(() => window.localStorage)
      : createJSONStorage(() => safeNoopStorage),
  default: createJSONStorage(() => AsyncStorage),
});

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      byId: {},
      allIds: [],
      queue: [],
      lastSync: undefined,

      setTickets: (items) =>
        set(() => {
          const byId: Record<string, WorkOrder> = {};
          const allIds: string[] = [];
          for (const it of items) {
            byId[it.id] = it;
            allIds.push(it.id);
          }
          return { byId, allIds, lastSync: Date.now() };
        }),

      upsertTicket: (item) =>
        set((s) => ({
          byId: { ...s.byId, [item.id]: { ...s.byId[item.id], ...item } },
          allIds: s.allIds.includes(item.id)
            ? s.allIds
            : [...s.allIds, item.id],
        })),

      getTicket: (id) => get().byId[id],

      enqueueCreateCorrective: (ticketId, payload) =>
        set((s) => ({
          queue: [
            ...s.queue,
            {
              id: nanoid(),
              type: "CREATE_CORRECTIVE",
              ticketId,
              payload,
              createdAt: Date.now(),
            },
          ],
        })),

      removeJob: (jobId) =>
        set((s) => ({ queue: s.queue.filter((j) => j.id !== jobId) })),
    }),
    { name: "tickets-store", storage }
  )
);
