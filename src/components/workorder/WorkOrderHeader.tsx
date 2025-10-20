// components/workorder/WorkOrderHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { OperatorType } from "@interfaces/Operator";
import { StateWorkOrder } from "@interfaces/WorkOrder";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

interface Props {
  title: string;
  state: StateWorkOrder;
  isCRM: boolean;
  onFinish: () => void;
  onNotFinished?: () => void;
  onSign?: () => void;
  operatorType?: OperatorType;
}

export const WorkOrderHeader = ({
  title,
  state,
  isCRM,
  onFinish,
  onNotFinished,
  onSign,
  operatorType,
}: Props) => {
  function isClosedWO() {
    if (operatorType === OperatorType.Maintenance) {
      return (
        state === StateWorkOrder.Finished ||
        state === StateWorkOrder.PendingToValidate
      );
    }
    if (operatorType === OperatorType.Quality) {
      return (
        state === StateWorkOrder.Finished || state === StateWorkOrder.Closed
      );
    }
  }

  const isClosed = isClosedWO();

  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Ionicons name="clipboard" size={26} color={theme.colors.primary} />
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>

      <View style={styles.actions}>
        {isCRM && !isClosed && (
          <ActionButton
            icon="close"
            color={theme.colors.error}
            label="No Finalitzada"
            onPress={onNotFinished}
          />
        )}
        <ActionButton
          icon={isClosed ? "refresh" : "checkmark-done"}
          color={theme.colors.success}
          label={isClosed ? "Reobrir" : "Finalitzar"}
          onPress={onFinish}
        />
        {isCRM && isClosed && (
          <ActionButton
            icon="create"
            color={theme.colors.warning}
            label="Firma"
            onPress={onSign}
          />
        )}
      </View>
    </View>
  );
};

const ActionButton = ({
  icon,
  color,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons name={icon} size={22} color="#fff" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  titleBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
});
