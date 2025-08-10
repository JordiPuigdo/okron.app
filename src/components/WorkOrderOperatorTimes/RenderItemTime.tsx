import { MaterialIcons } from "@expo/vector-icons";
import {
  WorkOrderOperatorTimes,
  WorkOrderTimeType,
} from "@interfaces/WorkOrder";
import { formatTimeSpan } from "@utils/workorderUtils";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

interface Props {
  item: WorkOrderOperatorTimes;
  onDelete?: (id: string) => void;
}

export const RenderItemTime = ({ item, onDelete }: Props) => {
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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.operatorName}>{item.operator.name}</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            name={
              item.type === WorkOrderTimeType.Travel ? "directions-car" : "work"
            }
            size={20}
            color={
              item.type === WorkOrderTimeType.Travel
                ? theme.colors.primary
                : theme.colors.success
            }
          />
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={styles.deleteButton}
            >
              <MaterialIcons
                name="delete"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeValue}>
            {dayjs(item.startTime).format("DD/MM")}
          </Text>
          <Text style={styles.timeValue}>
            {dayjs(item.startTime).format("HH:mm")}
          </Text>
        </View>

        <View style={styles.timeColumn}>
          <Text style={styles.timeValue}>
            {item.endTime ? dayjs(item.endTime).format("DD/MM") : "--"}
          </Text>
          <Text style={styles.timeValue}>
            {item.endTime ? dayjs(item.endTime).format("HH:mm") : "--"}
          </Text>
        </View>

        <View style={styles.timeColumn}>
          <Text style={styles.timeTotal}>{getTimeSpan(item)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 12,
  },
  timeColumn: {
    alignItems: "center",
    flex: 1,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  timeTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary,
  },
});
