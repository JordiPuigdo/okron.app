import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Stack } from "expo-router";
import { VacationPendingList } from "@components/VacationPendingList";
import { useVacations } from "@hooks/useVacations";
import { useAuthStore } from "@store/authStore";
import { VacationRequest } from "@interfaces/Vacation";

/**
 * Vacation Pending Screen - Shows pending vacation requests for approval
 * Only accessible for managers/admins
 */

export default function VacationPendingScreen() {
  const { factoryWorker } = useAuthStore();
  const { isLoading, getPendingRequests, approveRequest, rejectRequest } =
    useVacations();

  const [pendingRequests, setPendingRequests] = useState<VacationRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPendingRequests = async () => {
    setRefreshing(true);
    const requests = await getPendingRequests();
    setPendingRequests(requests);
    setRefreshing(false);
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    if (!factoryWorker) return;

    try {
      await approveRequest(requestId, factoryWorker.id);
      await loadPendingRequests();
    } catch (error) {
      throw error;
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!factoryWorker) return;

    try {
      await rejectRequest(requestId, factoryWorker.id, reason);
      await loadPendingRequests();
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Sol·licituds pendents",
          headerBackTitle: "Tornar",
        }}
      />
      <View style={styles.container}>
        <VacationPendingList
          requests={pendingRequests}
          isLoading={isLoading || refreshing}
          onRefresh={loadPendingRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
