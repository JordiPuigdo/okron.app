import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (startTime: Date, endTime: Date) => void;
}

export const ManualEntryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
}) => {
  const now = new Date();
  const [startDate, setStartDate] = useState<Date>(now);
  const [endDate, setEndDate] = useState<Date>(now);
  const [showPicker, setShowPicker] = useState<{
    type: "startDate" | "startTime" | "endDate" | "endTime" | null;
  }>({ type: null });

  const handleSave = () => {
    if (endDate <= startDate) {
      alert("La fecha/hora de fin debe ser posterior al inicio.");
      return;
    }
    onSave(startDate, endDate);
    onClose();
  };

  const showDateTimePicker = (type: typeof showPicker.type) => {
    setShowPicker({ type });
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      setShowPicker({ type: null });
      return;
    }

    switch (showPicker.type) {
      case "startDate":
        setStartDate((prev) => {
          const newDate = new Date(selectedDate);
          newDate.setHours(prev.getHours(), prev.getMinutes());
          return newDate;
        });
        break;

      case "startTime":
        setStartDate((prev) => {
          const newDate = new Date(prev);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          return newDate;
        });
        break;

      case "endDate":
        setEndDate((prev) => {
          const newDate = new Date(selectedDate);
          newDate.setHours(prev.getHours(), prev.getMinutes());
          return newDate;
        });
        break;

      case "endTime":
        setEndDate((prev) => {
          const newDate = new Date(prev);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          return newDate;
        });
        break;
    }

    setShowPicker({ type: null });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Entrada manual</Text>

          {/* --- Bloque de inicio --- */}
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

          {/* --- Bloque de fin --- */}
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

          {/* --- DateTime Picker --- */}
          {showPicker.type !== null && (
            <DateTimePicker
              mode={showPicker.type.includes("Date") ? "date" : "time"}
              value={showPicker.type.startsWith("start") ? startDate : endDate}
              onChange={onChangeDate}
            />
          )}

          {/* --- Botones inferiores --- */}
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
  cancel: {
    backgroundColor: "#6c757d",
  },
  save: {
    backgroundColor: "#0d8de0",
  },
});
