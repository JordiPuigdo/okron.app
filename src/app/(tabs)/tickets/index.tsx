import { TicketCard } from "@components/TicketCard";
import { TicketsHeader } from "@components/TicketsHeader";
import { Ionicons } from "@expo/vector-icons";
import { useTicketsSync } from "@hooks/useTicketsSync";
import { useTicketsStore } from "@store/ticketStore";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function TicketsScreen() {
  useTicketsSync();
  const router = useRouter();

  const byId = useTicketsStore((s) => s.byId);
  const allIds = useTicketsStore((s) => s.allIds);
  const lastSync = useTicketsStore((s) => s.lastSync);

  const [refreshing, setRefreshing] = useState(false);

  const data = useMemo(
    () => allIds.map((id) => byId[id]).filter(Boolean),
    [allIds, byId]
  );

  const loading = !lastSync && data.length === 0;
  const empty = !loading && data.length === 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregant tickets…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={
        data.length === 0 ? styles.center : styles.listContent
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
          }}
        />
      }
      renderItem={({ item }) => (
        <TicketCard
          item={item}
          onPress={() => router.push(`/(tabs)/tickets/${item.id}`)}
        />
      )}
      ListEmptyComponent={
        empty ? (
          <View style={styles.emptyBox}>
            <Ionicons name="ticket-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No hi ha tickets pendents</Text>
            <Text style={styles.emptySubtitle}>
              Quan n’hi hagi, els veuràs aquí mateix.
            </Text>
          </View>
        ) : null
      }
      ListHeaderComponent={<TicketsHeader data={data} lastSync={new Date()} />}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 8 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 10, color: "#475569" },
  emptyBox: { alignItems: "center", paddingHorizontal: 24 },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
