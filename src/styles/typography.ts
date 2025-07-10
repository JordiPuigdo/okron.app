import { Platform, TextStyle } from "react-native";

export const typography = {
  header: {
    fontSize: 24,
    fontWeight: "bold" as "bold",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif",
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as "600",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif-medium",
  },
  body: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif",
  },
  caption: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    fontSize: 20,
    fontWeight: "bold" as "bold",
  },
};
