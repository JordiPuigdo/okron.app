// WorkOrderOperatorTimesComponent.tsx

import { OperatorType } from "@interfaces/Operator";
import {
  StateWorkOrder,
  WorkOrderOperatorTimes,
  WorkOrderTimeType,
} from "@interfaces/WorkOrder";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
  workerId,
  onRemove,
}) => {
  const { updateStateWorkOrder } = useWorkOrders();
  const { isCRM } = configService.getConfigSync();

  const store = useAuthStore.getState();
  const authedWorker = store.factoryWorker;
  const currentWorkerId = (workerId ?? authedWorker.id).toLowerCase();

  const [timeType, setTimeType] = useState<WorkOrderTimeType>(
    isCRM ? WorkOrderTimeType.Travel : WorkOrderTimeType.Time
  );

  const isRunning = useMemo(
    () =>
      workerTimes.some(
        (t) =>
          t.endTime == null && t.operator.id.toLowerCase() === currentWorkerId
      ),
    [workerTimes, currentWorkerId]
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
            operatorId: workerId ?? authedWorker.id,
          },
        ]);
      } catch (error) {
        console.error("updateStateWorkOrder failed:", error);
      }
    },
    [workOrderId, workerId, authedWorker.id, updateStateWorkOrder]
  );

  // IMPORTANT: don't create items inside updateState (it caused duplicates)
  const updateState = async (state: StateWorkOrder) => {
    await safeUpdateState(state);
  };

  const startTimeRef = useRef<Date | null>(null);

  const handleStart = async () => {
    if (isRunning) return;

    startTimeRef.current = new Date();

    await updateState(StateWorkOrder.OnGoing);

    // Create exactly ONCE here (no duplicate add)
    const localId = `local-${Date.now()}`; // stable client id
    const newRecord: WorkOrderOperatorTimes = {
      id: localId,
      startTime: startTimeRef.current,
      endTime: null,
      totalTime: null,
      operator: {
        id: authedWorker.id,
        name: authedWorker.name,
        code: "1",
        priceHour: 0,
        operatorType: OperatorType.Maintenance,
        active: true,
      },
      type: timeType,
    };

    onCreate(newRecord);
  };

  const handleStop = () => {
    const me = authedWorker.id;
    handleFinalize(me);
    onFinalize(me);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const handleManualEntry = () => setModalVisible(true);

  const handleFinalize = async (operatorId: string) => {
    const time = workerTimes.find(
      (t) => t.operator.id === operatorId && t.endTime == null
    );
    if (!time) return;

    const end = new Date();
    const start = time.startTime ? new Date(time.startTime) : end;

    const totalMs = dayjs(end).diff(dayjs(start));
    const updated = {
      ...time,
      endTime: end,
      totalTime: String(totalMs),
    };

    await updateWorkOrderOperatorTimes({
      workOrderId,
      startTime: updated.startTime!,
      endTime: updated.endTime!,
      type: updated.type,
      workOrderOperatorTimesId: updated.id,
    });

    await safeUpdateState(StateWorkOrder.Paused);
  };

  const handleSaveManualEntry = async (start: Date, end: Date) => {
    setModalVisible(false);

    const totalMs = dayjs(end).diff(dayjs(start));

    const localId = `local-${Date.now()}`;
    const opName = workerId
      ? operators.find((o) => o.id === workerId)?.name ?? authedWorker.name
      : authedWorker.name;

    const newRecord: WorkOrderOperatorTimes = {
      id: localId,
      startTime: start,
      endTime: end,
      totalTime: String(totalMs),
      operator: {
        id: workerId ?? authedWorker.id,
        name: opName,
        code: "1",
        priceHour: 0,
        operatorType: OperatorType.Maintenance,
        active: true,
      },
      type: timeType,
    };

    // Insert shell row on the backend
    const inserted = await addWorkOrderOperatorTimes({
      WorkOrderId: workOrderId,
      startTime: start,
      operatorId: workerId ?? authedWorker.id,
      workOrderOperatorTimesId: newRecord.id,
      type: timeType,
    });

    const serverId = inserted.workOrderOperatorTimesId ?? newRecord.id;

    await updateWorkOrderOperatorTimes({
      workOrderId,
      startTime: start,
      endTime: end,
      type: timeType,
      workOrderOperatorTimesId: serverId,
    });

    newRecord.endTime = end;
    newRecord.id = serverId;

    onCreate(newRecord);
  };

  const handleDeleteTime = async (id: string) => {
    Alert.alert("¿Vols eliminar el registre?", undefined, [
      { text: "Cancel·lar", style: "cancel" },
      { text: "Eliminar", onPress: () => handleDelete(id) },
    ]);
  };

  const handleDelete = async (id: string) => {
    await deleteWorkerTimes({
      workOrderId,
      workOrderOperatorTimesId: id,
    });
    Alert.alert("Registre eliminat");
    onRemove?.(id);
  };

  return (
    <>
      <FlatList
        data={workerTimes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RenderItemTime item={item} onDelete={handleDeleteTime} />
        )}
        ListHeaderComponent={
          <View style={styles.controlRow}>
            {isCRM ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    timeType === WorkOrderTimeType.Travel &&
                      styles.activeButtonBlue,
                  ]}
                  onPress={() => setTimeType(WorkOrderTimeType.Travel)}
                  disabled={isRunning}
                >
                  <MaterialIcons
                    name="directions-car"
                    size={22}
                    color={
                      timeType === WorkOrderTimeType.Travel
                        ? "#fff"
                        : theme.colors.textSecondary
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    timeType === WorkOrderTimeType.Time &&
                      styles.activeButtonGreen,
                  ]}
                  onPress={() => setTimeType(WorkOrderTimeType.Time)}
                  disabled={isRunning}
                >
                  <MaterialIcons
                    name="build"
                    size={22}
                    color={
                      timeType === WorkOrderTimeType.Time
                        ? "#ffff"
                        : theme.colors.textSecondary
                    }
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    isRunning
                      ? styles.disabledButton
                      : styles.activeButtonGreen,
                  ]}
                  onPress={handleStart}
                  disabled={isRunning}
                >
                  <MaterialIcons name="play-arrow" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    !isRunning ? styles.disabledButton : styles.activeButtonRed,
                  ]}
                  onPress={handleStop}
                  disabled={!isRunning}
                >
                  <MaterialIcons name="stop" size={26} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.iconButton,
                isRunning ? styles.disabledButton : styles.activeButtonGray,
              ]}
              onPress={handleManualEntry}
              disabled={isRunning}
            >
              <FontAwesome5 name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={theme.commonStyles.listContent}
        // (Optional perf tunings)
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={8}
      />
      <ManualEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(!!!modalVisible)}
        onSave={function (startTime: Date, endTime: Date): void {
          handleSaveManualEntry(startTime, endTime);
        }}
        type={timeType}
      />
    </>
  );
};

const styles = StyleSheet.create({
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#e1e5eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
  },
  activeButtonBlue: { backgroundColor: "#0d8de0" },
  activeButtonGreen: { backgroundColor: "#28a745" },
  activeButtonRed: { backgroundColor: "#dc3545" },
  activeButtonGray: { backgroundColor: "#6c757d" },
  disabledButton: { backgroundColor: "#a0a7b3" },
});
