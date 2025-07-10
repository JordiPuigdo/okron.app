import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "styles/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  pointDescription: string;
}

export const IncidentModal = ({
  visible,
  onClose,
  pointDescription,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      {/*} <View style={theme.commonStyles.overlay}>
        <View style={theme.commonStyles.modalContent}>
          <Text style={theme.commonStyles.title}>Crear incidencia</Text>
          <Text style={theme.commonStyles.description}>{pointDescription}</Text>

          <View style={theme.commonStyles.buttonContainer}>
            <TouchableOpacity style={theme.commonStyles.closeButton} onPress={onClose}>
              <Text style={theme.commonStyles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>*/}
    </Modal>
  );
};
