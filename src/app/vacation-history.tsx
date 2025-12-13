import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { VacationHistoryList } from "@components/VacationHistoryList";
import { useVacations } from "@hooks/useVacations";

/**
 * Vacation History Screen - Shows all vacation requests for the operator
 */

export default function VacationHistoryScreen() {
  const { requests, isLoading, loadVacationData } = useVacations();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Historial de vacances",
          headerBackTitle: "Tornar",
        }}
      />
      <View style={styles.container}>
        <VacationHistoryList
          requests={requests}
          isLoading={isLoading}
          onRefresh={loadVacationData}
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
