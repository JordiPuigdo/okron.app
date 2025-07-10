import { InspectionPointsSection } from "@components/InspectionPoints/inspectionPointsSection";
import { SparePartsSection } from "@components/spareparts/SparepartSection";
import { CommentsSection } from "@components/workorder/CommentSection";
import { TabBar } from "@components/workorder/TabBar";
import { TabKey } from "@components/workorder/utils";
import { WorkOrderOperatorTimesComponent } from "@components/WorkOrderOperatorTimes/WorkOrderOperatorTimesComponent";
import { Ionicons } from "@expo/vector-icons";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { OperatorType } from "@interfaces/Operator";
import {
  StateWorkOrder,
  WorkOrder,
  WorkOrderInspectionPoint,
  WorkOrderOperatorTimes,
  WorkOrderType,
} from "@interfaces/WorkOrder";
import { Text } from "@react-navigation/elements";
import { useAuthStore } from "@store/authStore";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

export default function WorkOrderDetail() {
  const { id } = useLocalSearchParams();
  const { fetchById } = useWorkOrders();
  const authStore = useAuthStore();
  const [workOrder, setWorkOrder] = React.useState<WorkOrder | undefined>(
    undefined
  );
  const [inspectionPoints, setInspectionPoints] = useState<
    WorkOrderInspectionPoint[]
  >([]);
  const [operatorTimes, setOperatorTimes] = useState<WorkOrderOperatorTimes[]>(
    []
  );

  //const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("inspection");

  const { updateStateWorkOrder } = useWorkOrders();

  const fetchData = async (workOrderId: string) => {
    try {
      const data = await fetchById(workOrderId);
      setWorkOrder(data);
      setInspectionPoints(data.workOrderInspectionPoint ?? []);
      setOperatorTimes(data.workOrderOperatorTimes ?? []);
      setActiveTab(
        data.workOrderType === WorkOrderType.Corrective
          ? "comments"
          : "inspection"
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      //  setTimeout(() => setIsLoading(false), 1000);
    }
  };
  useEffect(() => {
    if (id) {
      fetchData(id as string);
    }
  }, [id]);

  const handleFinalize = (operatorId: string) => {
    const time = operatorTimes.find(
      (t) => t.operator.id === operatorId && t.endTime == null
    );
    if (time) {
      time.endTime = new Date();
      time.totalTime = dayjs(time.endTime)
        .diff(dayjs(time.startTime))
        .toString();
      setOperatorTimes([...operatorTimes]);
    }
  };

  const handleUpdateState = async (state: StateWorkOrder) => {
    const updated = workOrder.workOrderOperatorTimes?.map((t) => ({
      ...t,
      state,
    }));

    await updateStateWorkOrder([
      {
        workOrderId: workOrder.id,
        state,
        operatorId: authStore.factoryWorker.id,
      },
    ]);
    setOperatorTimes(updated ?? []);
    if (state === StateWorkOrder.Finished) {
      alert("Ordre finalitzada correctament!");
    } else {
      alert("Ordre oberta correctament!");
    }
    router.push("/workorders");
  };

  return (
    <SafeAreaView style={theme.commonStyles.mainContainer}>
      <View style={theme.commonStyles.header}>
        <View style={{ flex: 1 }}>
          {workOrder ? (
            <Text style={theme.commonStyles.headerText}>
              {workOrder.code} - {workOrder.description}
            </Text>
          ) : (
            <Text style={theme.commonStyles.headerText}>
              Carregant ordre...
            </Text>
          )}
        </View>

        {workOrder && workOrder.stateWorkOrder === StateWorkOrder.Finished ? (
          <TouchableOpacity
            onPress={handleUpdateState.bind(null, StateWorkOrder.Waiting)}
            style={[
              theme.commonStyles.finishButton,
              { backgroundColor: theme.colors.warning },
            ]}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          // Botón para finalizar (cuando no está finalizada)
          <TouchableOpacity
            onPress={handleUpdateState.bind(null, StateWorkOrder.Finished)}
            style={theme.commonStyles.finishButton}
          >
            <Ionicons name="checkmark-done" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {workOrder && (
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          workOrderType={workOrder.workOrderType}
        />
      )}

      <View style={theme.commonStyles.content}>
        {activeTab === "inspection" && workOrder && (
          <InspectionPointsSection
            inspectionPoints={inspectionPoints}
            onUpdate={setInspectionPoints}
            workOrderId={workOrder.id}
          />
        )}
        {activeTab === "comments" && workOrder && (
          <CommentsSection
            comments={workOrder.workOrderComments ?? []}
            workOrderId={workOrder.id}
            onAddComment={(commentText) => {
              setWorkOrder((prev) => ({
                ...prev,
                workOrderComments: [
                  ...(prev.workOrderComments ?? []),
                  {
                    id: Math.random().toString(),
                    creationDate: new Date().toISOString(),
                    comment: commentText,
                    operator: {
                      id: authStore.factoryWorker.id,
                      code: "",
                      name: authStore.factoryWorker.name,
                      priceHour: 0,
                      operatorType: OperatorType.Maintenance,
                      active: true,
                    },
                  },
                ],
              }));
            }}
          />
        )}

        {activeTab === "spareParts" && workOrder && (
          <SparePartsSection workOrder={workOrder} />
        )}
        {activeTab === "times" && workOrder && (
          <WorkOrderOperatorTimesComponent
            workerTimes={operatorTimes}
            onCreate={(create) => {
              setOperatorTimes([...operatorTimes, create]);
            }}
            onFinalize={handleFinalize}
            workOrderId={workOrder.id}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
