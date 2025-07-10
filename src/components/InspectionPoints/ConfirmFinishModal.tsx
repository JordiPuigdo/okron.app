import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmFinishModal: React.FC<Props> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>¿Finalitzar ordre de treball?</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.confirm]}
              onPress={onConfirm}
            >
              <MaterialIcons name="check-circle" size={48} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onCancel}
            >
              <MaterialIcons name="cancel" size={48} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#333",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirm: {
    backgroundColor: "#28a745",
  },
  cancel: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
});
