// components/workorder/WorkOrderCompletionModal.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

interface Props {
  visible: boolean;
  title: string;
  commentText: string;
  attachments: string[];
  loading?: boolean;
  onChangeComment: (text: string) => void;
  onAddAttachment: () => void;
  onRemoveAttachment: (index: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmColor?: string;
  cancelColor?: string;
}

export const WorkOrderCompletionModal = ({
  visible,
  title,
  commentText,
  attachments,
  loading,
  onChangeComment,
  onAddAttachment,
  onRemoveAttachment,
  onCancel,
  onConfirm,
  confirmColor = theme.colors.success,
  cancelColor = theme.colors.error,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={theme.commonStyles.backdrop}>
        <View style={[theme.commonStyles.modalBox, { padding: 20 }]}>
          <Text style={theme.commonStyles.modalTitle}>{title}</Text>

          {/* Input comentario */}
          <TextInput
            style={[theme.commonStyles.textArea, { marginVertical: 8 }]}
            multiline
            value={commentText}
            onChangeText={onChangeComment}
            placeholder="Escriu observacions..."
            placeholderTextColor="#999"
          />

          {/* Botón cámara */}
          <TouchableOpacity
            style={[
              theme.commonStyles.addButton,
              {
                flexDirection: "row",
                alignItems: "center",
                height: 50,
                marginVertical: 8,
              },
            ]}
            onPress={onAddAttachment}
          >
            <FontAwesome5 name="camera" size={20} color="#fff" />
            <Text
              style={{
                color: "#fff",
                marginLeft: 10,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Afegir foto o vídeo
            </Text>
          </TouchableOpacity>

          {/* Preview adjuntos */}
          <ScrollView
            horizontal
            style={[theme.commonStyles.previewRow, { marginVertical: 8 }]}
          >
            {attachments.map((uri, i) => (
              <View key={i} style={theme.commonStyles.previewBox}>
                <Image
                  source={{ uri }}
                  style={theme.commonStyles.previewImage}
                />
                <TouchableOpacity
                  style={theme.commonStyles.removeIcon}
                  onPress={() => onRemoveAttachment(i)}
                >
                  <Ionicons name="close-circle" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Acciones */}
          <View
            style={[
              theme.commonStyles.buttonRow,
              { justifyContent: "space-evenly", marginTop: 10 },
            ]}
          >
            <TouchableOpacity
              style={[
                theme.commonStyles.modalBtn,
                { backgroundColor: cancelColor },
              ]}
              onPress={onCancel}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                theme.commonStyles.modalBtn,
                { backgroundColor: confirmColor },
              ]}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="check" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
