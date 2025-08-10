import { OperatorType } from "@interfaces/Operator";
import {
  AddWorkOrderOperatorTimes,
  StateWorkOrder,
  WorkOrderOperatorTimes,
  WorkOrderTimeType,
} from "@interfaces/WorkOrder";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ManualEntryModal } from "@components/workorder/ManualEntryModal";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useOperators } from "@hooks/useOperator";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import { theme } from "styles/theme";
import { RenderItemTime } from "./RenderItemTime";

dayjs.extend(duration);

interface Props {
  workerTimes: WorkOrderOperatorTimes[];
  onCreate: (created: WorkOrderOperatorTimes) => void;
  onFinalize(operatorId: string): void;
  workOrderId: string;
  workerId?: string;
  onRemove?(id: string): void;
}

export const WorkOrderOperatorTimesComponent: React.FC<Props> = ({
  workerTimes,
  onCreate,
  onFinalize,
  workOrderId,
  workerId = undefined,
  onRemove,
}) => {
  const { updateStateWorkOrder } = useWorkOrders();
  const { isCRM } = configService.getConfigSync();

  const [timeType, setTimeType] = useState<WorkOrderTimeType>(
    isCRM ? WorkOrderTimeType.Travel : WorkOrderTimeType.Time
  );
  const currentWorkerId =
    workerId ?? useAuthStore.getState().factoryWorker.id.toLocaleLowerCase();

  const [isRunning, setIsRunning] = useState<boolean>(
    workerTimes.find(
      (t) =>
        t.endTime == null &&
        t.operator.id.toLocaleLowerCase() == currentWorkerId
    ) !== undefined
  );

  const {
    updateWorkOrderOperatorTimes,
    addWorkOrderOperatorTimes,
    deleteWorkerTimes,
  } = useWorkOrders();
  const { operators } = useOperators();

  const safeUpdateState = useCallback(
    async (state: StateWorkOrder) => {
      try {
        await updateStateWorkOrder([
          {
            workOrderId,
            state,
            operatorId: workerId ?? useAuthStore.getState().factoryWorker.id,
          },
        ]);
      } catch (error) {
        console.error("updateStateWorkOrder failed:", error);
      }
    },
    [workOrderId]
  );

  const updateState = async (state: StateWorkOrder) => {
    safeUpdateState(state);
    if (state == StateWorkOrder.OnGoing) {
      const newData: WorkOrderOperatorTimes = {
        id: Math.random().toString(),
        operator: {
          id: useAuthStore.getState().factoryWorker.id,
          name: useAuthStore.getState().factoryWorker.name,
          code: "1",
          priceHour: 0,
          operatorType: OperatorType.Maintenance,
          active: true,
        },
        totalTime: null,
        endTime: null,
        startTime: startTimeRef.current,
        type: timeType,
      };
      onCreate(newData);
    }
  };

  const startTimeRef = useRef<Date | null>(null);

  const handleStart = async () => {
    if (isRunning) return;
    startTimeRef.current = new Date();
    setIsRunning(true);
    const newRecord: WorkOrderOperatorTimes = {
      id: Math.random().toString(),
      startTime: startTimeRef.current,
      endTime: null,
      totalTime: null,
      operator: {
        id: useAuthStore.getState().factoryWorker.id,
        name: useAuthStore.getState().factoryWorker.name,
        code: "1",
        priceHour: 0,
        operatorType: OperatorType.Maintenance,
        active: true,
      },
      type: timeType,
    };
    console.log("Starting time tracking:", newRecord);
    /*const newData: AddWorkOrderOperatorTimes = {
      WorkOrderId: workOrderId,
      startTime: startTimeRef.current,
      operatorId: useAuthStore.getState().factoryWorker.id,
      workOrderOperatorTimesId: newRecord.id,
    };*/

    //const recordInserted = await addWorkOrderOperatorTimes(newData);
    updateState(StateWorkOrder.OnGoing);

    newRecord.id = Math.random().toString();
    //onCreate(newRecord);
  };

  const handleStop = () => {
    handleFinalize(useAuthStore.getState().factoryWorker.id);
    onFinalize(useAuthStore.getState().factoryWorker.id);

    setIsRunning(false);
  };
  const [modalVisible, setModalVisible] = useState(false);

  const handleManualEntry = () => {
    setModalVisible(true);
  };

  const handleFinalize = (operatorId: string) => {
    const time = workerTimes.find(
      (t) => t.operator.id === operatorId && t.endTime == null
    );
    if (time) {
      time.endTime = new Date();
      time.totalTime = dayjs(time.endTime)
        .diff(dayjs(time.startTime))
        .toString();
      updateWorkOrderOperatorTimes({
        workOrderId: workOrderId,
        startTime: time.startTime,
        endTime: time.endTime,
        workOrderOperatorTimesId: time.id,
      });
      safeUpdateState(StateWorkOrder.Paused);
    }
  };

  const handleSaveManualEntry = async (start: Date, end: Date) => {
    setModalVisible(false);
    const newRecord: WorkOrderOperatorTimes = {
      id: Math.random().toString(),
      startTime: start,
      endTime: end,
      totalTime: dayjs(start).diff(dayjs(end)).toString(),
      operator: {
        id: workerId ?? useAuthStore.getState().factoryWorker.id,
        name: workOrderId
          ? operators.find((o) => o.id === workerId)?.name
          : useAuthStore.getState().factoryWorker.name,
        code: "1",
        priceHour: 0,
        operatorType: OperatorType.Maintenance,
        active: true,
      },
      type: timeType,
    };
    const newData: AddWorkOrderOperatorTimes = {
      WorkOrderId: workOrderId,
      startTime: start,
      operatorId: workerId ?? useAuthStore.getState().factoryWorker.id,
      workOrderOperatorTimesId: newRecord.id,
      type: timeType,
    };

    const recordInserted = await addWorkOrderOperatorTimes(newData);

    newRecord.id = recordInserted.workOrderOperatorTimesId;

    await updateWorkOrderOperatorTimes({
      workOrderId: workOrderId,
      startTime: start,
      endTime: end,
      workOrderOperatorTimesId: newRecord.id,
    });

    onCreate(newRecord);
    setIsRunning(false);
  };

  const handleDeleteTime = async (id: string) => {
    Alert.alert("¿Está vols eliminar el registre?", null, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", onPress: () => handleDelete(id) },
    ]);
  };

  const handleDelete = async (id: string) => {
    await deleteWorkerTimes({
      workOrderId: workOrderId,
      workOrderOperatorTimesId: id,
    });

    Alert.alert("Registre eliminat");
    onRemove && onRemove(id);
  };

  return (
    <View style={theme.commonStyles.timeTrackerContainer}>
      <View
        style={[
          theme.commonStyles.timeTrackerHeader,
          { flexDirection: "column", gap: 12 },
        ]}
      >
        {/* Tipo de trabajo */}
        {isCRM && (
          <View style={[styles.typeSelectorContainer, { marginBottom: 8 }]}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                timeType === WorkOrderTimeType.Travel &&
                  styles.typeButtonActive,
              ]}
              onPress={() => setTimeType(WorkOrderTimeType.Travel)}
              disabled={isRunning}
            >
              <MaterialIcons
                name="directions-car"
                size={20}
                color={
                  timeType === WorkOrderTimeType.Travel
                    ? theme.colors.white
                    : theme.colors.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                timeType === WorkOrderTimeType.Time && styles.typeButtonActive,
              ]}
              onPress={() => setTimeType(WorkOrderTimeType.Time)}
              disabled={isRunning}
            >
              <MaterialIcons
                name="work"
                size={20}
                color={
                  timeType === WorkOrderTimeType.Time
                    ? theme.colors.white
                    : theme.colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Botones principales */}
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
        >
          <TouchableOpacity
            style={[
              theme.commonStyles.actionButton,
              isRunning
                ? theme.commonStyles.disabledButton
                : theme.commonStyles.startButton,
            ]}
            onPress={handleStart}
            disabled={isRunning}
          >
            <MaterialIcons
              name="play-arrow"
              size={28}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              theme.commonStyles.actionButton,
              !isRunning
                ? theme.commonStyles.disabledButton
                : theme.commonStyles.stopButton,
            ]}
            onPress={handleStop}
            disabled={!isRunning}
          >
            <MaterialIcons name="stop" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Entrada manual */}
        <TouchableOpacity
          style={[
            theme.commonStyles.actionButton,
            theme.commonStyles.manualButton,
            isRunning && theme.commonStyles.disabledButton,
            { marginTop: 12 },
          ]}
          onPress={handleManualEntry}
          disabled={isRunning}
        >
          <FontAwesome5 name="plus" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workerTimes}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <RenderItemTime item={item} onDelete={handleDeleteTime} />
        )}
        contentContainerStyle={theme.commonStyles.listContent}
      />

      <ManualEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveManualEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeIcon: {
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.white,
  },
});
