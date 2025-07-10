import { MaterialIcons } from "@expo/vector-icons";
import { WorkOrder, WorkOrderType } from "@interfaces/WorkOrder";
import { translateStateWorkOrder } from "@utils/workorderUtils";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

type Props = {
  workOrder: WorkOrder;
  onPress?: (id: string) => void;
};
const stateColors: Record<number, string> = {
  0: "#FFA500",
  1: "#007BFF",
  2: "#4CD964",
  3: "#FF3B30",
  4: "#8E8E93",
  5: "#FFD700",
  6: "#9C27B0",
  7: "#FF69B4",
};

export const WorkOrderItem = ({ workOrder, onPress }: Props) => {
  const router = useRouter();

  const getIcon = () => {
    if (workOrder.workOrderType === WorkOrderType.Preventive) {
      return (
        <View style={theme.commonStyles.iconContainer}>
          <MaterialIcons name="build-circle" size={35} color="#007BFF" />

          <Text style={theme.commonStyles.title}>
            {workOrder.code} - {workOrder.description}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={theme.commonStyles.iconContainer}>
          <MaterialIcons name="error" size={35} color="#FF3B30" />
          <Text style={theme.commonStyles.title}>
            {workOrder.code} - {workOrder.description}
          </Text>
        </View>
      );
    }
  };

  const stateColor = stateColors[workOrder.stateWorkOrder] || "#000000";
  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(workOrder.id) : undefined}
      style={theme.commonStyles.container}
    >
      <View style={theme.commonStyles.infoContainer}>
        {getIcon()}

        <Text style={theme.commonStyles.subtitle}>
          {workOrder.asset?.code ?? ""} - {workOrder.asset?.description ?? ""}
        </Text>
        <Text style={theme.commonStyles.subtitle}>
          {dayjs(workOrder.startTime).format("DD/MM/YYYY")}
        </Text>
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
