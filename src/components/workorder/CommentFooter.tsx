// CommentFooter.tsx
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { WorkOrderCommentType } from "@interfaces/WorkOrder";
import React from "react";
import { TouchableOpacity, View } from "react-native";
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
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
      }}
    >
      <TouchableOpacity
        onPress={onPickAttachment}
        style={{ alignItems: "center" }}
      >
        <FontAwesome5 name="camera" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      {isCRM && (
        <>
          <TouchableOpacity
            onPress={() => setCommentType(WorkOrderCommentType.Internal)}
            style={{ alignItems: "center" }}
          >
            <Ionicons
              name="lock-closed"
              size={20}
              color={
                commentType === WorkOrderCommentType.Internal
                  ? theme.colors.primary
                  : "#666"
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCommentType(WorkOrderCommentType.External)}
            style={{ alignItems: "center" }}
          >
            <Ionicons
              name="globe-outline"
              size={20}
              color={
                commentType === WorkOrderCommentType.External
                  ? theme.colors.primary
                  : "#666"
              }
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
