import { Ionicons } from "@expo/vector-icons";
import { OperatorType } from "@interfaces/Operator";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "styles/colors";

export default function TabsLayout() {
  const { isCRM } = configService.getConfigSync();
  const { factoryWorker } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.industrial,
        tabBarInactiveTintColor: "#98A2B3",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: {
          height: 64 + insets.bottom, // 👈 un pelín más alta con el safe area
          paddingTop: 6,
          paddingBottom: insets.bottom || 8, // 👈 empuja el contenido hacia arriba
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="workorders"
        options={{
          title: "Ordres de treball",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {!isCRM && factoryWorker?.operatorType === OperatorType.Maintenance ? (
        <Tabs.Screen
          name="tickets"
          options={{
            title: "Tickets",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "ticket" : "ticket-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="tickets"
          options={{
            tabBarButton: () => null,
          }}
        />
      )}
    </Tabs>
  );
}
