import { OperatorType } from "@interfaces/Operator";
import {
  AddWorkOrderOperatorTimes,
  StateWorkOrder,
  WorkOrderOperatorTimes,
} from "@interfaces/WorkOrder";
import { formatTimeSpan } from "@utils/workorderUtils";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { ManualEntryModal } from "@components/workorder/ManualEntryModal";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { useAuthStore } from "@store/authStore";
import { theme } from "styles/theme";

dayjs.extend(duration);

interface Props {
  workerTimes: WorkOrderOperatorTimes[];
  onCreate: (created: WorkOrderOperatorTimes) => void;
  onFinalize(operatorId: string): void;
  workOrderId: string;
}

export const WorkOrderOperatorTimesComponent: React.FC<Props> = ({
  workerTimes,
  onCreate,
  onFinalize,
  workOrderId,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(
    workerTimes.find(
      (t) =>
        t.endTime == null &&
        t.operator.id.toLocaleLowerCase() ==
          useAuthStore.getState().factoryWorker.id.toLocaleLowerCase()
    ) !== undefined
  );

  /*const { updateWorkOrderOperatorTimes, addWorkOrderOperatorTimes } =
    useWorkOrders();*/

  const { updateStateWorkOrder } = useWorkOrders();

  const updateState = async (state: StateWorkOrder) => {
    const updated = workerTimes.map((t) => ({
      ...t,
      state,
    }));

    await updateStateWorkOrder([
      {
        workOrderId: workOrderId,
        state,
        operatorId: useAuthStore.getState().factoryWorker.id,
      },
    ]);

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
    };

    //  onCreate(newData);
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
    };

    const newData: AddWorkOrderOperatorTimes = {
      WorkOrderId: workOrderId,
      startTime: startTimeRef.current,
      operatorId: useAuthStore.getState().factoryWorker.id,
      workOrderOperatorTimesId: newRecord.id,
    };

    //const recordInserted = await addWorkOrderOperatorTimes(newData);
    updateState(StateWorkOrder.OnGoing);

    newRecord.id = Math.random().toString();
    onCreate(newRecord);
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
      /*updateWorkOrderOperatorTimes({
        workOrderId: workOrderId,
        startTime: time.startTime,
        endTime: time.endTime,
        workOrderOperatorTimesId: time.id,
      });*/
      updateState(StateWorkOrder.Paused);
    }
  };

  const renderItem = ({ item }: { item: WorkOrderOperatorTimes }) => {
    return (
      <View style={theme.commonStyles.timeCard}>
        <Text style={theme.commonStyles.operatorName}>
          {item.operator.name}
        </Text>

        <View style={theme.commonStyles.timeRow}>
          <View style={theme.commonStyles.timeColumn}>
            <Text style={theme.commonStyles.timeValue}>
              {dayjs(item.startTime).format("DD/MM/YYYY")}
            </Text>
            <Text style={theme.commonStyles.timeValue}>
              {dayjs(item.startTime).format("HH:mm:ss")}
            </Text>
          </View>

          <View style={theme.commonStyles.timeColumn}>
            <Text style={theme.commonStyles.timeValue}>
              {dayjs(item.startTime).format("DD/MM/YYYY")}
            </Text>
            <Text style={theme.commonStyles.timeValue}>
              {item.endTime ? dayjs(item.endTime).format("HH:mm:ss") : "--"}
            </Text>
          </View>

          <View style={theme.commonStyles.timeColumn}>
            <Text style={theme.commonStyles.timeValue}>
              {getTimeSpan(item)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getTimeSpan = (item: WorkOrderOperatorTimes) => {
    if (item.totalTime && item.totalTime.includes(":")) {
      return formatTimeSpan(item.totalTime);
    }
    if (item.totalTime) {
      const start = dayjs(item.startTime);
      const end = dayjs(item.endTime);
      const diffInMs = end.diff(start);
      const dur = dayjs.duration(diffInMs);

      const hours = String(Math.floor(dur.asHours())).padStart(2, "0");
      const minutes = String(dur.minutes()).padStart(2, "0");
      const seconds = String(dur.seconds()).padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    }
    return "--:--:--";
  };

  const handleSaveManualEntry = async (start: Date, end: Date) => {
    const newRecord: WorkOrderOperatorTimes = {
      id: Math.random().toString(),
      startTime: start,
      endTime: end,
      totalTime: dayjs(start).diff(dayjs(end)).toString(),
      operator: {
        id: useAuthStore.getState().factoryWorker.id,
        name: useAuthStore.getState().factoryWorker.name,
        code: "1",
        priceHour: 0,
        operatorType: OperatorType.Maintenance,
        active: true,
      },
    };
    const newData: AddWorkOrderOperatorTimes = {
      WorkOrderId: workOrderId,
      startTime: start,
      operatorId: useAuthStore.getState().factoryWorker.id,
      workOrderOperatorTimesId: newRecord.id,
    };

    /*const recordInserted = await addWorkOrderOperatorTimes(newData);

    newRecord.id = recordInserted.workOrderOperatorTimesId;

    await updateWorkOrderOperatorTimes({
      workOrderId: workOrderId,
      startTime: start,
      endTime: end,
      workOrderOperatorTimesId: newRecord.id,
    });*/

    onCreate(newRecord);
    setIsRunning(false);
  };

  return (
    <View style={theme.commonStyles.timeTrackerContainer}>
      <View style={theme.commonStyles.timeTrackerHeader}>
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

        <TouchableOpacity
          style={[
            theme.commonStyles.actionButton,
            theme.commonStyles.manualButton,
            isRunning && theme.commonStyles.disabledButton,
          ]}
          onPress={handleManualEntry}
          disabled={isRunning}
        >
          <FontAwesome5 name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={workerTimes}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={renderItem}
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
