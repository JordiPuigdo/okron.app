// components/tickets/TicketCard.tsx
import { Ionicons } from "@expo/vector-icons";
import Operator from "@interfaces/Operator";
import {
  StateWorkOrder,
  WorkOrder,
  WorkOrderPriority,
} from "@interfaces/WorkOrder";
import dayjs from "dayjs";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: WorkOrder;
  onPress?: (id: string) => void;
};

const PRIORITY_LABEL: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "Baixa",
  [WorkOrderPriority.Medium]: "Mitja",
  [WorkOrderPriority.High]: "Alta",
  [WorkOrderPriority.Critical]: "Critica",
};

const PRIORITY_COLOR: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "#6c757d",
  [WorkOrderPriority.Medium]: "#0d6efd",
  [WorkOrderPriority.High]: "#fd7e14",
  [WorkOrderPriority.Critical]: "#dc3545",
};

const STATE_LABEL: Record<StateWorkOrder, string> = {
  [StateWorkOrder.Waiting]: "En espera",
  [StateWorkOrder.OnGoing]: "En curso",
  [StateWorkOrder.Paused]: "Pausada",
  [StateWorkOrder.Finished]: "Finalizada",
  [StateWorkOrder.Requested]: "Solicitada",
  [StateWorkOrder.PendingToValidate]: "Per validar",
  [StateWorkOrder.Open]: "Oberta",
  [StateWorkOrder.Closed]: "Tancada",
  [StateWorkOrder.NotFinished]: "Inacabada",
};
function extractOperatorNames(item: WorkOrder): string[] {
  // prioridad a un string preformateado (si tu API ya lo trae)
  if (item.operatorsNames && item.operatorsNames.trim().length > 0) {
    return item.operatorsNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // fallback a la colección tipada
  if (Array.isArray(item.operator) && item.operator.length > 0) {
    return item.operator
      .map((op: Operator) => op?.name || op?.id)
      .filter(Boolean) as string[];
  }
  return [];
}

type OperatorsRowProps = { names: string[] };

const OperatorsRow = memo(({ names }: OperatorsRowProps) => {
  if (!names.length) return null;

  const shown = names.slice(0, 2);
  const extra = names.length - shown.length;

  return (
    <View
      style={styles.operatorsRow}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Operaris: ${names.join(", ")}`}
    >
      <Ionicons name="people-outline" size={16} color="#475569" />
      {shown.map((n) => (
        <View key={n} style={styles.operatorChip}>
          <Text numberOfLines={1} style={styles.operatorChipText}>
            {n}
          </Text>
        </View>
      ))}
      {extra > 0 && (
        <View style={[styles.operatorChip, styles.operatorChipMuted]}>
          <Text style={[styles.operatorChipText, { color: "#475569" }]}>
            +{extra}
          </Text>
        </View>
      )}
    </View>
  );
});

export const TicketCard = memo(({ item, onPress }: Props) => {
  const pColor = PRIORITY_COLOR[item.priority ?? WorkOrderPriority.Low];
  const pLabel = PRIORITY_LABEL[item.priority ?? WorkOrderPriority.Low];
  const sLabel = STATE_LABEL[item.stateWorkOrder];
  const operatorNames = extractOperatorNames(item);

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${item.code}`}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 },
      ]}
    >
      {/* Banda de prioridad */}
      <View style={[styles.priorityStrip, { backgroundColor: pColor }]} />
      {/* Header: código + estado */}
      <View style={styles.header}>
        <View style={styles.codeRow}>
          <Ionicons name="pricetags-outline" size={18} color="#0F172A" />
          <Text style={styles.codeText}>{item.code}</Text>
        </View>

        <View style={styles.stateChip}>
          <Ionicons name="time-outline" size={14} color="#0F172A" />
          <Text style={styles.stateText}>{sLabel}</Text>
        </View>
      </View>
      {/* Descripción */}
      <Text numberOfLines={2} style={styles.description}>
        {item.description ?? "—"}
      </Text>
      <OperatorsRow names={operatorNames} />

      {/* Meta: activo / fecha / prioridad */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cube-outline" size={16} color="#64748B" />
          <Text style={styles.metaText}>
            {item.asset?.description ?? "Sense actiu"}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.metaText}>
            {dayjs(item.creationTime).format("DD/MM/YYYY")}
          </Text>
        </View>

        <View style={[styles.priorityPill, { borderColor: pColor }]}>
          <View style={[styles.dot, { backgroundColor: pColor }]} />
          <Text style={[styles.priorityText]}>{pLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    overflow: "hidden",
  },
  priorityStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  codeText: { fontWeight: "700", fontSize: 16, color: "#0F172A" },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  stateText: { fontSize: 12, color: "#0F172A", fontWeight: "600" },
  description: {
    color: "#334155",
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "40%",
  },
  metaText: { color: "#64748B", fontSize: 12 },
  priorityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
  priorityText: { fontSize: 12, color: "#0F172A", fontWeight: "600" },
  operatorsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  operatorChip: {
    maxWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF2FF", // sutil
  },
  operatorChipMuted: {
    backgroundColor: "#E2E8F0",
  },
  operatorChipText: {
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "600",
  },
});
