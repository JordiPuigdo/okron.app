import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { theme } from "styles/theme";

interface Props {
  item: any;
  onDelete: () => void;
}

export const SwipeToDeleteItem = ({ item, onDelete }: Props) => {
  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteBox} onPress={onDelete}>
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.operatorName}>{item.operator.name}</Text>
          <MaterialIcons
            name={item.type === "Travel" ? "directions-car" : "work"}
            size={20}
            color={
              item.type === "Travel"
                ? theme.colors.primary
                : theme.colors.success
            }
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{item.startTime}</Text>
          <Text style={styles.time}>{item.endTime || "--"}</Text>
          <Text style={styles.totalTime}>{item.totalTime}</Text>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  time: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  totalTime: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  deleteBox: {
    backgroundColor: theme.colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 8,
  },
});
