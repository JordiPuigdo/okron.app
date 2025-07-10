import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";

import { WorkOrder } from "@interfaces/WorkOrder";
import { theme } from "styles/theme";
import { useWareHouses } from "@hooks/useWarehouse";

interface SparePartsSectionProps {
  workOrder: WorkOrder;
}

export const SparePartsSection = ({ workOrder }: SparePartsSectionProps) => {
  const { stockAvailability } = useWareHouses();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Disponible</Text>
      <FlatList
        data={stockAvailability}
        keyExtractor={(item) => item.sparePartId}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.partName}>{item.sparePartName}</Text>
            <Text style={styles.partCode}>Código: {item.sparePartCode}</Text>
            {item.warehouseStock.map((stock) => (
              <Text key={stock.warehouseId} style={styles.stockInfo}>
                Almacén {stock.warehouseId}: {stock.stock} unidades
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: theme.colors.primary,
  },
  item: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  partName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  partCode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  stockInfo: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
});
