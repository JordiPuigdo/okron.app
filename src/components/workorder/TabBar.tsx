import { WorkOrderType } from "@interfaces/WorkOrder";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { theme } from "styles/theme";
import { TabKey, TABS } from "./utils";

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  workOrderType: WorkOrderType;
}

export const TabBar = ({
  activeTab,
  onTabChange,
  workOrderType,
}: TabBarProps) => {
  const filteredTabs = TABS.filter((tab) => {
    if (
      workOrderType === WorkOrderType.Corrective ||
      workOrderType == WorkOrderType.Ticket
    ) {
      return tab.key != "inspection";
    }

    return tab.visible !== false;
  });

  return (
    <View style={theme.commonStyles.tabContainer}>
      {filteredTabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={theme.commonStyles.tabButton}
        >
          {React.cloneElement(tab.icon, {
            color: activeTab === tab.key ? "#59408F" : "#888",
          })}
        </TouchableOpacity>
      ))}
    </View>
  );
};
