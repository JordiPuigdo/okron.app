import { VacationCard } from "@components/VacationCard";
import { VacationRequestModal } from "@components/VacationRequestModal";
import { Ionicons } from "@expo/vector-icons";
import { useVacations } from "@hooks/useVacations";
import { CreateVacationRequestDto } from "@interfaces/Vacation";
import { useAuthStore } from "@store/authStore";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "styles/colors";
import { spacing } from "styles/spacing";
import { useRouter } from "expo-router";

/**
 * Profile Screen - Displays operator information and vacation management
 * Following Single Responsibility Principle
 */

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { factoryWorker } = useAuthStore();
  const {
    availableDays,
    totalDays,
    isLoading,
    error,
    hasPendingSync,
    pendingSyncCount,
    createVacationRequest,
  } = useVacations();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRequestVacation = () => {
    setIsModalVisible(true);
  };

  const handleSubmitVacation = async (request: CreateVacationRequestDto) => {
    try {
      await createVacationRequest(request);
      setIsModalVisible(false);

      Alert.alert(
        "Sol·licitud enviada",
        hasPendingSync
          ? "La teva sol·licitud s'enviarà quan recuperis connexió a internet."
          : "La teva sol·licitud de vacances s'ha enviat correctament.",
        [{ text: "OK" }]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        "No s'ha pogut crear la sol·licitud. Si us plau, torna-ho a intentar.",
        [{ text: "OK" }]
      );
    }
  };

  if (!factoryWorker) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>
          No s'ha trobat informació de l'operari
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle"
              size={80}
              color={colors.industrial}
            />
          </View>
          <Text style={styles.operatorName}>{factoryWorker.name}</Text>
          <Text style={styles.operatorId}>ID: {factoryWorker.id}</Text>
        </View>

        {/* Pending Sync Badge */}
        {hasPendingSync && (
          <View style={styles.syncBadge}>
            <Ionicons name="cloud-offline-outline" size={16} color="#F79009" />
            <Text style={styles.syncBadgeText}>
              {pendingSyncCount} sol·licitud{pendingSyncCount > 1 ? "s" : ""}{" "}
              pendent
              {pendingSyncCount > 1 ? "s" : ""} de sincronitzar
            </Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#F04438" />
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Vacation Card */}
        <VacationCard
          availableDays={availableDays}
          totalDays={totalDays}
          isLoading={isLoading}
          onRequestVacation={handleRequestVacation}
        />

        {/* Additional Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informació</Text>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/vacation-history")}
          >
            <View style={styles.infoLeft}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#667085"
              />
              <Text style={styles.infoText}>Historial de vacances</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#98A2B3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/vacation-pending")}
          >
            <View style={styles.infoLeft}>
              <Ionicons name="time-outline" size={20} color="#667085" />
              <Text style={styles.infoText}>Sol·licituds pendents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#98A2B3" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#667085" />
              <Text style={styles.infoText}>Ajuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#98A2B3" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Vacation Request Modal */}
      <VacationRequestModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitVacation}
        availableDays={availableDays}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.l,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D2939",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: spacing.l,
    alignItems: "center",
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: spacing.m,
  },
  operatorName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: spacing.xs,
  },
  operatorId: {
    fontSize: 14,
    color: "#667085",
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFAEB",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.m,
    gap: spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: "#F79009",
  },
  syncBadgeText: {
    fontSize: 14,
    color: "#B54708",
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3F2",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.m,
    gap: spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: "#F04438",
  },
  errorMessage: {
    fontSize: 14,
    color: "#F04438",
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: "#667085",
    textAlign: "center",
    marginTop: spacing.xl,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: spacing.m,
    marginTop: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: spacing.m,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
  },
  infoText: {
    fontSize: 16,
    color: "#344054",
  },
});
