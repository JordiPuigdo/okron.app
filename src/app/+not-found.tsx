// app/+not-found.tsx
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} />
      <Text style={styles.title}>Pantalla no trobada</Text>
      <Text style={styles.subtitle}>
        La ruta que has intentat obrir no existeix o s’ha mogut.
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.btn,
            styles.btnGhost,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back-outline" size={18} />
          <Text style={styles.btnTextGhost}>Torna enrere</Text>
        </Pressable>

        <Link href="/(tabs)/workorders" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <Ionicons name="home-outline" size={18} color="#fff" />
            <Text style={styles.btnTextPrimary}>Anar a inici</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnGhost: {
    backgroundColor: "#F1F5F9",
  },
  btnPrimary: {
    backgroundColor: "#0d6efd",
  },
  btnTextGhost: {
    fontWeight: "700",
  },
  btnTextPrimary: {
    color: "#fff",
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.9,
  },
});
