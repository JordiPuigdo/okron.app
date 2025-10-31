import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { WorkOrderTimeType } from "@interfaces/WorkOrder";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (startTime: Date, endTime: Date) => void;
  type: WorkOrderTimeType;
}

type PickerType = "startDate" | "startTime" | "endDate" | "endTime" | null;

export const ManualEntryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  type,
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<{ type: PickerType }>({
    type: null,
  });

  const mode: "date" | "time" = useMemo(
    () =>
      showPicker.type && showPicker.type.includes("Date") ? "date" : "time",
    [showPicker.type]
  );

  // Helpers
  const mergeDateAndTime = useCallback(
    (base: Date, from: Date, use: "date" | "time") => {
      const result = new Date(base);
      if (use === "date") {
        result.setFullYear(from.getFullYear(), from.getMonth(), from.getDate());
      } else {
        result.setHours(from.getHours(), from.getMinutes(), 0, 0);
      }
      return result;
    },
    []
  );

  const clampEndAfterStart = useCallback(
    (nextStart: Date, currentEnd: Date) => {
      return currentEnd < nextStart ? nextStart : currentEnd;
    },
    []
  );

  // ANDROID: open system dialogs (more reliable than inline inside a custom Modal)
  const openAndroidPicker = (type: Exclude<PickerType, null>) => {
    const isStart = type.startsWith("start");
    const isDate = type.includes("Date");
    const current = isStart ? startDate : endDate;

    DateTimePickerAndroid.open({
      value: current,
      mode: isDate ? "date" : "time",
      is24Hour: true,
      onChange: (event, selected) => {
        if (event.type !== "set" || !selected) return;

        if (type === "startDate") {
          const next = mergeDateAndTime(startDate, selected, "date");
          setStartDate(next);
          setEndDate((prevEnd) => clampEndAfterStart(next, prevEnd));
        } else if (type === "startTime") {
          const next = mergeDateAndTime(startDate, selected, "time");
          setStartDate(next);
          setEndDate((prevEnd) => clampEndAfterStart(next, prevEnd));
        } else if (type === "endDate") {
          setEndDate((prev) => mergeDateAndTime(prev, selected, "date"));
        } else if (type === "endTime") {
          setEndDate((prev) => mergeDateAndTime(prev, selected, "time"));
        }
      },
    });
  };

  // Unified entry point from buttons
  const showDateTimePicker = (type: PickerType) => {
    if (!type) return;
    if (Platform.OS === "android") {
      openAndroidPicker(type);
    } else {
      // iOS: render inline picker inside our modal
      setShowPicker({ type });
    }
  };

  // iOS inline picker handler
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const isSet = Boolean(selectedDate); // iOS: event.type not reliable, pick by value presence
    if (!isSet || !selectedDate) {
      setShowPicker({ type: null });
      return;
    }

    if (showPicker.type === "startDate") {
      const next = mergeDateAndTime(startDate, selectedDate, "date");
      setStartDate(next);
      setEndDate((prevEnd) => clampEndAfterStart(next, prevEnd));
    } else if (showPicker.type === "startTime") {
      const next = mergeDateAndTime(startDate, selectedDate, "time");
      setStartDate(next);
      setEndDate((prevEnd) => clampEndAfterStart(next, prevEnd));
    } else if (showPicker.type === "endDate") {
      setEndDate((prev) => mergeDateAndTime(prev, selectedDate, "date"));
    } else if (showPicker.type === "endTime") {
      setEndDate((prev) => mergeDateAndTime(prev, selectedDate, "time"));
    }

    setShowPicker({ type: null });
  };

  const handleSave = () => {
    if (endDate <= startDate) {
      alert("La fecha/hora de fin debe ser posterior al inicio.");
      return;
    }
    onSave(startDate, endDate);
    onClose();
  };

  const textHeader =
    type === WorkOrderTimeType.Time ? "Laborable" : "Desplaçament";

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Entrada manual - {textHeader}</Text>

          {/* Inicio */}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => showDateTimePicker("startDate")}
              style={styles.timeButton}
            >
              <FontAwesome5 name="calendar-plus" size={30} color="#0d8de0" />
              <Text style={styles.timeText}>
                {dayjs(startDate).format("DD/MM")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showDateTimePicker("startTime")}
              style={styles.timeButton}
            >
              <MaterialIcons name="play-arrow" size={34} color="#28a745" />
              <Text style={styles.timeText}>
                {dayjs(startDate).format("HH:mm")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fin */}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => showDateTimePicker("endDate")}
              style={styles.timeButton}
            >
              <FontAwesome5 name="calendar-check" size={30} color="#0d8de0" />
              <Text style={styles.timeText}>
                {dayjs(endDate).format("DD/MM")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showDateTimePicker("endTime")}
              style={styles.timeButton}
            >
              <MaterialIcons name="stop" size={34} color="#dc3545" />
              <Text style={styles.timeText}>
                {dayjs(endDate).format("HH:mm")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* iOS inline picker only */}
          {Platform.OS === "ios" && showPicker.type && (
            <DateTimePicker
              key={`${showPicker.type}-${mode}`}
              mode={mode}
              value={showPicker.type.startsWith("start") ? startDate : endDate}
              onChange={onChangeDate}
            />
          )}

          {/* Acciones */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.save]}
              onPress={handleSave}
            >
              <FontAwesome5 name="save" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "88%",
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: "#e1e5eb",
    width: 110,
    height: 90,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  timeText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 14,
  },
  button: {
    width: 100,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancel: { backgroundColor: "#6c757d" },
  save: { backgroundColor: "#0d8de0" },
});
