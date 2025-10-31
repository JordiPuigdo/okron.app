import { FontAwesome5 } from "@expo/vector-icons";
import { WorkOrderCommentType } from "@interfaces/WorkOrder";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";

interface Props {
  onPickAttachment: () => void;
  commentType: WorkOrderCommentType;
  setCommentType: (type: WorkOrderCommentType) => void;
  isCRM: boolean;
}

export const CommentFooter = ({
  onPickAttachment,
  commentType,
  setCommentType,
  isCRM,
}: Props) => {
  const activeColor = theme.colors.primary;
  const inactiveColor = "#6b7280";

  return (
    <View style={styles.container}>
      {/* Botón cámara */}
      <TouchableOpacity style={styles.button} onPress={onPickAttachment}>
        <FontAwesome5 name="camera" size={22} color={activeColor} />
      </TouchableOpacity>

      {/* Separador visual */}
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 10,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  button: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  active: {
    backgroundColor: theme.colors.primary,
    shadowOpacity: 0.15,
  },
  label: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 4,
    fontWeight: "500",
  },
  activeLabel: {
    color: "#fff",
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: "#d1d5db",
  },
});
