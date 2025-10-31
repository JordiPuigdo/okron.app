import { FontAwesome5 } from "@expo/vector-icons";
import { OriginWorkOrder } from "@interfaces/WorkOrder";
import { configService } from "@services/configService";
import { RepairReport } from "app/new/repairReportForm";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  setFormData: (
    data:
      | Partial<RepairReport>
      | ((prev: Partial<RepairReport>) => Partial<RepairReport>)
  ) => void;
  selectedDefault: OriginWorkOrder | null;
}

const OriginWorkOrderSelection = ({ setFormData, selectedDefault }: Props) => {
  const { isCRM } = configService.getConfigSync();
  const [selected, setSelected] = useState<OriginWorkOrder | null>(
    selectedDefault
  );

  if (isCRM) return null;

  const origins = [
    {
      id: "production",
      label: "Prod",
      icon: "industry",
      color: "#4CAF50",
      type: OriginWorkOrder.Production,
    },
    {
      id: "maintenance",
      label: "Mant",
      icon: "tools",
      color: "#055a9b",
      type: OriginWorkOrder.Maintenance,
    },
    {
      id: "quality",
      label: "Qua",
      icon: "check-circle",
      color: "#F4D176",
      type: OriginWorkOrder.Quality,
    },
  ];

  const handleSelect = (origin: OriginWorkOrder) => {
    setSelected(origin);
    setFormData((prev) => ({ ...prev, originWorkOrder: origin }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Origen de l'ordre</Text>
      <View style={styles.row}>
        {origins.map((o) => {
          const isActive = selected === o.type;
          return (
            <TouchableOpacity
              key={o.id}
              style={[
                styles.button,
                { borderColor: o.color },
                isActive && { backgroundColor: o.color },
              ]}
              onPress={() => handleSelect(o.type)}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name={o.icon as any}
                size={18}
                color={isActive ? "white" : o.color}
              />
              <Text
                style={[styles.label, { color: isActive ? "white" : o.color }]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default OriginWorkOrderSelection;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#055a9b",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 12,
  },
  button: {
    flexBasis: "30%", // 3 per línia
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
