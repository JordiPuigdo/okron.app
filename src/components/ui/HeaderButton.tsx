import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

export function HeaderButton({
  icon,
  color,
  onPress,
}: {
  icon: any;
  color: string;
  onPress: () => void;
}) {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.iconButton, { backgroundColor: `${color}33` }]}
      >
        <Ionicons name={icon} size={30} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    marginHorizontal: 12,
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
