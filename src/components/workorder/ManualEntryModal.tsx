import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

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
          // Crear una NUEVA fecha combinando la fecha seleccionada con la hora actual
          const newDate = new Date(selectedDate);
          newDate.setHours(prev.getHours(), prev.getMinutes());
          return newDate;
        });
        break;

      case "startTime":
        setStartDate((prev) => {
          // Crear una NUEVA fecha combinando la fecha actual con la hora seleccionada
          const newDate = new Date(prev);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          return newDate;
        });
        break;

      case "endDate":
        setEndDate((prev) => {
          // Crear una NUEVA fecha combinando la fecha seleccionada con la hora actual
          const newDate = new Date(selectedDate);
          newDate.setHours(prev.getHours(), prev.getMinutes());
          return newDate;
        });
        break;

      case "endTime":
        setEndDate((prev) => {
          // Crear una NUEVA fecha combinando la fecha actual con la hora seleccionada
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
      <View style={theme.commonStyles.overlay}>
        <View style={theme.commonStyles.manualEntryContainer}>
          <Text style={theme.commonStyles.title}>Entrada Manual</Text>

          <View style={theme.commonStyles.timeRow}>
            {/* FECHA INICIO */}
            <TouchableOpacity
              onPress={() => showDateTimePicker("startDate")}
              style={theme.commonStyles.timeButton}
            >
              <FontAwesome5 name="calendar-plus" size={40} color="#007bff" />
              <Text style={theme.commonStyles.dateText}>
                {dayjs(startDate).format("DD/MM")}
              </Text>
            </TouchableOpacity>

            {/* HORA INICIO */}
            <TouchableOpacity
              onPress={() => showDateTimePicker("startTime")}
              style={theme.commonStyles.timeButton}
            >
              <FontAwesome5 name="play-circle" size={40} color="#28a745" />
              <Text style={theme.commonStyles.dateText}>
                {dayjs(startDate).format("HH:mm")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={theme.commonStyles.timeRow}>
            {/* FECHA FIN */}
            <TouchableOpacity
              onPress={() => showDateTimePicker("endDate")}
              style={theme.commonStyles.timeButton}
            >
              <FontAwesome5 name="calendar-check" size={40} color="#007bff" />
              <Text style={theme.commonStyles.dateText}>
                {dayjs(endDate).format("DD/MM")}
              </Text>
            </TouchableOpacity>

            {/* HORA FIN */}
            <TouchableOpacity
              onPress={() => showDateTimePicker("endTime")}
              style={theme.commonStyles.timeButton}
            >
              <FontAwesome5 name="stop-circle" size={40} color="#dc3545" />
              <Text style={theme.commonStyles.dateText}>
                {dayjs(endDate).format("HH:mm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPicker.type !== null && (
          <DateTimePicker
            mode={showPicker.type.includes("Date") ? "date" : "time"}
            value={showPicker.type.startsWith("start") ? startDate : endDate}
            onChange={onChangeDate}
          />
        )}

        <View style={theme.commonStyles.buttonsRow}>
          <TouchableOpacity
            style={theme.commonStyles.cancelButton}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={theme.commonStyles.saveButton}
            onPress={handleSave}
          >
            <FontAwesome5 name="save" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
