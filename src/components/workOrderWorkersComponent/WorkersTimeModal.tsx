import { WorkOrderOperatorTimesComponent } from "@components/WorkOrderOperatorTimes/WorkOrderOperatorTimesComponent";
import { MaterialIcons } from "@expo/vector-icons";
import { useWorkerTimes } from "@hooks/useWorkerTimes";
import { WorkOrder } from "@interfaces/WorkOrder";
import React, { useEffect, useMemo } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

interface Props {
  operatorId: string | undefined;
  workorder: WorkOrder;
  setOperatorId: (id: string | undefined) => void;
}

const WorkersTimeModal = ({ operatorId, workorder, setOperatorId }: Props) => {
  const { workerTimes, setWorkerTimes, handleFinalize } = useWorkerTimes();

  const filteredWorkerTimes = useMemo(() => {
    if (!operatorId) return [];

    // Obtén los tiempos del workorder
    const fromWorkOrder =
      workorder.workOrderOperatorTimes?.filter(
        (t) => t.operator.id === operatorId
      ) || [];

    // Crea una copia para modificar
    let combined = [...fromWorkOrder];
    console.log("Combined:", combined);

    // Filtra los que se han eliminado del estado local
    const localTimeIds = new Set(workerTimes.map((t) => t.id));
    combined = combined.filter((t) => localTimeIds.has(t.id));

    // Añade los nuevos que solo están en el estado local
    workerTimes.forEach((localTime) => {
      if (!combined.some((t) => t.id === localTime.id)) {
        combined.push(localTime);
      }
    });

    return combined;
  }, [
    operatorId,
    workorder.workOrderOperatorTimes,
    workerTimes,
    setWorkerTimes,
  ]);

  useEffect(() => {
    if (operatorId && workorder.workOrderOperatorTimes) {
      const activeTimes = workorder.workOrderOperatorTimes.filter(
        (t) => t.operator.id === operatorId && !t.endTime
      );
      setWorkerTimes(activeTimes);
    }
  }, [operatorId, workorder.id]);

  const handleCreate = (newRecord: any) => {
    setWorkerTimes((prev) => [...prev, newRecord]);
  };

  const handleClose = () => {
    setOperatorId(undefined);
    setWorkerTimes([]);
  };

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
              {filteredWorkerTimes[0]?.operator.name || "Registre de temps"}
            </Text>
          </View>

          <WorkOrderOperatorTimesComponent
            onCreate={handleCreate}
            onFinalize={(id) => {
              handleFinalize(id);
              if (workorder.workOrderOperatorTimes) {
                setWorkerTimes(
                  workorder.workOrderOperatorTimes.filter(
                    (t) => t.operator.id === operatorId && !t.endTime
                  )
                );
              }
            }}
            onRemove={(id) => {
              setWorkerTimes((prev) => prev.filter((t) => t.id !== id));
            }}
            workOrderId={workorder.id}
            workerTimes={filteredWorkerTimes}
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
    marginLeft: -24, // Compensa el espacio del botón
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
