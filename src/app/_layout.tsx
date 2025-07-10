import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@store/authStore";
import { router, Stack } from "expo-router";
import React from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";
import { colors } from "styles/colors";

import { theme } from "styles/theme";

export default function RootLayout() {
  const { logout } = useAuthStore();
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.placeholderText}
      />
      <Stack
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: colors.primary,
            elevation: 4,
            height: 100,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
          headerTitleAlign: "center",
          headerBackTitleVisible: false,
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={theme.commonStyles.largeBackButton}
              >
                <View style={theme.commonStyles.backButtonContent}>
                  <Ionicons name="arrow-back" size={40} color="#fff" />
                </View>
              </TouchableOpacity>
            ) : null,
        })}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Okron",
            headerBackTitle: "Atrás",
            headerLeft: () => null,
            headerRight: () => null,
            headerBackVisible: false,
          }}
        />

        <Stack.Screen
          name="workorders/index"
          options={({ navigation }) => ({
            title: "Ordres de treball",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  logout();
                  router.push("/");
                }}
                style={{
                  marginRight: 20,
                  padding: 12,
                  minWidth: 60,
                  minHeight: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: "#ffffff22",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={theme.commonStyles.backButtonContent}>
                  <Ionicons name="log-out-outline" size={40} color="#fff" />
                </View>
              </TouchableOpacity>
            ),
            headerBackVisible: false,
            headerLeft: () => null,
          })}
        />
      </Stack>
    </>
  );
}
