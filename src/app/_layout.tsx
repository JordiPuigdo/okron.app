import { HeaderButton } from "@components/ui/HeaderButton";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { colors } from "styles/colors";

export default function RootLayout() {
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    configService.loadConfig();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.industrial} />
      <Stack
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: colors.industrial,
            elevation: 4,
            height: 100,
            shadowOpacity: 0.1,
            borderBottomWidth: 0,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 20,
            letterSpacing: 0.5,
          },
          headerTitleAlign: "center",
          headerBackTitleVisible: false,

          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <HeaderButton
                icon="arrow-back-outline"
                color="#dfe4ea"
                onPress={() => navigation.goBack()}
              />
            ) : null,
        })}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Okron - GMAO",
            headerBackVisible: false,
            headerLeft: () => null,
            headerRight: () => null,
          }}
        />

        <Stack.Screen
          name="workorders/index"
          options={{
            title: "Ordres de treball",
            headerBackVisible: false,

            headerLeft: () => (
              <HeaderButton
                icon="add-circle-outline"
                color="#28a745"
                onPress={() => router.push("/new/repairReportForm")}
              />
            ),

            headerRight: () => (
              <HeaderButton
                icon="power"
                color="#ff4d4d"
                onPress={() => {
                  logout();
                  router.push("/");
                }}
              />
            ),
          }}
        />

        <Stack.Screen
          name="workorders/[id]"
          options={{
            title: "Detall de l'ordre",
          }}
        />

        <Stack.Screen
          name="new/repairReportForm"
          options={{
            title: "Nova Ordre",
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingVertical: 18, // ⬆️ más aire arriba y abajo (antes 14 o 16)
    paddingHorizontal: 20,
    minWidth: 72,
    minHeight: 72,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#ffffff25",
  },
  iconLeft: {
    marginLeft: 16,
  },
  iconRight: {
    marginRight: 16,
  },
});
