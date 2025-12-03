import { Ionicons } from "@expo/vector-icons";
import { SignatureType } from "@interfaces/Signature";
import React, { useRef } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import { theme } from "styles/theme";

interface Props {
  signatureType: SignatureType;
  handleConfirmSignature?: (signature: string) => void;
  onClose?: () => void;
}

const SignModal = ({
  signatureType,
  handleConfirmSignature,
  onClose,
}: Props) => {
  const sigCanvas = useRef<any>(null);

  const handleSignature = (sig: string) => {
    handleConfirmSignature(sig);
    sigCanvas.current.clearSignature();
  };
  const handleEmpty = () => {};
  const getTitle = () => {
    switch (signatureType) {
      case "WORKER":
        return "Firma del tècnic";
      case "CLIENT":
        return "Firma del client";
      default:
        return "Firma";
    }
  };

  return (
    <Modal
      transparent
      visible={signatureType !== undefined}
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{getTitle()}</Text>

          <View style={styles.signatureContainer}>
            <SignatureCanvas
              ref={sigCanvas}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              descriptionText="Firma del treballador"
              clearText="Netejar"
              confirmText="Guardar"
              webviewProps={{
                cacheEnabled: true,
                androidLayerType: "hardware",
              }}
            />
          </View>

          <View style={theme.commonStyles.buttonRow}>
            <TouchableOpacity
              style={[
                theme.commonStyles.modalBtn,
                { backgroundColor: theme.colors.warning },
              ]}
              onPress={() => {
                sigCanvas.current.clearSignature();
              }}
            >
              <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={[theme.commonStyles.buttonRow, { marginTop: 24 }]}>
            <TouchableOpacity
              style={[
                theme.commonStyles.modalBtn,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={() => {
                sigCanvas.current.clearSignature();
                onClose();
              }}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                theme.commonStyles.modalBtn,
                { backgroundColor: theme.colors.success },
              ]}
              onPress={() => sigCanvas.current.readSignature()}
            >
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SignModal;

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden" as "hidden",
    padding: 16,
  },
  modalTitle: { fontSize: 18, marginBottom: 12 },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 5,
    padding: 10,
    height: 100,
    marginBottom: 12,
  },
  addButton: {
    padding: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 12,
  },
  addButtonText: { color: "#fff", fontSize: 16 },
  previewRow: { marginBottom: 12 },
  previewBox: { marginRight: 10, position: "relative" },
  previewImage: { width: 60, height: 60, borderRadius: 5 },
  removeIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 2,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  signatureContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    overflow: "hidden" as const,
    marginBottom: 12,
  },
};
