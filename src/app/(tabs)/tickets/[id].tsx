import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useWorkOrders } from "@hooks/useWorkOrders";
import {
  StateWorkOrder,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderType,
} from "@interfaces/WorkOrder";
import { useAuthStore } from "@store/authStore";
import { useTicketsStore } from "@store/ticketStore";
import { RepairReport } from "../workorders/new/repairReportForm";

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { factoryWorker } = useAuthStore();

  const {
    generateWorkOrderCode,
    createRepairWorkOrder,
    addCommentToWorkOrder,
  } = useWorkOrders();

  //  const [ticket, setTicket] = useState<WorkOrder | null>(null);
  //const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const ticket = useTicketsStore(
    useCallback((s) => (id ? s.byId[id] : undefined), [id])
  );

  const loading = !ticket;

  const operators = useMemo(() => {
    if (!ticket) return [];
    if (ticket.operatorsNames?.trim()) {
      return ticket.operatorsNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return (ticket.operator ?? [])
      .map((op) => op?.name || op?.id)
      .filter(Boolean) as string[];
  }, [ticket]);

  if (!ticket) {
    return (
      <View>
        {id}
        <Text>No trobat / sense dades</Text>
      </View>
    );
  }

  const stateLabel = useMemo(() => {
    if (!ticket) return "";
    const map = {
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
    return map[ticket.stateWorkOrder];
  }, [ticket]);

  // ---------- construir payload del correctiu ----------
  const buildCorrectivePayload = useCallback(
    async (t: WorkOrder): Promise<Partial<RepairReport>> => {
      const code = await generateWorkOrderCode?.(); // si tu hook lo expone
      // Default que tú nos pasaste (lo afinas luego)
      return {
        code: code ?? "",
        description: `Correctiu creat des de ticket ${t.code}${
          t.description ? ` - ${t.description}` : ""
        }`,
        initialDateTime: new Date(),
        installationId: "", // TODO
        customerId: undefined,
        refCustomerId: t.refCustomerId,
        stateWorkOrder: StateWorkOrder.Waiting,
        workOrderType: WorkOrderType.Corrective,
        originWorkOrder: ticket.originWorkOrder,
        downtimeReasonId: "",
        assetId: t.asset?.id ?? "",
        operatorId: [factoryWorker.id],
        userId: "67dec0ce2464c1a06ae59182",
        priority: t.priority ?? WorkOrderPriority.Low,
        originalWorkOrderId: t.id,
        originalWorkOrderCode: t.code,
        operatorCreatorId: factoryWorker.id,
      };
    },
    [factoryWorker, generateWorkOrderCode]
  );

  // ---------- acción: crear correctiu ----------
  const handleCreateCorrective = useCallback(async () => {
    console.log("handleCreateCorrective");
    if (!ticket) return;
    try {
      setCreating(true);
      const payload = await buildCorrectivePayload(ticket);
      const created = await createRepairWorkOrder(payload);

      Alert.alert("Correctiu creat", `Codi: ${created?.code ?? ""}`);
      router.back();
    } catch (err) {
      console.error("create corrective error", err);
      Alert.alert("Error", "No s'ha pogut crear el correctiu.");
    } finally {
      setCreating(false);
      setShowModal(false);
    }
  }, [
    ticket,
    buildCorrectivePayload,
    createRepairWorkOrder,
    addCommentToWorkOrder,
    factoryWorker?.id,
    router,
  ]);

  // ---------- UI ----------
  if (loading || !ticket) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregant ticket…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header resumen del ticket */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.codeRow}>
              <Ionicons name="pricetags-outline" size={18} color="#0F172A" />
              <Text style={styles.codeText}>{ticket.code}</Text>
            </View>

            <View style={styles.stateChip}>
              <Ionicons name="time-outline" size={14} color="#0F172A" />
              <Text style={styles.stateText}>{stateLabel}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={3}>
            {ticket.description ?? "—"}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>
                {ticket.asset?.description ?? "Sense actiu"}
              </Text>
            </View>
          </View>

          {operators.length > 0 && (
            <View style={styles.operatorsRow}>
              <Ionicons name="people-outline" size={16} color="#475569" />
              {operators.slice(0, 2).map((n) => (
                <View key={n} style={styles.operatorChip}>
                  <Text style={styles.operatorChipText}>{n}</Text>
                </View>
              ))}
              {operators.length > 2 && (
                <View style={[styles.operatorChip, styles.operatorChipMuted]}>
                  <Text style={[styles.operatorChipText, { color: "#475569" }]}>
                    +{operators.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* … aquí puedes renderizar más secciones (comentarios, adjuntos, etc.) */}
      </ScrollView>

      {/* Botón fijo inferior */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Crear correctiu"
        >
          <Ionicons name="construct-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>Crear Correctiu</Text>
        </Pressable>
      </View>

      {/* Modal de confirmación */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning-outline" size={22} color="#dc3545" />
              <Text style={styles.modalTitle}>Confirmar creació</Text>
            </View>
            <Text style={styles.modalText}>
              Es crearà un correctiu derivat d’aquest ticket ({ticket.code}).
              Vols continuar?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.btnText, { color: "#0F172A" }]}>
                  Cancel·lar
                </Text>
              </Pressable>
              <Pressable
                disabled={creating}
                onPress={handleCreateCorrective}
                style={[
                  styles.btn,
                  styles.btnDanger,
                  creating && { opacity: 0.8 },
                ]}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={18} color="#fff" />
                    <Text style={styles.btnText}>Crear Correctiu</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- utils de UI ----------
function priorityLabel(p?: WorkOrderPriority) {
  switch (p) {
    case WorkOrderPriority.Critical:
      return "Crítica";
    case WorkOrderPriority.High:
      return "Alta";
    case WorkOrderPriority.Medium:
      return "Mitjana";
    default:
      return "Baixa";
  }
}

// ---------- estilos ----------
const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 10, color: "#475569" },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  title: {
    color: "#0F172A",
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "60%",
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
    borderColor: "#CBD5E1",
  },
  dot: { width: 8, height: 8, borderRadius: 999 },

  operatorsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  operatorChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },
  operatorChipMuted: { backgroundColor: "#E2E8F0" },
  operatorChipText: { fontSize: 12, color: "#1E293B", fontWeight: "600" },

  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  ctaButton: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  modalText: { color: "#334155", fontSize: 14 },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 6,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnGhost: { backgroundColor: "#F1F5F9" },
  btnDanger: { backgroundColor: "#dc3545" },
  btnText: { color: "#fff", fontWeight: "700" },
});
