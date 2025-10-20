import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

import * as ImagePicker from "expo-image-picker";

export interface CommentUploadProps {
  files: string[];
  comment: string;
}

interface Props {
  setFiles: (commentUpload: CommentUploadProps) => void;
}

const CommentUploadPhoto = ({ setFiles }: Props) => {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const handlePickAttachment = async () => {
    Alert.alert("Por favor elige camara o galeria", null, [
      { text: "Galería", onPress: () => pickAttachment("gallery") },
      { text: "Camara", onPress: () => pickAttachment("camera") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const pickAttachment = async (type) => {
    let result;

    if (type == "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
      });
    }

    if (type == "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
      });
    }

    if (!result.canceled) {
      result.assets.map((res) => {
        setAttachments((prev) => [...prev, res.uri]);
        setFiles({ files: [...attachments, res.uri], comment });
      });
    }
  };

  const handleAddComment = (text: string) => {
    setComment(text);
    setFiles({ comment: text, files: attachments });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={comment}
        onChangeText={(text) => handleAddComment(text)}
        placeholder="Comentaris..."
        multiline
        style={styles.textArea}
      />
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
        onPress={handlePickAttachment}
      >
        <FontAwesome5 name="camera" size={20} color="#fff" />
      </TouchableOpacity>
      <ScrollView horizontal style={theme.commonStyles.previewRow}>
        {attachments.map((uri, i) => (
          <View key={i} style={theme.commonStyles.previewBox}>
            <Image source={{ uri }} style={theme.commonStyles.previewImage} />
            <TouchableOpacity
              style={theme.commonStyles.removeIcon}
              onPress={() =>
                setAttachments((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CommentUploadPhoto;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFEDD5", // bg-orange-50
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  imageWrapper: {
    position: "relative",
    width: 60,
    height: 60,
    marginRight: 8,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    padding: 2,
  },
});
