import { MaterialIcons } from "@expo/vector-icons";
import {
  WorkOrderOperatorTimes,
  WorkOrderTimeType,
} from "@interfaces/WorkOrder";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

dayjs.extend(duration);

interface Props {
  item: WorkOrderOperatorTimes;
  onDelete?: (id: string) => void;
}

export const RenderItemTime = ({ item, onDelete }: Props) => {
  const isTravel = item.type === WorkOrderTimeType.Travel;
  const bgColor = isTravel ? "#E3F2FD" : "#E8F5E9";
  const iconColor = isTravel ? "#0d8de0" : "#28a745";

  const [displayTime, setDisplayTime] = useState<string>("--:--:--");

  useEffect(() => {
    const updateDisplayTime = () => {
      if (!item.startTime) return setDisplayTime("--:--:--");

      const start = dayjs(item.startTime);
      const end = item.endTime ? dayjs(item.endTime) : dayjs();

      const diff = end.diff(start);
      const dur = dayjs.duration(diff);

      const hours = String(Math.floor(dur.asHours())).padStart(2, "0");
      const minutes = String(dur.minutes()).padStart(2, "0");
      const seconds = String(dur.seconds()).padStart(2, "0");

      setDisplayTime(`${hours}:${minutes}:${seconds}`);
    };

    updateDisplayTime();
    if (!item.endTime) {
      const interval = setInterval(updateDisplayTime, 1000);
      return () => clearInterval(interval);
    }
  }, [item.startTime, item.endTime]);

  return (
    <View style={[styles.rowContainer, { backgroundColor: bgColor }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={isTravel ? "directions-car" : "build"}
          size={30}
          color={iconColor}
        />
      </View>

      <View style={styles.timeInfo}>
        <View style={styles.topRow}>
          <Text style={styles.operatorName} numberOfLines={1}>
            {item.operator.name}
          </Text>
          <Text style={styles.totalTime}>{displayTime}</Text>
        </View>

        <Text style={styles.timeRange}>
          {dayjs(item.startTime).format("DD/MM HH:mm:ss")} →{" "}
          {item.endTime ? dayjs(item.endTime).format("HH:mm:ss") : "--:--:--"}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={26} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff90",
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  operatorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1b1b1b",
    maxWidth: "60%",
  },
  totalTime: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  timeRange: {
    fontSize: 13,
    color: "#333",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
