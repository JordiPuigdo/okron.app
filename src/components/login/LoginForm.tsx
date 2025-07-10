import { useLogin } from "@hooks/useLogin";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

interface Props {
  onLogin: (username: string) => Promise<boolean>;
}

export const LoginForm = ({ onLogin }: Props) => {
  const [username, setUsername] = useState("");
  const { login, loading, error } = useLogin();

  const router = useRouter();

  const onSubmit = async () => {
    if (username.length === 0) {
      return;
    }
    onLogin(username);
    const response = await login(username);
    if (response) {
      router.push("/workorders");
    } else {
      alert("Usuari no trobat");
    }
  };

  return (
    <View style={theme.commonStyles.formContainer}>
      <TextInput
        placeholder="Codi Operari"
        value={username}
        onChangeText={setUsername}
        style={theme.commonStyles.input}
        autoCapitalize="none"
      />

      {error && <Text style={theme.commonStyles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[
          theme.commonStyles.primaryButton,
          loading && theme.commonStyles.disabledButton,
        ]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={theme.commonStyles.buttonText}>
          {loading ? "Carregant..." : "Entrar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
