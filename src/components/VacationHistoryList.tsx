import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VacationRequest, VacationStatus } from "@interfaces/Vacation";
import { colors } from "styles/colors";
import { spacing } from "styles/spacing";
import { vacationService } from "@services/vacationService";

/**
 * VacationHistoryList Component - Displays vacation request history
 * Following Single Responsibility Principle
 */

interface VacationHistoryListProps {
  requests: VacationRequest[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const VacationHistoryList: React.FC<VacationHistoryListProps> = ({
  requests,
  isLoading = false,
  onRefresh,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Get unique years from requests
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    requests.forEach((request) => {
      const year = new Date(request.startDate).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [requests]);

  // Filter requests by selected year
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const year = new Date(request.startDate).getFullYear();
      return year === selectedYear;
    });
  }, [requests, selectedYear]);

  const getStatusColor = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Approved:
        return "#12B76A";
      case VacationStatus.Rejected:
        return "#F04438";
      case VacationStatus.Pending:
        return "#F79009";
      case VacationStatus.Cancelled:
        return "#98A2B3";
      default:
        return "#98A2B3";
    }
  };

  const getStatusText = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Approved:
        return "Aprovada";
      case VacationStatus.Rejected:
        return "Rebutjada";
      case VacationStatus.Pending:
        return "Pendent";
      case VacationStatus.Cancelled:
        return "Cancel·lada";
      default:
        return "Desconegut";
    }
  };

  const getStatusIcon = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Approved:
        return "checkmark-circle";
      case VacationStatus.Rejected:
        return "close-circle";
      case VacationStatus.Pending:
        return "time";
      case VacationStatus.Cancelled:
        return "ban";
      default:
        return "help-circle";
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("ca-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const formatDateFull = (date: Date): string => {
    return new Date(date).toLocaleDateString("ca-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Count only weekdays (Monday to Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  // Separate component to handle async day calculation with holidays
  const VacationRequestItem = ({ item }: { item: VacationRequest }) => {
    const [days, setDays] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const calculateDaysAsync = async () => {
        try {
          const calculatedDays = await vacationService.calculateVacationDays(
            item.startDate,
            item.endDate
          );
          setDays(calculatedDays);
        } catch (error) {
          console.error("Error calculating days:", error);
          // Fallback to simple calculation
          setDays(calculateDays(item.startDate, item.endDate));
        } finally {
          setLoading(false);
        }
      };

      calculateDaysAsync();
    }, [item.startDate, item.endDate]);

    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.requestCard}>
        {/* Status Badge - Top Right */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Days Display */}
          <View style={styles.daysDisplay}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.industrial} />
            ) : (
              <>
                <Text style={styles.daysNumber}>{days}</Text>
                <Text style={styles.daysText}>dies</Text>
              </>
            )}
          </View>

          {/* Date Range */}
          <View style={styles.dateRange}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Inici</Text>
              <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#D0D5DD" />
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Fi</Text>
              <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Reason if exists */}
        {item.reason && (
          <View style={styles.reasonSection}>
            <Text style={styles.reasonText}>"{item.reason}"</Text>
          </View>
        )}

        {/* Rejection Reason */}
        {item.status === VacationStatus.Rejected && item.rejectionReason && (
          <View style={styles.alertBox}>
            <Ionicons name="close-circle" size={16} color="#F04438" />
            <Text style={styles.alertText}>{item.rejectionReason}</Text>
          </View>
        )}

        {/* Approval Info */}
        {item.status === VacationStatus.Approved && item.approvedBy && (
          <View style={styles.approvalBox}>
            <Ionicons name="checkmark-circle" size={16} color="#12B76A" />
            <Text style={styles.approvalBoxText}>Aprovada</Text>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: VacationRequest }) => {
    return <VacationRequestItem item={item} />;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.industrial} />
        <Text style={styles.loadingText}>Carregant historial...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color="#D0D5DD" />
        <Text style={styles.emptyTitle}>No hi ha sol·licituds</Text>
        <Text style={styles.emptyText}>
          Encara no has sol·licitat cap vacances
        </Text>
      </View>
    );
  }

  const YearFilter = () => (
    <View style={styles.yearFilterContainer}>
      <Text style={styles.yearFilterLabel}>Any:</Text>
      <View style={styles.yearButtonsContainer}>
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.yearButtonActive,
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text
              style={[
                styles.yearButtonText,
                selectedYear === year && styles.yearButtonTextActive,
              ]}
            >
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      data={filteredRequests}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={availableYears.length > 1 ? <YearFilter /> : null}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#D0D5DD" />
          <Text style={styles.emptyTitle}>No hi ha sol·licituds</Text>
          <Text style={styles.emptyText}>
            No hi ha sol·licituds per l'any {selectedYear}
          </Text>
        </View>
      }
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
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusContainer: {
    alignItems: "flex-end",
    marginBottom: spacing.m,
  },
  statusBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.l,
    marginBottom: spacing.m,
  },
  daysDisplay: {
    alignItems: "center",
    minWidth: 70,
  },
  daysNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.industrial,
    lineHeight: 52,
  },
  daysText: {
    fontSize: 14,
    color: "#667085",
    fontWeight: "500",
  },
  dateRange: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: spacing.m,
    borderRadius: 12,
  },
  dateItem: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#98A2B3",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
  },
  reasonSection: {
    backgroundColor: "#F9FAFB",
    padding: spacing.m,
    borderRadius: 8,
    marginTop: spacing.s,
  },
  reasonText: {
    fontSize: 14,
    color: "#344054",
    fontStyle: "italic",
    lineHeight: 20,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: "#FEF3F2",
    padding: spacing.m,
    borderRadius: 8,
    marginTop: spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: "#F04438",
  },
  alertText: {
    fontSize: 13,
    color: "#B42318",
    flex: 1,
    lineHeight: 18,
  },
  approvalBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: "#ECFDF3",
    padding: spacing.m,
    borderRadius: 8,
    marginTop: spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: "#12B76A",
  },
  approvalBoxText: {
    fontSize: 13,
    color: "#027A48",
    fontWeight: "500",
  },
  yearFilterContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  yearFilterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    marginBottom: spacing.s,
  },
  yearButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  yearButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s + 2,
    borderRadius: 20,
    backgroundColor: "#F2F4F7",
  },
  yearButtonActive: {
    backgroundColor: colors.industrial,
  },
  yearButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#667085",
  },
  yearButtonTextActive: {
    color: "#fff",
  },
});
