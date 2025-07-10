import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { theme } from "styles/theme";

export const LoadingScreen = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // ocupa toda la pantalla
    backgroundColor: "rgba(255,255,255,0.7)", // fondo semi-transparente
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // siempre arriba
  },
});
