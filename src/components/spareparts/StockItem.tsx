import React, { useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { WorkOrder } from "@interfaces/WorkOrder";
import { theme } from "styles/theme";
import { MaterialIcons } from "@expo/vector-icons";

import { WareHouseStockAvailability } from "@interfaces/SparePart";
import { useWareHouses } from "@hooks/useWarehouse";

interface SparePartsSectionProps {
  workOrder: WorkOrder;
}

export const SparePartsSection = ({ workOrder }: SparePartsSectionProps) => {
  const { stockAvailability, loading, error, refresh } = useWareHouses();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filteredStock = stockAvailability.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.sparePartCode.toLowerCase().includes(searchLower) ||
      item.sparePartName.toLowerCase().includes(searchLower) ||
      item.warehouseStock.some(
        (ws) =>
          ws.warehouseId.toLowerCase().includes(searchLower) ||
          ws.warehouse.toLowerCase().includes(searchLower)
      )
    );
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons
          name="error-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text style={styles.errorText}>Error al cargar el inventario</Text>
        <Text style={styles.errorSubText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con título y acciones */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventario de Recambios</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <MaterialIcons
            name="refresh"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por código, descripción o almacén..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons
              name="close"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Contador de resultados */}
      <Text style={styles.resultsText}>
        {filteredStock.length}{" "}
        {filteredStock.length === 1 ? "recambio" : "recambios"} encontrados
      </Text>

      {/* Lista de recambios */}
      <FlatList
        data={filteredStock}
        keyExtractor={(item) => item.sparePartId}
        renderItem={({ item }) => <WarehouseStockItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="inventory"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyText}>No se encontraron recambios</Text>
            <Text style={styles.emptySubText}>
              Intenta con otro término de búsqueda
            </Text>
          </View>
        }
      />
    </View>
  );
};

// Nuevo archivo: WarehouseStockItem.tsx
const WarehouseStockItem = ({ item }: { item: WareHouseStockAvailability }) => (
  <View style={itemStyles.container}>
    <View style={itemStyles.header}>
      <Text style={itemStyles.code}>{item.sparePartCode}</Text>
      <View style={itemStyles.stockBadge}>
        <Text style={itemStyles.stockBadgeText}>
          {item.warehouseStock.reduce((sum, ws) => sum + ws.stock, 0)} disp.
        </Text>
      </View>
    </View>
    <Text style={itemStyles.name}>{item.sparePartName}</Text>

    {item.warehouseStock.map((stock) => (
      <View key={stock.warehouseId} style={itemStyles.stockRow}>
        <View style={itemStyles.warehouseInfo}>
          <MaterialIcons
            name="store"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={itemStyles.warehouseText}>{stock.warehouse}</Text>
        </View>
        <Text
          style={[
            itemStyles.stockText,
            stock.stock < 5 && itemStyles.lowStock,
            stock.stock === 0 && itemStyles.noStock,
          ]}
        >
          {stock.stock} unidades
        </Text>
      </View>
    ))}
  </View>
);

const itemStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  code: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  name: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  warehouseInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  warehouseText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  stockText: {
    fontSize: 13,
    color: theme.colors.success,
  },
  lowStock: {
    color: theme.colors.warning,
  },
  noStock: {
    color: theme.colors.error,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginTop: 12,
  },
  errorSubText: {
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.error,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,

    color: theme.colors.text,
    paddingHorizontal: 8,
  },
  resultsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 12,
  },
  emptySubText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
