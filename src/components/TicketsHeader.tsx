import { Ionicons } from "@expo/vector-icons";
import { WorkOrder, WorkOrderPriority } from "@interfaces/WorkOrder";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  data: WorkOrder[];
  lastSync?: Date;
};

const PRIORITY_COLOR: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "#6c757d",
  [WorkOrderPriority.Medium]: "#0d6efd",
  [WorkOrderPriority.High]: "#fd7e14",
  [WorkOrderPriority.Critical]: "#dc3545",
};

const PRIORITY_LABELS_ES: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "Baixa",
  [WorkOrderPriority.Medium]: "Mitja",
  [WorkOrderPriority.High]: "Alta",
  [WorkOrderPriority.Critical]: "Critica",
};

export const TicketsHeader = memo(({ data, lastSync }: Props) => {
  const total = data.length;

  const priorityCount = Object.values(WorkOrderPriority).reduce((acc, p) => {
    const key = p as WorkOrderPriority;
    acc[key] = data.filter((t) => t.priority === key).length;
    return acc;
  }, {} as Record<WorkOrderPriority, number>);

  const avgAgeDays =
    total > 0
      ? Math.round(
          data.reduce((sum, t) => {
            const age =
              (Date.now() - new Date(t.creationTime).valueOf()) /
              (1000 * 60 * 60 * 24);
            return sum + age;
          }, 0) / total
        )
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="ticket-outline" size={22} color="#0F172A" />
        <Text style={styles.title}>Resum de tickets</Text>
      </View>

      <Text style={styles.total}>Total: {total}</Text>

      <View style={styles.priorityRow}>
        {Object.values(WorkOrderPriority)
          .filter((v) => typeof v === "number")
          .map((p) => (
            <View key={p} style={styles.priorityItem}>
              <View
                style={[styles.dot, { backgroundColor: PRIORITY_COLOR[p] }]}
              />
              <Text style={styles.priorityText}>
                {PRIORITY_LABELS_ES[p]}: {priorityCount[p] ?? 0}
              </Text>
            </View>
          ))}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color="#475569" />
          <Text style={styles.metaText}>Promig obert {avgAgeDays} dies</Text>
        </View>
        {lastSync && (
          <View style={styles.metaItem}>
            <Ionicons name="sync-outline" size={16} color="#475569" />
            <Text style={styles.metaText}>
              Actualitzat: {lastSync.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  total: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 6,
  },
  priorityItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  priorityText: { fontSize: 12, color: "#475569", fontWeight: "500" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, color: "#64748B" },
});
