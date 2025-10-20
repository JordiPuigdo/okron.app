import { LoginForm } from "@components/login/LoginForm";
import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { colors } from "styles/colors";
import { theme } from "styles/theme";

const icon = require("../../../assets/images/adaptive-icon.png");

export const LoginScreen = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={theme.commonStyles.screenContainer}>
          {/* Logo */}
          <Image
            source={icon}
            style={theme.commonStyles.logo}
            resizeMode="contain"
          />

          {/* Formulario */}
          <View style={{ justifyContent: "center", width: "80%" }}>
            <LoginForm />
          </View>

          {/* Frases corporativas */}
          <View style={styles.footerBrand}>
            <Text style={styles.brandSubtitle}>
              Sistema de Gestió de Mantenimient
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  footerBrand: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
    width: "100%",
  },
  brandTitle: {
    fontSize: 14,
    color: colors.industrial,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.industrial,
    fontWeight: "500",
    marginTop: 2,
  },
});
