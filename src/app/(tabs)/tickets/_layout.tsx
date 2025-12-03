import { Stack } from "expo-router";
import React from "react";
import { colors } from "styles/colors";

export default function TicketsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.industrial,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Tickets",
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "Detall del ticket" }} />
    </Stack>
  );
}
