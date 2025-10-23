import { useWorkOrders } from "@hooks/useWorkOrders";
import { WorkOrder } from "@interfaces/WorkOrder";
import React from "react";
import { ScrollView } from "react-native";
import { WorkOrderCard } from "./WorkOrderCard";

interface Props {
  workOrder: WorkOrder;
}

export const WorkOrderSummary: React.FC<Props> = ({ workOrder }) => {
  const [workOrderCreated, setWorkOrderCreated] =
    React.useState<WorkOrder | null>(null);

  const { fetchById } = useWorkOrders();

  const fetchWorkOrderCreatedId = async (
    workOrderId: string
  ): Promise<WorkOrder> => {
    if (!workOrderId) return {} as WorkOrder;
    const workOrderMaintenance = await fetchById(workOrderId);
    if (!workOrderMaintenance) return {} as WorkOrder;
    return workOrderMaintenance;
  };

  React.useEffect(() => {
    let isMounted = true;
    //setLoading(true);
    if (!workOrder.workOrderCreatedId) return;
    fetchWorkOrderCreatedId(workOrder.workOrderCreatedId)
      .then((wo) => {
        if (isMounted) setWorkOrderCreated(wo);
      })
      .catch(() => {
        if (isMounted) setWorkOrderCreated(null);
      })
      .finally(() => {
        //if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [workOrder.id]);

  return (
    <ScrollView style={{ backgroundColor: "#f4f6f8", padding: 12 }}>
      {workOrder.id && (
        <WorkOrderCard workOrder={workOrder} showOperators={true} />
      )}

      {workOrderCreated && (
        <WorkOrderCard workOrder={workOrderCreated} showOperators={true} />
      )}
    </ScrollView>
  );
};
