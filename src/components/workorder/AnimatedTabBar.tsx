import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";
import { TabItem, TabKey } from "./utils";

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  tabs: TabItem[];
}

export const AnimatedTabBar = ({ activeTab, onTabChange, tabs }: Props) => {
  return (
    <View style={styles.container}>
      {tabs
        .filter((t) => t.visible)
        .map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={[styles.tabButton, isActive && styles.activeTab]}
              activeOpacity={0.85}
            >
              <View style={{ opacity: isActive ? 1 : 0.5 }}>{tab.icon}</View>
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? theme.colors.primary : "#666" },
                ]}
              >
                {getLabel(tab.key)}
              </Text>

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

function getLabel(key: TabKey): string {
  switch (key) {
    case "workOrder":
      return "Ordre";
    case "inspection":
      return "Inspecció";
    case "comments":
      return "Comentaris";
    case "spareParts":
      return "Recanvis";
    case "times":
      return "Temps";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#d9d9d9",
    justifyContent: "space-around",
    paddingVertical: 8,
    elevation: 2,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  activeTab: {
    backgroundColor: "#f0f7ff",
    borderRadius: 10,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "40%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});
