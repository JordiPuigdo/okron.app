import { CommentRow } from "@components/CommentRow";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useWorkOrders } from "@hooks/useWorkOrders";
import {
  AddCommentToWorkOrderRequest,
  WorkOrderComment,
  WorkOrderCommentType,
} from "@interfaces/WorkOrder";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/lib/typescript/components/Swipeable";
import { theme } from "styles/theme";
import { CommentFooter } from "./CommentFooter";

interface Props {
  comments: WorkOrderComment[];
  workOrderId: string;
  onAddComment: (
    commentText: string,
    files: string[],
    type: WorkOrderCommentType,
    commentObject: WorkOrderComment
  ) => void;
  onRefresh: () => void;
}

export const CommentsSection = ({
  comments,
  workOrderId,
  onAddComment,
  onRefresh,
}: Props) => {
  const authStore = useAuthStore();
  const { addCommentToWorkOrder, deleteWorkerComment } = useWorkOrders();
  const { isCRM } = configService.getConfigSync();

  const [newComment, setNewComment] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [commentType, setCommentType] = useState<WorkOrderCommentType>(
    WorkOrderCommentType.Internal
  );
  const [isEditing, setIsEditing] = useState<string | undefined>(undefined);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const openRowRef = React.useRef<Swipeable | null>(null);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleRowOpenStateChange = (ref: Swipeable | null, isOpen: boolean) => {
    if (isOpen) {
      // si ya hay una abierta y es distinta, ciérrala
      if (openRowRef.current && openRowRef.current !== ref) {
        openRowRef.current.close();
      }
      openRowRef.current = ref;
    } else {
      // solo limpia si la que se cerró es la que teníamos guardada
      if (openRowRef.current === ref) {
        openRowRef.current = null;
      }
    }
  };

  const keyboardOffset = Platform.select({
    ios: 100,
    android: isKeyboardVisible ? 300 : 40,
  });

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
      });
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (isEditing !== undefined) {
      deleteWorkerComment(workOrderId, isEditing);
      setIsEditing(undefined);
    }
    Keyboard.dismiss();

    const text = newComment.trim();
    if (!text) return;
    setIsLoading(true);

    const files = attachments.map((uri) => ({
      uri,
      name: uri.split("/").pop() || "file",
      type: uri.match(/\.(mp4|mov)$/) ? "video/mp4" : "image/jpeg",
    }));

    const req: AddCommentToWorkOrderRequest = {
      comment: text,
      operatorId: authStore.factoryWorker!.id,
      workOrderId,
      type: WorkOrderCommentType.External,
      files: files as any,
    };

    // 3) Limpiamos entrada
    setNewComment("");
    setAttachments([]);
    const response = await addCommentToWorkOrder(req);
    onAddComment(text, attachments, commentType, response);
    setIsLoading(false);
    onRefresh();
  };
  const deleteComment = async (id: string) => {
    await deleteWorkerComment(workOrderId, id);
    onRefresh();
  };

  const renderCommentItem = ({ item }: { item: WorkOrderComment }) => (
    <CommentRow
      onPressEdit={() => {
        setIsEditing(item.id);
        setNewComment(item.comment);
      }}
      onPressDelete={() => {
        Alert.alert("Eliminar", `Segur que vols eliminar el comentari?`, [
          {
            text: "Cancel·lar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: () => {
              deleteComment(item.id);
            },
          },
        ]);
      }}
      disabled={false /* pon lógica si necesitas deshabilitar */}
      onRowOpenStateChange={handleRowOpenStateChange}
    >
      <View style={theme.commonStyles.commentHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FontAwesome5
            name="user-cog"
            size={16}
            color="#374151"
            style={theme.commonStyles.icon}
          />
          <Text style={theme.commonStyles.commentOperator}>
            {item.operator.name}
          </Text>
        </View>
        <Text style={theme.commonStyles.commentDate}>
          {dayjs(item.creationDate).format("DD/MM/YYYY HH:mm")}
        </Text>
      </View>

      <Text style={theme.commonStyles.commentText}>{item.comment}</Text>

      {item.urls?.map((url, i) => (
        <TouchableOpacity key={i} onPress={() => Linking.openURL(url)}>
          <Text style={theme.commonStyles.linkText}>
            {url.slice(0, 20) + "..."}
          </Text>
        </TouchableOpacity>
      ))}
    </CommentRow>
  );

  const filteredComments = isCRM
    ? comments
        .filter((x) => x.type == WorkOrderCommentType.External)
        .sort((a, b) => b.creationDate.localeCompare(a.creationDate))
    : comments.sort((a, b) => b.creationDate.localeCompare(a.creationDate));

  return (
    <KeyboardAvoidingView
      style={theme.commonStyles.mainContainerWithPadding}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardOffset}
    >
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: theme.colors.background,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredComments}
          keyExtractor={(c) => c.id || Math.random().toString()}
          renderItem={renderCommentItem}
          onScrollBeginDrag={() => {
            if (openRowRef.current) {
              openRowRef.current.close();
              openRowRef.current = null;
            }
          }}
          ListEmptyComponent={
            <Text style={theme.commonStyles.emptyText}>
              No hi ha descripció de la reparació per a aquesta ordre de
              treball.
            </Text>
          }
        />
      )}

      {/* Previsualización adjuntos */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          style={{
            height: 68, // 60px de imagen + 4px arriba y abajo
            marginVertical: 12, // márgenes mínimos

            flexGrow: 0,
          }}
          contentContainerStyle={{
            alignItems: "center", // centra verticalmente las miniaturas
            paddingHorizontal: 4, // algo de espacio al principio y al final
            flexGrow: 0,
          }}
        >
          {attachments.map((uri, i) => (
            <View
              key={i}
              style={{
                width: 60,
                height: 60,
                borderRadius: 4,
                overflow: "hidden",
                marginRight: 8,
              }}
            >
              <Image
                source={{ uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 12,
                  padding: 2,
                }}
                onPress={() => removeAttachment(i)}
              >
                <Ionicons name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <View
        style={[
          theme.commonStyles.inputContainer,
          {
            paddingBottom: Platform.OS === "ios" ? 20 : 0,
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
      >
        {/* Área de texto */}
        <TextInput
          style={[
            theme.commonStyles.input,
            {
              flex: 1,
              width: undefined, // <— anula el width: "100%"
              marginRight: 8, // espacio a la derecha antes del botón
            },
          ]}
          placeholder="Escriu una descripció de la reparació..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />

        {newComment.length > 0 ? (
          <TouchableOpacity
            style={[theme.commonStyles.addButton, { height: 80 }]}
            onPress={handleAdd}
          >
            <FontAwesome5 name="save" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <CommentFooter
            onPickAttachment={handlePickAttachment}
            commentType={commentType}
            setCommentType={setCommentType}
            isCRM={isCRM}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
