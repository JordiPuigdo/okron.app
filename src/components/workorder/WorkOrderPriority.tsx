import { FontAwesome5 } from "@expo/vector-icons";
import { WorkOrderPriority } from "@interfaces/WorkOrder";
import { RepairReport } from "app/new/repairReportForm";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  setFormData: (
    data:
      | Partial<RepairReport>
      | ((prev: Partial<RepairReport>) => Partial<RepairReport>)
  ) => void;
}

const WorkOrderPrioritySelection = ({ setFormData }: Props) => {
  const [selected, setSelected] = useState<string | null>("low");

  const priorities = [
    {
      id: "low",
      label: "Baixa",
      color: "#5EC269",
      icon: "arrow-down",
      type: WorkOrderPriority.Low,
    },
    {
      id: "medium",
      label: "Mitjana",
      color: "#F4D176",
      icon: "equals",
      type: WorkOrderPriority.Medium,
    },
    {
      id: "high",
      label: "Alta",
      color: "#DD524C",
      icon: "arrow-up",
      type: WorkOrderPriority.High,
    },
    {
      id: "critical",
      label: "Crítica",
      color: "#8B0000",
      icon: "exclamation-triangle",
      type: WorkOrderPriority.Critical,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prioritat</Text>
      <View style={styles.row}>
        {priorities.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.button,
              { borderColor: p.color },
              selected === p.id && { backgroundColor: p.color },
            ]}
            onPress={() => {
              setSelected(p.id);
              setFormData((prev) => ({ ...prev, priority: p.type }));
            }}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={p.icon as any}
              size={18}
              color={selected === p.id ? "white" : p.color}
            />
            <Text
              style={[
                styles.label,
                { color: selected === p.id ? "white" : p.color },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#055a9b",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 12,
  },

  button: {
    width: "48%", // força 2 per línia
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default WorkOrderPrioritySelection;
