import { Ionicons } from "@expo/vector-icons";
import { Holiday } from "@interfaces/Holiday";
import { CreateVacationRequestDto } from "@interfaces/Vacation";
import DateTimePicker from "@react-native-community/datetimepicker";
import { holidayService } from "@services/holidayService";
import { vacationService } from "@services/vacationService";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DateData } from "react-native-calendars";
import { Calendar } from "@components/ui/calendar";
import { colors } from "styles/colors";
import { spacing } from "styles/spacing";

/**
 * VacationRequestModal Component - Form for creating vacation requests
 * Following Single Responsibility and Open/Closed principles
 */

interface VacationRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (request: CreateVacationRequestDto) => void;
  availableDays: number;
}

export const VacationRequestModal: React.FC<VacationRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
  availableDays,
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reason, setReason] = useState<string>("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectingDateFor, setSelectingDateFor] = useState<
    "start" | "end" | null
  >(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [requestedDays, setRequestedDays] = useState<number>(0);
  const [calculatingDays, setCalculatingDays] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Load holidays when modal opens
  useEffect(() => {
    if (visible) {
      loadHolidays();
    }
  }, [visible]);

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const [currentYearHolidays, nextYearHolidays] = await Promise.all([
        holidayService.getByYear(currentYear),
        holidayService.getByYear(nextYear),
      ]);
      setHolidays([...currentYearHolidays, ...nextYearHolidays]);
    } catch (error) {
      console.error("Error loading holidays:", error);
    }
  };

  // Prepare marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: any = {};
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    // Helper to check if date is holiday
    const isDateHoliday = (dateStr: string) => {
      return holidays.some((h) => {
        const hDate = new Date(h.date);
        return hDate.toISOString().split("T")[0] === dateStr;
      });
    };

    // If only one date selected (start === end)
    if (startStr === endStr) {
      const isHol = isDateHoliday(startStr);
      marked[startStr] = {
        startingDay: true,
        endingDay: true,
        color: isHol ? "#F04438" : colors.industrial,
        textColor: "#fff",
      };
    } else {
      // Mark start date
      const startIsHol = isDateHoliday(startStr);
      marked[startStr] = {
        startingDay: true,
        color: startIsHol ? "#F04438" : colors.industrial,
        textColor: "#fff",
      };

      // Mark end date
      const endIsHol = isDateHoliday(endStr);
      marked[endStr] = {
        endingDay: true,
        color: endIsHol ? "#F04438" : colors.industrial,
        textColor: "#fff",
      };

      // Mark range between start and end
      const current = new Date(startDate);
      current.setDate(current.getDate() + 1);

      while (current < endDate) {
        const dateStr = current.toISOString().split("T")[0];
        const isHol = isDateHoliday(dateStr);

        marked[dateStr] = {
          color: isHol ? "#FEF3F2" : colors.industrial + "30",
          textColor: isHol ? "#F04438" : "#1D2939",
        };

        current.setDate(current.getDate() + 1);
      }
    }

    // Mark weekends in grey when not selected and not holiday
    const calendarStart = new Date(startDate);
    calendarStart.setDate(calendarStart.getDate() - 60); // Optional: expand visible range
    const calendarEnd = new Date(endDate);
    calendarEnd.setDate(calendarEnd.getDate() + 60);

    const currentDay = new Date(calendarStart);

    while (currentDay <= calendarEnd) {
      const dateStr = currentDay.toISOString().split("T")[0];

      const isHol = isDateHoliday(dateStr);
      const weekend = isWeekend(currentDay);

      if (!marked[dateStr] && weekend && !isHol) {
        marked[dateStr] = {
          color: "#D0D5DD", // gris claro
          textColor: "#475467",
          disabled: true, // opcional si quieres que no se puedan seleccionar
        };
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    // Add dots to all holidays outside the range for visibility
    holidays.forEach((holiday) => {
      const dateStr = new Date(holiday.date).toISOString().split("T")[0];
      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: "#F04438",
        };
      }
    });

    return marked;
  }, [holidays, startDate, endDate]);

  const isHoliday = (date: Date): Holiday | undefined => {
    return holidays.find((holiday) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getDate() === date.getDate() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleCalendarDayPress = (dateString: string) => {
    const selectedDate = new Date(dateString);

    // Si no hay selección → iniciar rango
    if (!startDate && !endDate) {
      setStartDate(selectedDate);
      setEndDate(undefined);
      setSelectingDateFor("end");
      return;
    }

    // Convert dates to dayjs for easy comparison
    const sel = dayjs(selectedDate);
    const start = dayjs(startDate);
    const end = endDate ? dayjs(endDate) : null;

    // 1️⃣ Clic sobre el inicio → limpiar
    if (sel.isSame(start, "day")) {
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectingDateFor(null);
      return;
    }

    // 2️⃣ Si aún no hay fin → seleccionamos fin
    if (!end) {
      if (sel.isAfter(start, "day")) {
        setEndDate(selectedDate);
        setSelectingDateFor("start");
      } else {
        // Si clican antes → intercambiamos inicio
        setStartDate(selectedDate);
      }
      return;
    }

    // Ahora tenemos rango completo START → END

    // 3️⃣ Clic DESPUÉS del fin → extender rango
    if (sel.isAfter(end, "day")) {
      setEndDate(selectedDate);
      return;
    }

    // 4️⃣ Clic ANTES del inicio → extender inicio
    if (sel.isBefore(start, "day")) {
      setStartDate(selectedDate);
      return;
    }

    // 5️⃣ Clic DENTRO del rango → resetear todo
    if (sel.isAfter(start, "day") && sel.isBefore(end, "day")) {
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectingDateFor(null);
      return;
    }
  };

  // Calculate days whenever dates change
  React.useEffect(() => {
    const calculateDays = async () => {
      setCalculatingDays(true);
      try {
        const days = await vacationService.calculateVacationDays(
          startDate,
          endDate
        );
        setRequestedDays(days);
      } catch (error) {
        console.error("Error calculating days:", error);
        setRequestedDays(0);
      } finally {
        setCalculatingDays(false);
      }
    };

    calculateDays();
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    const requestDto: CreateVacationRequestDto = {
      startDate,
      endDate,
      reason: reason.trim() || undefined,
    };

    // Validate request
    const validation = vacationService.validateVacationRequest(requestDto);

    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert("Error de validación", validation.errors.join("\n"));
      return;
    }

    // Use already calculated days
    if (requestedDays > availableDays) {
      Alert.alert(
        "Días insuficientes",
        `Solicitas ${requestedDays} días pero solo tienes ${availableDays} disponibles.`
      );
      return;
    }

    // Show confirmation
    Alert.alert(
      "Confirmar solicitud",
      `Vas a solicitar ${requestedDays} días de vacaciones.\n\n` +
        `Desde: ${formatDate(startDate)}\n` +
        `Hasta: ${formatDate(endDate)}\n\n` +
        "¿Deseas continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            onSubmit(requestDto);
            resetForm();
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setReason("");
    setErrors([]);
    setRequestedDays(0);
    setSelectingDateFor(null);
    onClose();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
      // Auto-adjust end date if it's before start date
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Nova sol·licitud de vacances</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#667085" />
              </TouchableOpacity>
            </View>

            {/* Days summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                Dies sol·licitats:{" "}
                {calculatingDays ? (
                  <ActivityIndicator size="small" color={colors.industrial} />
                ) : (
                  <Text style={styles.summaryBold}>{requestedDays}</Text>
                )}
              </Text>
              <Text style={styles.summaryText}>
                Dies disponibles:{" "}
                <Text style={styles.summaryBold}>{availableDays}</Text>
              </Text>
            </View>

            {/* Holiday Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#F04438" }]}
                />
                <Text style={styles.legendText}>Festiu</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.industrial },
                  ]}
                />
                <Text style={styles.legendText}>Seleccionat</Text>
              </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <Calendar
                current={startDate.toISOString().split("T")[0]}
                minDate={new Date().toISOString().split("T")[0]}
                onSelectDate={handleCalendarDayPress}
                markedDates={markedDates}
                markingType="period"
                theme={{
                  todayTextColor: colors.industrial,
                  arrowColor: colors.industrial,
                  monthTextColor: "#1D2939",
                  textMonthFontWeight: "600",
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  selectedDayBackgroundColor: colors.industrial,
                  selectedDayTextColor: "#fff",
                  disabledArrowColor: "#D0D5DD",
                }}
                enableSwipeMonths={true}
              />
              <Text style={styles.calendarHint}>
                {selectingDateFor === "start" &&
                  "Toca per seleccionar la data d'inici"}
                {selectingDateFor === "end" &&
                  "Toca per seleccionar la data de fi"}
              </Text>
            </View>

            {/* Selected Date Range Display */}
            <View style={styles.selectedDatesContainer}>
              <Text style={styles.selectedDatesLabel}>
                Període seleccionat:
              </Text>
              <Text style={styles.selectedDatesText}>
                {formatDate(startDate)} → {formatDate(endDate)}
              </Text>
            </View>

            {/* Old Date Pickers - Hidden but kept for iOS compatibility */}
            {Platform.OS === "ios" && showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={(e, date) => {
                  setShowStartPicker(false);
                  if (date) {
                    setStartDate(date);
                    if (date > endDate) setEndDate(date);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            {Platform.OS === "ios" && showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                onChange={(e, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
                minimumDate={startDate}
              />
            )}

            {/* Start Date - Legacy */}
            <View style={{ display: "none" }}>
              <Text style={styles.label}>
                Data Inici <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  isHoliday(startDate) && styles.dateButtonHoliday,
                  isWeekend(startDate) && styles.dateButtonWeekend,
                ]}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#667085" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  {isHoliday(startDate) && (
                    <Text style={styles.dateSubtext}>
                      🎉 {isHoliday(startDate)!.name}
                    </Text>
                  )}
                  {!isHoliday(startDate) && isWeekend(startDate) && (
                    <Text style={styles.dateSubtext}>Cap de setmana</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {showStartPicker && Platform.OS === "ios" && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* End Date - Legacy */}
            <View style={{ display: "none" }}>
              <Text style={styles.label}>
                Data Fi <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  isHoliday(endDate) && styles.dateButtonHoliday,
                  isWeekend(endDate) && styles.dateButtonWeekend,
                ]}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#667085" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                  {isHoliday(endDate) && (
                    <Text style={styles.dateSubtext}>
                      🎉 {isHoliday(endDate)!.name}
                    </Text>
                  )}
                  {!isHoliday(endDate) && isWeekend(endDate) && (
                    <Text style={styles.dateSubtext}>Cap de setmana</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {showEndPicker && Platform.OS === "ios" && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleEndDateChange}
                minimumDate={startDate}
              />
            )}

            {/* Reason */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Motiu (opcional)</Text>
              <TextInput
                style={styles.textArea}
                value={reason}
                onChangeText={setReason}
                placeholder="Escribe el motivo de tu solicitud..."
                placeholderTextColor="#98A2B3"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Error messages */}
            {errors.length > 0 && (
              <View style={styles.errorContainer}>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Sol·licitar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  scrollView: {
    padding: spacing.l,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1D2939",
  },
  closeButton: {
    padding: spacing.xs,
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
    gap: spacing.xs,
  },
  summaryText: {
    fontSize: 14,
    color: "#667085",
  },
  summaryBold: {
    fontWeight: "600",
    color: colors.industrial,
    fontSize: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    padding: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.m,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#667085",
    fontWeight: "500",
  },
  calendarContainer: {
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  calendarHint: {
    fontSize: 12,
    color: "#667085",
    textAlign: "center",
    paddingVertical: spacing.s,
    backgroundColor: "#F9FAFB",
  },
  selectedDatesContainer: {
    backgroundColor: "#F9FAFB",
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.industrial,
  },
  selectedDatesLabel: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  selectedDatesText: {
    fontSize: 16,
    color: "#1D2939",
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#344054",
    marginBottom: spacing.s,
  },
  required: {
    color: "#F04438",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    gap: spacing.s,
    backgroundColor: "#fff",
  },
  dateButtonHoliday: {
    borderColor: "#F04438",
    borderWidth: 2,
    backgroundColor: "#FEF3F2",
  },
  dateButtonWeekend: {
    borderColor: "#98A2B3",
    backgroundColor: "#F9FAFB",
  },
  dateText: {
    fontSize: 16,
    color: "#1D2939",
    fontWeight: "500",
  },
  dateSubtext: {
    fontSize: 12,
    color: "#667085",
    marginTop: 2,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    padding: spacing.m,
    fontSize: 16,
    color: "#1D2939",
    minHeight: 100,
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: "#F04438",
  },
  errorText: {
    fontSize: 14,
    color: "#F04438",
    marginBottom: spacing.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#344054",
  },
  submitButton: {
    backgroundColor: colors.industrial,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
