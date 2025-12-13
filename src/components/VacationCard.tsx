import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "styles/colors";
import { spacing } from "styles/spacing";

/**
 * VacationCard Component - Displays vacation balance and request button
 * Following Single Responsibility Principle
 */

interface VacationCardProps {
  availableDays: number;
  usedDays?: number;
  totalDays?: number;
  isLoading?: boolean;
  onRequestVacation: () => void;
}

export const VacationCard: React.FC<VacationCardProps> = ({
  availableDays,
  usedDays = 0,
  totalDays = 22,
  isLoading = false,
  onRequestVacation,
}) => {
  const percentage = totalDays > 0 ? (availableDays / totalDays) * 100 : 0;

  return (
    <View style={styles.card}>
      {/* Main Days Display */}
      <View style={styles.mainDisplay}>
        <Text style={styles.availableDaysNumber}>{availableDays}</Text>
        <Text style={styles.availableDaysLabel}>dies disponibles</Text>
      </View>

      {/* Total Days Info */}
      <View style={styles.totalInfo}>
        <Text style={styles.totalText}>de {totalDays} dies anuals</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>

      {/* Request Button */}
      <TouchableOpacity
        style={styles.requestButton}
        onPress={onRequestVacation}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add-outline" size={24} color="#fff" />
            <Text style={styles.requestButtonText}>Sol·licitar vacances</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: spacing.l,
    marginVertical: spacing.s,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mainDisplay: {
    alignItems: "center",
    paddingVertical: spacing.l,
  },
  availableDaysNumber: {
    fontSize: 64,
    fontWeight: "bold",
    color: colors.industrial,
    lineHeight: 72,
  },
  availableDaysLabel: {
    fontSize: 16,
    color: "#667085",
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  totalInfo: {
    alignItems: "center",
    marginBottom: spacing.m,
  },
  totalText: {
    fontSize: 14,
    color: "#98A2B3",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F2F4F7",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: spacing.l,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.industrial,
    borderRadius: 3,
  },
  requestButton: {
    backgroundColor: colors.industrial,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.m + 2,
    borderRadius: 12,
    gap: spacing.s,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
