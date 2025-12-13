import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VacationRequest, VacationStatus } from "@interfaces/Vacation";
import { colors } from "styles/colors";
import { spacing } from "styles/spacing";

/**
 * VacationPendingList Component - Displays pending vacation requests for approval
 * Following Single Responsibility Principle
 */

interface VacationPendingListProps {
  requests: VacationRequest[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onApprove?: (requestId: string) => Promise<void>;
  onReject?: (requestId: string, reason: string) => Promise<void>;
}

export const VacationPendingList: React.FC<VacationPendingListProps> = ({
  requests,
  isLoading = false,
  onRefresh,
  onApprove,
  onReject,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("ca-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDays = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleApprove = async (request: VacationRequest) => {
    if (!onApprove) return;

    const days = calculateDays(request.startDate, request.endDate);

    Alert.alert(
      "Aprovar sol·licitud",
      `Aprovar ${days} dies de vacances per ${
        request.operatorName || "aquest operari"
      }?\n\n` +
        `Del ${formatDate(request.startDate)} al ${formatDate(
          request.endDate
        )}`,
      [
        { text: "Cancel·lar", style: "cancel" },
        {
          text: "Aprovar",
          style: "default",
          onPress: async () => {
            setActionLoading(request.id);
            try {
              await onApprove(request.id);
              Alert.alert("Èxit", "Sol·licitud aprovada correctament");
            } catch (error) {
              Alert.alert("Error", "No s'ha pogut aprovar la sol·licitud");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (request: VacationRequest) => {
    if (!onReject) return;

    Alert.prompt(
      "Rebutjar sol·licitud",
      "Indica el motiu del rebuig:",
      [
        { text: "Cancel·lar", style: "cancel" },
        {
          text: "Rebutjar",
          style: "destructive",
          onPress: async (reason) => {
            if (!reason || reason.trim() === "") {
              Alert.alert("Error", "Has d'indicar un motiu");
              return;
            }
            setActionLoading(request.id);
            try {
              await onReject(request.id, reason);
              Alert.alert("Èxit", "Sol·licitud rebutjada correctament");
            } catch (error) {
              Alert.alert("Error", "No s'ha pogut rebutjar la sol·licitud");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const renderItem = ({ item }: { item: VacationRequest }) => {
    const days = calculateDays(item.startDate, item.endDate);
    const isProcessing = actionLoading === item.id;

    return (
      <View style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <View style={styles.operatorInfo}>
            <Ionicons
              name="person-circle"
              size={24}
              color={colors.industrial}
            />
            <View style={styles.operatorDetails}>
              <Text style={styles.operatorName}>
                {item.operatorName || "Operari"}
              </Text>
              <Text style={styles.operatorId}>ID: {item.operatorId}</Text>
            </View>
          </View>
          <View style={styles.pendingBadge}>
            <Ionicons name="time" size={14} color="#F79009" />
            <Text style={styles.pendingText}>Pendent</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color="#667085" />
              <Text style={styles.dateLabel}>Inici:</Text>
              <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color="#667085" />
              <Text style={styles.dateLabel}>Fi:</Text>
              <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
            </View>
          </View>

          <View style={styles.daysInfo}>
            <Text style={styles.daysNumber}>{days}</Text>
            <Text style={styles.daysLabel}>dies</Text>
          </View>
        </View>

        {item.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Motiu:</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>
        )}

        <View style={styles.requestInfo}>
          <Text style={styles.requestedDate}>
            Sol·licitada: {formatDate(item.creationDate)}
          </Text>
        </View>

        {(onApprove || onReject) && (
          <View style={styles.actionButtons}>
            {onReject && (
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#F04438" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color="#F04438" />
                    <Text style={styles.rejectButtonText}>Rebutjar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {onApprove && (
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.approveButtonText}>Aprovar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.industrial} />
        <Text style={styles.loadingText}>Carregant sol·licituds...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="checkmark-done-circle-outline"
          size={64}
          color="#D0D5DD"
        />
        <Text style={styles.emptyTitle}>No hi ha sol·licituds pendents</Text>
        <Text style={styles.emptyText}>
          Totes les sol·licituds han estat processades
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      onRefresh={onRefresh}
      refreshing={isLoading}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: spacing.m,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: "#667085",
    marginTop: spacing.m,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D2939",
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#F79009",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.m,
  },
  operatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    flex: 1,
  },
  operatorDetails: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
  },
  operatorId: {
    fontSize: 12,
    color: "#667085",
    marginTop: 2,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: "#FFFAEB",
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F79009",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.m,
  },
  dateSection: {
    flex: 1,
    gap: spacing.s,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dateLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 14,
    color: "#344054",
    fontWeight: "500",
  },
  daysInfo: {
    alignItems: "center",
    paddingLeft: spacing.m,
    borderLeftWidth: 1,
    borderLeftColor: "#E4E7EC",
  },
  daysNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.industrial,
  },
  daysLabel: {
    fontSize: 12,
    color: "#667085",
  },
  reasonContainer: {
    backgroundColor: "#F9FAFB",
    padding: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.m,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#667085",
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    color: "#344054",
  },
  requestInfo: {
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
    marginBottom: spacing.m,
  },
  requestedDate: {
    fontSize: 12,
    color: "#98A2B3",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.s,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.s,
    borderRadius: 8,
    gap: spacing.xs,
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F04438",
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F04438",
  },
  approveButton: {
    backgroundColor: "#12B76A",
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
