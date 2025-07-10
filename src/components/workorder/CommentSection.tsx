import { FontAwesome5 } from "@expo/vector-icons";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { WorkOrderComment } from "@interfaces/WorkOrder";
import { useAuthStore } from "@store/authStore";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

interface Props {
  comments: WorkOrderComment[];
  onAddComment: (commentText: string) => void;
  workOrderId?: string;
}

export const CommentsSection = ({
  comments,
  onAddComment,
  workOrderId,
}: Props) => {
  const [newComment, setNewComment] = useState("");
  const authStore = useAuthStore();

  const { addCommentToWorkOrder } = useWorkOrders();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    addCommentToWorkOrder({
      comment: newComment.trim(),
      operatorId: authStore.factoryWorker.id,
      workOrderId: workOrderId ?? "",
    });
    setNewComment("");
    Keyboard.dismiss();
  };

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const getKeyboardOffset = () => {
    return Platform.select({
      ios: 100, // Valor fijo para iOS
      android: isKeyboardVisible ? 300 : 20, // Dinámico para Android
    });
  };

  const renderCommentItem = ({ item }: { item: WorkOrderComment }) => (
    <View style={theme.commonStyles.commentItem}>
      <View style={theme.commonStyles.commentHeader}>
        <Text style={theme.commonStyles.commentOperator}>
          {item.operator.name}
        </Text>
        <Text style={theme.commonStyles.commentDate}>
          {dayjs(item.creationDate).format("DD/MM/YYYY HH:mm")}
        </Text>
      </View>
      <Text style={theme.commonStyles.commentText}>{item.comment}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={theme.commonStyles.mainContainerWithPadding}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={getKeyboardOffset()}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id ?? Math.random().toString()}
        renderItem={renderCommentItem}
        ListEmptyComponent={
          <Text style={theme.commonStyles.emptyText}>
            No hay comentarios aún.
          </Text>
        }
        contentContainerStyle={[
          { flexGrow: 1 },
          comments.length === 0 && theme.commonStyles.emptyContainer,
        ]}
      />

      <View
        style={[
          theme.commonStyles.inputContainer,
          {
            paddingBottom: Platform.OS === "ios" ? 20 : 0,
            backgroundColor: "white",
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <TextInput
            style={theme.commonStyles.input}
            placeholder="Escribe un comentario..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
        </View>
        <TouchableOpacity
          style={theme.commonStyles.addButton}
          onPress={handleAddComment}
        >
          <FontAwesome5 name="save" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
