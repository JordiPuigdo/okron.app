import { IncidentModal } from "@components/workorder/IncidentModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useWorkOrders } from "@hooks/useWorkOrders";
import {
  ResultInspectionPoint,
  StateWorkOrder,
  UpdateStateWorkOrder,
  WorkOrderInspectionPoint,
} from "@interfaces/WorkOrder";
import { useAuthStore } from "@store/authStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { theme } from "styles/theme";
import { ConfirmFinishModal } from "./ConfirmFinishModal";

interface Props {
  inspectionPoints: WorkOrderInspectionPoint[];
  onUpdate: (updated: WorkOrderInspectionPoint[]) => void;
  workOrderId?: string;
}

export const InspectionPointsSection: React.FC<Props> = ({
  inspectionPoints,
  onUpdate,
  workOrderId,
}) => {
  const [selectedPoint, setSelectedPoint] =
    useState<WorkOrderInspectionPoint | null>(null);

  const handleLongPress = (item: WorkOrderInspectionPoint) => {
    Vibration.vibrate(50);
    setSelectedPoint(item);
  };

  const { saveInspectionPointResult, updateStateWorkOrder, isLoading } =
    useWorkOrders();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const updateAll = (value: boolean | undefined) => {
    if (value === undefined) {
      inspectionPoints.forEach((element) => {
        saveInspectionPointResult({
          workOrderId: workOrderId ?? "",
          workOrderInspectionPointId: element.id,
          resultInspectionPoint: ResultInspectionPoint.Pending,
        });
      });
    } else {
      inspectionPoints.forEach((element) => {
        saveInspectionPointResult({
          workOrderId: workOrderId ?? "",
          workOrderInspectionPointId: element.id,
          resultInspectionPoint: value
            ? ResultInspectionPoint.Ok
            : ResultInspectionPoint.NOk,
        });
      });
    }

    const updated = inspectionPoints.map((p) => ({ ...p, check: value }));
    onUpdate(updated);

    if (value === true) {
      setShowConfirmModal(true);
    }
  };

  const togglePoint = (id: string, value: boolean) => {
    const updated = inspectionPoints.map((p) => {
      if (p.id === id) {
        const newValue = p.check === value ? undefined : value;

        return { ...p, check: newValue };
      }
      return p;
    });

    saveInspectionPointResult({
      workOrderId: workOrderId ?? "",
      workOrderInspectionPointId: id,
      resultInspectionPoint: value
        ? ResultInspectionPoint.Ok
        : ResultInspectionPoint.NOk,
    });
    onUpdate(updated);
  };

  const handleConfirmFinish = async () => {
    const data: UpdateStateWorkOrder = {
      workOrderId: workOrderId ?? "",
      state: StateWorkOrder.Finished,
      operatorId: useAuthStore.getState().factoryWorker.id,
    };
    try {
      await updateStateWorkOrder([data]);
    } catch (error) {
      console.error("Error al finalizar orden:", error);
      Alert.alert("Error", "No s'ha pogut finalitzar l'ordre.");
    } finally {
      setShowConfirmModal(false);
      router.push("/workorders");
    }
  };

  return (
    <View style={theme.commonStyles.inspectionSection}>
      <View style={theme.commonStyles.headerButtonsRow}>
        <TouchableOpacity
          style={[
            theme.commonStyles.statusButton,
            { backgroundColor: theme.colors.success },
          ]}
          onPress={() => updateAll(true)}
        >
          <Text style={theme.commonStyles.statusButtonText}>OK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            theme.commonStyles.statusButton,
            { backgroundColor: theme.colors.error },
          ]}
          onPress={() => updateAll(false)}
        >
          <Text style={theme.commonStyles.statusButtonText}>NOK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={theme.commonStyles.resetButton}
          onPress={() => updateAll(undefined)}
        >
          <MaterialIcons name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={inspectionPoints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.7}
          >
            <View style={theme.commonStyles.inspectionItem}>
              <Text style={theme.commonStyles.itemDescription}>
                {item.inspectionPoint.description}
              </Text>

              <View style={theme.commonStyles.itemActions}>
                <TouchableOpacity
                  style={[
                    theme.commonStyles.choiceButton,
                    item.check === true &&
                      theme.commonStyles.choiceButtonOkActive,
                  ]}
                  onPress={() => togglePoint(item.id, true)}
                >
                  <Text
                    style={
                      item.check === true
                        ? theme.commonStyles.choiceTextSelected
                        : theme.commonStyles.choiceText
                    }
                  >
                    OK
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    theme.commonStyles.choiceButton,
                    item.check === false &&
                      theme.commonStyles.choiceButtonNokActive,
                  ]}
                  onPress={() => togglePoint(item.id, false)}
                >
                  <Text
                    style={
                      item.check === false
                        ? theme.commonStyles.choiceTextSelected
                        : theme.commonStyles.choiceText
                    }
                  >
                    NOK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <IncidentModal
        visible={selectedPoint !== null}
        onClose={() => setSelectedPoint(null)}
        pointDescription={selectedPoint?.inspectionPoint.description ?? ""}
      />
      <ConfirmFinishModal
        visible={showConfirmModal}
        onConfirm={handleConfirmFinish}
        onCancel={() => setShowConfirmModal(false)}
      />
    </View>
  );
};
