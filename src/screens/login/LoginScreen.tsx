import { LoginForm } from "@components/login/LoginForm";
import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "styles/theme";

// const icon = require("../../../assets/logoPng.png");
const url = process.env.EXPO_PUBLIC_LOGO;

export const LoginScreen = () => {
  //const [isLoading, setIsLoading] = useState(false);

  const onLogin = async (username: string): Promise<boolean> => {
    //setIsLoading(true);
    return true;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={theme.commonStyles.screenContainer}>
          <Image
            source={{ uri: url }}
            style={theme.commonStyles.logo}
            resizeMode="contain"
          />
          <View style={{ justifyContent: "center", width: "80%" }}>
            <LoginForm onLogin={onLogin} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
