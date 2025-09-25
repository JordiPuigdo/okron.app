import { WorkOrderOperatorTimesComponent } from "@components/WorkOrderOperatorTimes/WorkOrderOperatorTimesComponent";
import { MaterialIcons } from "@expo/vector-icons";
import { WorkOrder, WorkOrderOperatorTimes } from "@interfaces/WorkOrder";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

interface Props {
  operatorId: string | undefined;
  workorder: WorkOrder;
  setOperatorId: (id: string | undefined) => void;
}

const WorkersTimeModal = ({ operatorId, workorder, setOperatorId }: Props) => {
  const [localWorkerTimes, setLocalWorkerTimes] = useState<
    WorkOrderOperatorTimes[]
  >([]);

  // Sincronizar los tiempos locales con los del workorder cuando cambia el operatorId
  useEffect(() => {
    if (operatorId && workorder.workOrderOperatorTimes) {
      const operatorTimes = workorder.workOrderOperatorTimes.filter(
        (t) => t.operator.id === operatorId
      );
      setLocalWorkerTimes(operatorTimes);
    } else {
      setLocalWorkerTimes([]);
    }
  }, [operatorId, workorder.workOrderOperatorTimes]);

  // Obtener el operario actual
  const currentOperator = useMemo(() => {
    if (!operatorId) return null;
    return (
      workorder.workOrderOperatorTimes?.find((op) => op.id === operatorId) ||
      null
    );
  }, [operatorId, workorder.workOrderOperatorTimes]);

  const handleCreate = useCallback((newRecord: any) => {
    setLocalWorkerTimes((prev) => [...prev, newRecord]);
  }, []);

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
            endTime: endTime,
            totalTime: totalTime,
          };
        }
        return time;
      })
    );

    Alert.alert(
      "Temps finalitzat",
      "El registre de temps s'ha finalitzat correctament",
      [
        {
          text: "OK",
          onPress: () => console.log("Temps finalitzat"),
        },
      ]
    );
  }, []);

  const handleRemove = useCallback((timeId: string) => {
    setLocalWorkerTimes((prev) => prev.filter((time) => time.id !== timeId));
  }, []);

  const handleClose = useCallback(() => {
    setOperatorId(undefined);
  }, [setOperatorId]);

  return (
    <Modal transparent visible={operatorId !== undefined} animationType="fade">
      <View style={theme.commonStyles.backdrop}>
        <View style={styles.modalBox}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={theme.commonStyles.cancelButton}
              onPress={handleClose}
            >
              <MaterialIcons name="close" size={22} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              {currentOperator?.operator.name || "Registre de temps"}
            </Text>
          </View>

          <WorkOrderOperatorTimesComponent
            onCreate={handleCreate}
            onFinalize={handleFinalize}
            onRemove={handleRemove}
            workOrderId={workorder.id}
            workerTimes={localWorkerTimes}
            workerId={operatorId}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: -24,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    padding: 8,
    height: "80%",
    width: "90%",
    alignSelf: "center",
    marginTop: 40,
  },
});

export default WorkersTimeModal;
