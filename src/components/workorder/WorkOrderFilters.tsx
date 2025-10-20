import { FontAwesome5 } from "@expo/vector-icons";
import { OperatorType } from "@interfaces/Operator";
import { WorkOrderPriority, WorkOrderType } from "@interfaces/WorkOrder";
import DateTimePicker from "@react-native-community/datetimepicker";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WorkOrderFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    startDate?: Date;
    endDate?: Date;
    priority?: WorkOrderPriority | null;
    showFinishedToday?: boolean;
    workOrderType?: WorkOrderType | null;
    orderBy?: string | null;
  }) => void;
}

export const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedPriority, setSelectedPriority] =
    useState<WorkOrderPriority | null>(null);
  const [showFinishedToday, setShowFinishedToday] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkOrderType | null>(null);
  const { isCRM } = configService.getConfigSync();
  const { factoryWorker } = useAuthStore();

  const [orderBy, setOrderBy] = useState<string | null>(null);

  const workOrderTypes = [
    {
      id: "corrective",
      label: "Correctius",
      icon: "tools",
      type: WorkOrderType.Corrective,
      visible: [OperatorType.Maintenance, OperatorType.Quality],
    },
    {
      id: "preventive",
      label: "Preventius",
      icon: "wrench",
      type: WorkOrderType.Preventive,
      visible: [OperatorType.Maintenance],
    },
    {
      id: "ticket",
      label: "Ticket",
      icon: "file-alt",
      type: WorkOrderType.Ticket,
      visible: [OperatorType.Quality],
    },
  ];

  const priorities = [
    {
      id: "low",
      label: "Baixa",
      color: "#5EC269",
      icon: "arrow-down",
      type: WorkOrderPriority.Low,
    },
    {
      id: "medium",
      label: "Mitjana",
      color: "#F4D176",
      icon: "equals",
      type: WorkOrderPriority.Medium,
    },
    {
      id: "high",
      label: "Alta",
      color: "#DD524C",
      icon: "arrow-up",
      type: WorkOrderPriority.High,
    },
  ];

  function toggleOrder(type: string) {
    if (orderBy === `${type}_asc`) setOrderBy(`${type}_desc`);
    else if (orderBy === `${type}_desc`) setOrderBy(null);
    else setOrderBy(`${type}_asc`);
  }

  const handleApply = () => {
    onApply({
      startDate,
      endDate,
      priority: selectedPriority,
      workOrderType: selectedType,
      showFinishedToday: showFinishedToday,
      orderBy: orderBy ? `${orderBy}` : null,
    });
    onClose();
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedPriority(null);
    setShowFinishedToday(false);
    setSelectedType(null);
    setOrderBy(null);
    onApply({});
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.dragHandle} />

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Ordena Per</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            {[
              { id: "code", label: "Codi" },
              { id: "date", label: "Data" },
              { id: "state", label: "Estat" },
              ...(selectedType === WorkOrderType.Ticket
                ? [{ id: "priority", label: "Prioritat" }]
                : []),
            ].map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[
                  styles.priorityChip,
                  orderBy?.startsWith(o.id)
                    ? { borderColor: "#055a9b", backgroundColor: "#055a9b" }
                    : { borderColor: "#ccc" },
                ]}
                onPress={() => toggleOrder(o.id)}
              >
                <FontAwesome5
                  name={
                    orderBy === `${o.id}_asc`
                      ? "arrow-up"
                      : orderBy === `${o.id}_desc`
                      ? "arrow-down"
                      : "sort"
                  }
                  size={14}
                  color={orderBy?.startsWith(o.id) ? "#fff" : "#055a9b"}
                />
                <Text
                  style={[
                    styles.priorityLabel,
                    { color: orderBy?.startsWith(o.id) ? "#fff" : "#055a9b" },
                  ]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <Text style={styles.title}>Filtres</Text>
          </View>

          {/* CONTENT */}
          <ScrollView contentContainerStyle={styles.content}>
            {/* FECHAS */}
            <Text style={styles.sectionTitle}>Dates</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <FontAwesome5 name="calendar" size={16} color="#055a9b" />
                <Text style={styles.dateText}>
                  {startDate ? startDate.toLocaleDateString("es-ES") : "Inici"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <FontAwesome5 name="calendar" size={16} color="#055a9b" />
                <Text style={styles.dateText}>
                  {endDate ? endDate.toLocaleDateString("es-ES") : "Fi"}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}

            {/* PRIORIDAD */}
            {factoryWorker &&
              OperatorType.Quality == factoryWorker.operatorType && (
                <>
                  <Text style={styles.sectionTitle}>Prioritat</Text>
                  <View style={styles.row}>
                    {priorities.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.priorityChip,
                          {
                            borderColor: p.color,
                            backgroundColor:
                              selectedPriority === p.type
                                ? p.color
                                : "transparent",
                          },
                        ]}
                        onPress={() =>
                          setSelectedPriority(
                            selectedPriority === p.type ? null : p.type
                          )
                        }
                      >
                        <FontAwesome5
                          name={p.icon as any}
                          size={14}
                          color={selectedPriority === p.type ? "#fff" : p.color}
                        />
                        <Text
                          style={[
                            styles.priorityLabel,
                            {
                              color:
                                selectedPriority === p.type ? "#fff" : p.color,
                            },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            {/* ESTADOS (futuro) */}
            {/* 🔧 Aquí podrás agregar chips de estado según tipo de usuario */}
            {/* TIPO DE ORDEN - solo si no es CRM */}
            {!isCRM && (
              <>
                <Text style={styles.sectionTitle}>Tipus d'Ordre</Text>
                <View style={styles.row}>
                  {factoryWorker &&
                    workOrderTypes
                      .filter((x) =>
                        x.visible.includes(factoryWorker.operatorType)
                      )
                      .map((t) => (
                        <TouchableOpacity
                          key={t.id}
                          style={[
                            styles.priorityChip,
                            {
                              borderColor: "#055a9b",
                              backgroundColor:
                                selectedType === t.type
                                  ? "#055a9b"
                                  : "transparent",
                            },
                          ]}
                          onPress={() =>
                            setSelectedType(
                              selectedType === t.type ? null : t.type
                            )
                          }
                        >
                          <FontAwesome5
                            name={t.icon as any}
                            size={14}
                            color={selectedType === t.type ? "#fff" : "#055a9b"}
                          />
                          <Text
                            style={[
                              styles.priorityLabel,
                              {
                                color:
                                  selectedType === t.type ? "#fff" : "#055a9b",
                              },
                            ]}
                          >
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                </View>
              </>
            )}
            {/* FINALIZADAS HOY */}
            <Text style={styles.sectionTitle}>Ordres Finalitzades</Text>
            <TouchableOpacity
              style={[
                styles.todayButton,
                showFinishedToday && styles.todayButtonActive,
              ]}
              onPress={() => setShowFinishedToday(!showFinishedToday)}
            >
              <FontAwesome5
                name="calendar-check"
                size={18}
                color={showFinishedToday ? "#fff" : "#5EC269"}
              />
              <Text
                style={[
                  styles.todayButtonText,
                  showFinishedToday && { color: "#fff" },
                ]}
              >
                Finalitzades avui
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.iconButton, styles.resetButton]}
              onPress={handleReset}
              accessibilityLabel="Restablir"
            >
              <FontAwesome5 name="redo-alt" size={22} color="#0a2947" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, styles.cancelButton]}
              onPress={onClose}
              accessibilityLabel="Cancel·lar"
            >
              <FontAwesome5 name="times" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, styles.applyButton]}
              onPress={handleApply}
              accessibilityLabel="Aplicar"
            >
              <FontAwesome5 name="check" size={22} color="#fff" />
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  dragHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#055a9b",
  },
  content: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a2947",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: "#055a9b",
    fontWeight: "600",
  },
  priorityChip: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#5EC269",
    paddingVertical: 10,
    gap: 8,
    marginTop: 6,
  },
  todayButtonActive: {
    backgroundColor: "#5EC269",
  },
  todayButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5EC269",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    paddingVertical: 16,
  },
  iconButton: {
    flex: 1,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    backgroundColor: "#e0e0e0",
  },
  cancelButton: {
    backgroundColor: "#697384",
  },
  applyButton: {
    backgroundColor: "#0d8de0",
  },
});
