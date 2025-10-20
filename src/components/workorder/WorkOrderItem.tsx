import { MaterialIcons } from "@expo/vector-icons";
import { WorkOrder, WorkOrderType } from "@interfaces/WorkOrder";
import { configService } from "@services/configService";
import { translateStateWorkOrder } from "@utils/workorderUtils";
import dayjs from "dayjs";
import * as Linking from "expo-linking";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

export enum WorkOrderPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "#5EC269", // verde
  [WorkOrderPriority.Medium]: "#F4D176", // amarillo
  [WorkOrderPriority.High]: "#DD524C", // naranja
  [WorkOrderPriority.Critical]: "#C0392B", // rojo
};

const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "Baixa",
  [WorkOrderPriority.Medium]: "Mitja",
  [WorkOrderPriority.High]: "Alta",
  [WorkOrderPriority.Critical]: "Crítica",
};

type Props = {
  workOrder: WorkOrder;
  onPress?: (id: string) => void;
};

export const stateColors: Record<number, string> = {
  0: "#FFA500",
  1: "#007BFF",
  2: "#FF3B30",
  3: "#4CD964",
  4: "#8E8E93",
  5: "#FFD700",
  6: "#FFA500",
  7: "#FF69B4",
  8: "#9C27B0",
};

const getIcon = (workOrder: WorkOrder, isCRM?: boolean) => {
  const isPreventive = workOrder.workOrderType === WorkOrderType.Preventive;
  const iconName = isPreventive ? "build-circle" : "error";
  const iconColor = isPreventive ? "#007BFF" : "#FF3B30";

  return (
    <View style={theme.commonStyles.iconContainer}>
      <MaterialIcons name={iconName} size={35} color={iconColor} />
      <Text style={theme.commonStyles.title}>
        {workOrder.code} -{" "}
        {workOrder.description
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 50)
          .concat(workOrder.description.trim().length > 50 ? "..." : "")}
      </Text>
    </View>
  );
};

export const WorkOrderItem = ({ workOrder, onPress }: Props) => {
  const { isCRM } = configService.getConfigSync();
  const stateColor = stateColors[workOrder.stateWorkOrder] || "#000000";

  if (isCRM) {
    return <WorkOrderItemCRM workOrder={workOrder} onPress={onPress} />;
  }

  // 🟡 Mostrar prioridad solo si es tipo Ticket
  const showPriority = workOrder.workOrderType === WorkOrderType.Ticket;

  const priorityColor = PRIORITY_COLORS[workOrder.priority];
  const priorityLabel = PRIORITY_LABELS[workOrder.priority];

  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(workOrder.id) : undefined}
      style={theme.commonStyles.container}
      activeOpacity={0.85}
    >
      <View style={theme.commonStyles.infoContainer}>
        {getIcon(workOrder)}

        <Text style={theme.commonStyles.subtitle}>
          {workOrder.asset?.code ?? ""} - {workOrder.asset?.description ?? ""}
        </Text>
        <Text style={theme.commonStyles.subtitle}>
          {dayjs(workOrder.creationTime).format("DD/MM/YYYY")}
        </Text>
        <Text style={theme.commonStyles.subtitle}>
          {workOrder.originalWorkOrderCode ?? ""}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {/* Estado */}
        <View
          style={[
            theme.commonStyles.stateBadge,
            { backgroundColor: stateColor },
          ]}
        >
          <Text style={theme.commonStyles.stateBadgeText}>
            {translateStateWorkOrder(workOrder.stateWorkOrder)}
          </Text>
        </View>

        {/* Prioridad solo si Ticket */}
        {showPriority && (
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColor ?? "#444" },
            ]}
          >
            <Text style={styles.priorityText}>{priorityLabel}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const WorkOrderItemCRM = ({ workOrder, onPress }: Props) => {
  const stateColor = stateColors[workOrder.stateWorkOrder] || "#000000";

  const handleOpenMaps = () => {
    const address = getAddress();
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url);
  };

  const getAddress = () => {
    if (workOrder.customerWorkOrder.customerInstallationAddress) {
      return `${workOrder.customerWorkOrder.customerInstallationAddress.address}, ${workOrder.customerWorkOrder.customerInstallationAddress.city}, ${workOrder.customerWorkOrder.customerInstallationAddress.province}`;
    }
    return `${workOrder.customerWorkOrder.customerAddress.address}, ${
      workOrder.customerWorkOrder.customerAddress.city
    }, ${
      workOrder.customerWorkOrder.customerAddress.province !== null &&
      workOrder.customerWorkOrder.customerAddress.province
    }`;
  };

  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(workOrder.id) : undefined}
      style={theme.commonStyles.container}
    >
      <View style={theme.commonStyles.infoContainer}>
        {getIcon(workOrder, true)}
        <Text style={theme.commonStyles.subtitle}>
          Client: {workOrder.customerWorkOrder.customerName} -{" "}
          {dayjs(workOrder.creationTime).format("DD/MM/YYYY")}
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleOpenMaps();
          }}
          style={{ paddingVertical: 12, paddingHorizontal: 8 }}
        >
          <Text style={theme.commonStyles.linkText}>{getAddress()} </Text>
        </Pressable>
      </View>
      <View style={theme.commonStyles.rightContainer}>
        <View
          style={[
            theme.commonStyles.stateBadge,
            { backgroundColor: stateColor },
          ]}
        >
          <Text style={theme.commonStyles.stateBadgeText}>
            {translateStateWorkOrder(workOrder.stateWorkOrder)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 🎨 Estilos para prioridad
const styles = StyleSheet.create({
  rightContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  priorityBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
});
