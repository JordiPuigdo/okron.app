import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { WorkOrderTimeType } from "@interfaces/WorkOrder";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

interface Props {
  isCRM: boolean;
  timeType: WorkOrderTimeType;
  setTimeType: (type: WorkOrderTimeType) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onManualEntry: () => void;
}

export const WorkOrderTimeControls: React.FC<Props> = ({
  isCRM,
  timeType,
  setTimeType,
  isRunning,
  onStart,
  onStop,
  onManualEntry,
}) => {
  return (
    <View style={styles.controlContainer}>
      {isCRM && (
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              timeType === WorkOrderTimeType.Travel && styles.typeButtonActive,
            ]}
            onPress={() => setTimeType(WorkOrderTimeType.Travel)}
            disabled={isRunning}
          >
            <MaterialIcons
              name="directions-car"
              size={26}
              color={
                timeType === WorkOrderTimeType.Travel
                  ? "#fff"
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
              name="build"
              size={26}
              color={
                timeType === WorkOrderTimeType.Time
                  ? "#fff"
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
      )}

      {/* 🔘 Botones principales: Start / Stop / Manual */}
      <View style={styles.buttonRow}>
        {" "}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isRunning ? styles.disabledButton : styles.startButton,
          ]}
          onPress={onStart}
          disabled={isRunning}
        >
          <MaterialIcons name="play-arrow" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !isRunning ? styles.disabledButton : styles.stopButton,
          ]}
          onPress={onStop}
          disabled={!isRunning}
        >
          <MaterialIcons name="stop" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isRunning ? styles.disabledButton : styles.manualButton,
          ]}
          onPress={onManualEntry}
          disabled={isRunning}
        >
          <FontAwesome5 name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlContainer: {
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#f4f6f8",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#c3ccd6",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  typeButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#e1e5eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b0b8c2",
  },
  typeButtonActive: {
    backgroundColor: "#0d8de0",
    borderColor: "#0d8de0",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    width: 90,
    height: 90,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  startButton: {
    backgroundColor: "#28a745",
  },
  stopButton: {
    backgroundColor: "#dc3545",
  },
  manualButton: {
    backgroundColor: "#0d8de0",
  },
  disabledButton: {
    backgroundColor: "#9aa4b1",
  },
});
