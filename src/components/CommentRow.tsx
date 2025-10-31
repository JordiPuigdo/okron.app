// CommentRow.tsx
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { theme } from "styles/theme";

interface CommentRowProps {
  children: React.ReactNode;
  onPressEdit?: () => void;
  onPressDelete?: () => void;
  disabled?: boolean;
  onRowOpenStateChange?: (ref: Swipeable | null, isOpen: boolean) => void;
}

export const CommentRow: React.FC<CommentRowProps> = ({
  children,
  onPressEdit,
  onPressDelete,
  disabled,
  onRowOpenStateChange,
}) => {
  const swipeRef = useRef<Swipeable>(null);

  const renderActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    side: "left" | "right"
  ) => {
    const isLeft = side === "left";
    const scale = dragX.interpolate({
      inputRange: isLeft ? [0, 50] : [-50, 0],
      outputRange: isLeft ? [0, 1] : [1, 0],
      extrapolate: "clamp",
    });

    const bg = isLeft
      ? theme.colors?.error || "#DC2626"
      : theme.colors?.secondary || "#14B8A6";

    return (
      <View
        style={[
          styles.actions,
          isLeft ? styles.actionsLeft : styles.actionsRight,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.action,
            isLeft ? styles.actionLeft : styles.actionRight,
            { backgroundColor: bg },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            swipeRef.current?.close();
            isLeft ? onPressDelete?.() : onPressEdit?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={
            isLeft ? "Eliminar comentario" : "Editar comentario"
          }
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            {isLeft ? (
              <Ionicons name="trash-bin" size={28} color="#fff" />
            ) : (
              <FontAwesome5 name="edit" size={26} color="#fff" />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      enabled={!disabled}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      containerStyle={styles.swipeableContainer}
      childrenContainerStyle={styles.swipeableChildren}
      rightThreshold={40}
      leftThreshold={40}
      renderRightActions={(progress, dragX) =>
        renderActions(progress, dragX, "right")
      }
      renderLeftActions={(progress, dragX) =>
        renderActions(progress, dragX, "left")
      }
      onSwipeableWillOpen={() => onRowOpenStateChange?.(swipeRef.current, true)}
      onSwipeableClose={() => onRowOpenStateChange?.(swipeRef.current, false)}
    >
      <View style={styles.card}>{children}</View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  swipeableChildren: {
    borderRadius: 8,
  },
  card: {
    flexDirection: "column",
    backgroundColor: "#E9EEF4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    width: 80,
    marginBottom: 12,
    borderRadius: 8,
  },
  actionsLeft: {
    marginRight: 8,
  },
  actionsRight: {
    marginLeft: 8,
  },
  action: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  actionLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  actionRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});
