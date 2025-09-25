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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

type Props = {
  workOrder: WorkOrder;
  onPress?: (id: string) => void;
};
const stateColors: Record<number, string> = {
  0: "#FFA500",
  1: "#007BFF",
  2: "#FF3B30",
  3: "#4CD964",
  4: "#8E8E93",
  5: "#FFD700",
  8: "#9C27B0",
  7: "#FF69B4",
};

const getIcon = (workOrder: WorkOrder, isCRM?: boolean) => {
  if (workOrder.workOrderType === WorkOrderType.Preventive) {
    return (
      <View style={theme.commonStyles.iconContainer}>
        <MaterialIcons name="build-circle" size={35} color="#007BFF" />

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
  } else {
    return (
      <View style={theme.commonStyles.iconContainer}>
        <MaterialIcons name="error" size={35} color="#FF3B30" />
        <Text style={theme.commonStyles.title}>
          {isCRM
            ? `${workOrder.code} - ${workOrder.description} - ${workOrder.refCustomerId}`
            : `${workOrder.code} - ${workOrder.description
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 50)
                .concat(
                  workOrder.description.trim().length > 50 ? "..." : ""
                )}`}
        </Text>
      </View>
    );
  }
};

export const WorkOrderItem = ({ workOrder, onPress }: Props) => {
  const { isCRM } = configService.getConfigSync();
  const stateColor = stateColors[workOrder.stateWorkOrder] || "#000000";
  if (isCRM) {
    return <WorkOrderItemCRM workOrder={workOrder} onPress={onPress} />;
  }
  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(workOrder.id) : undefined}
      style={theme.commonStyles.container}
    >
      <View style={theme.commonStyles.infoContainer}>
        {getIcon(workOrder)}

        <Text style={theme.commonStyles.subtitle}>
          {workOrder.asset?.code ?? ""} - {workOrder.asset?.description ?? ""}
        </Text>
        <Text style={theme.commonStyles.subtitle}>
          {dayjs(workOrder.creationTime).format("DD/MM/YYYY")}
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
        {getIcon(workOrder)}
        <Text style={theme.commonStyles.subtitle}>
          Client: {workOrder.customerWorkOrder.customerName} -{" "}
          {dayjs(workOrder.startTime).format("DD/MM/YYYY")}
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
