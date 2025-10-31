import { WorkOrderOperatorTimesComponent } from "@components/WorkOrderOperatorTimes/WorkOrderOperatorTimesComponent";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { WorkOrder, WorkOrderOperatorTimes } from "@interfaces/WorkOrder";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { theme } from "styles/theme";

type RouteParams = {
  OperatorTimeManagement: {
    workOrderId: string;
    operatorId: string;
    operatorName: string;
  };
};

export const OperatorTimeManagementScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, "OperatorTimeManagement">>();

  const { workOrderId, operatorId, operatorName } = route.params;

  const { fetchById } = useWorkOrders();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [localWorkerTimes, setLocalWorkerTimes] = useState<
    WorkOrderOperatorTimes[]
  >([]);

  const loadWorkOrder = useCallback(async () => {
    try {
      const order = await fetchById(workOrderId);
      setWorkOrder(order);

      // Filtrar los tiempos del operario específico y guardarlos en el estado local
      if (order.workOrderOperatorTimes) {
        const operatorTimes = order.workOrderOperatorTimes.filter(
          (time) => time.operator.id === operatorId
        );
        setLocalWorkerTimes(operatorTimes);
      } else {
        setLocalWorkerTimes([]);
      }
    } catch (error) {
      console.error("Error loading work order:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
    }
  }, [workOrderId]);

  useEffect(() => {
    loadWorkOrder();
  }, [loadWorkOrder]);

  const handleFinalize = useCallback((timeId: string) => {
    setLocalWorkerTimes((prev) =>
      prev.map((time) => {
        if (time.id === timeId && !time.endTime) {
          const endTime = new Date();
          const startTime = new Date(time.startTime);
          const totalTime = (
            endTime.getTime() - startTime.getTime()
          ).toString();

          return {
            ...time,
            endTime,
            totalTime,
          };
        }
        return time;
      })
    );

    Alert.alert(
      "Temps finalitzat",
      "El registre de temps s'ha finalitzat correctament",
      [{ text: "OK" }]
    );
  }, []);

  const handleCreate = useCallback((newRecord: WorkOrderOperatorTimes) => {
    setLocalWorkerTimes((prev) => [...prev, newRecord]);
  }, []);

  if (!workOrder) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WorkOrderOperatorTimesComponent
        workerTimes={localWorkerTimes}
        onCreate={(r) => handleCreate(r)}
        onFinalize={(id) => handleFinalize(id)}
        workOrderId={workOrder.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default OperatorTimeManagementScreen;
