import { useWorkOrders } from "@hooks/useWorkOrders";
import { OriginWorkOrder, StateWorkOrder } from "@interfaces/WorkOrder";
import NetInfo from "@react-native-community/netinfo";
import { useTicketsStore } from "@store/ticketStore";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

const FIVE_MIN = 5 * 60 * 1000;

export function useTicketsSync() {
  const { fetchWithFilters, createRepairWorkOrder } = useWorkOrders();
  const setTickets = useTicketsStore((s) => s.setTickets);
  const queue = useTicketsStore((s) => s.queue);
  const removeJob = useTicketsStore((s) => s.removeJob);
  const lastSync = useTicketsStore((s) => s.lastSync);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1) Pull: refresco cada 5 min mientras la app está activa
  useEffect(() => {
    async function pull() {
      try {
        const res = await fetchWithFilters({
          originWorkOrder: OriginWorkOrder.Quality,
          stateWorkOrder: [StateWorkOrder.Open],
          userType: null,
        });
        if (res) {
          const finalData = res
            .sort(
              (a, b) => +new Date(b.creationTime) - +new Date(a.creationTime)
            )
            .filter((x) => x.active === true && !x.derivedCorrectiveId);
          setTickets(finalData);
        }
      } catch {}
    }

    function start() {
      // primer pull si no se ha sincronizado hace rato
      if (!lastSync || Date.now() - lastSync > FIVE_MIN) pull();
      timerRef.current = setInterval(pull, FIVE_MIN);
    }
    function stop() {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    const subApp = AppState.addEventListener("change", (state) => {
      if (state === "active") start();
      else stop();
    });

    start();
    return () => {
      stop();
      subApp.remove();
    };
  }, [fetchWithFilters, setTickets, lastSync]);

  // 2) Push: procesa la cola cuando hay conexión
  useEffect(() => {
    const sub = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        // Procesar FIFO
        for (const job of queue) {
          try {
            if (job.type === "CREATE_CORRECTIVE") {
              await createRepairWorkOrder(job.payload);
            }
            removeJob(job.id);
          } catch {
            // si falla, deja el job (reintento en la próxima)
            break;
          }
        }
      }
    });
    return () => sub();
  }, [queue, createRepairWorkOrder, removeJob]);
}
