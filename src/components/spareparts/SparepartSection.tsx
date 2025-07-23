import { Ionicons } from "@expo/vector-icons";
import { useWareHouses } from "@hooks/useWarehouse";
import {
  ConsumeSparePart,
  RestoreSparePart,
  WareHouseStockAvailability,
} from "@interfaces/SparePart";
import { WorkOrder } from "@interfaces/WorkOrder";
import SparePartService from "@services/sparepartService";
import { useAuthStore } from "@store/authStore";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

interface SparePartsSectionProps {
  workOrder: WorkOrder;
  setWorkOrder: (workOrder: WorkOrder) => void;
  onRefresh?: () => void;
}

export const SparePartsSection = ({
  workOrder,
  setWorkOrder,
  onRefresh = () => {},
}: SparePartsSectionProps) => {
  const { stockAvailability, refresh: fetchStockAvailability } =
    useWareHouses();
  const authStore = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [modalType, setModalType] = useState<"consume" | "restore" | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState<{
    sparePartId: string;
    sparePartCode: string;
    workOrderCode: string;
    warehouseId: string;
    warehouseName: string;
    maxStock: number;
  } | null>(null);

  const [quantity, setQuantity] = useState<string>("1");
  const [search, setSearch] = useState<string>("");

  const sparePartService = new SparePartService();

  const refresh = async () => {
    setLoading(true);
    await fetchStockAvailability();
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!stockAvailability.length) return [];

    const term = search.trim().toLowerCase();
    if (!term) {
      return stockAvailability
        .map(addConsumedQuantity)
        .sort((a, b) => b.consumedQuantity - a.consumedQuantity);
    }

    const words = term.split(/\s+/);
    return stockAvailability
      .filter((sp) => {
        const name = sp.sparePartName.toLowerCase();
        const code = sp.sparePartCode.toLowerCase();
        return words.every(
          (word) => name.includes(word) || code.includes(word)
        );
      })
      .map(addConsumedQuantity)
      .sort((a, b) => b.consumedQuantity - a.consumedQuantity);
  }, [search, stockAvailability, workOrder.workOrderSpareParts]);

  function addConsumedQuantity(item: WareHouseStockAvailability) {
    const consumedPart = workOrder.workOrderSpareParts.find(
      (x) => x.sparePart.id === item.sparePartId
    );
    return {
      ...item,
      consumedQuantity: consumedPart ? consumedPart.quantity : 0,
    };
  }

  const consumedMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const part of workOrder.workOrderSpareParts) {
      if (!map.has(part.sparePart.id)) {
        map.set(part.sparePart.id, new Map());
      }
      const warehouseMap = map.get(part.sparePart.id)!;
      warehouseMap.set(
        part.warehouseId,
        (warehouseMap.get(part.warehouseId) || 0) + part.quantity
      );
    }
    return map;
  }, [workOrder.workOrderSpareParts]);

  const handlePartPress = (
    sparePartId: string,
    sparePartCode: string,
    warehouseId: string,
    warehouseName: string,
    maxStock: number
  ) => {
    if (
      !workOrder.workOrderSpareParts.find((x) => x.sparePart.id === sparePartId)
    ) {
      openModal(
        "consume",
        sparePartId,
        sparePartCode,
        warehouseId,
        warehouseName,
        maxStock
      );
    }
  };

  const openModal = (
    type: "consume" | "restore",
    sparePartId: string,
    sparePartCode: string,
    warehouseId: string,
    warehouseName: string,
    maxStock: number
  ) => {
    setModalType(type);
    setSelectedPart({
      sparePartId,
      sparePartCode,
      workOrderCode: workOrder.code,
      warehouseId,
      warehouseName,
      maxStock,
    });
    setQuantity("1");
    setModalVisible(true);
  };
  const [isLoading, setIsLoading] = useState(false);

  const confirmModal = async () => {
    if (!selectedPart || !quantity) return;
    setIsLoading(true);
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Error", "La cantidad debe ser un número positivo");
      return;
    }

    if (modalType === "restore") {
      const consumedParts = workOrder.workOrderSpareParts.filter(
        (x) =>
          x.sparePart.id === selectedPart.sparePartId &&
          x.warehouseId === selectedPart.warehouseId
      );
      const totalConsumed = consumedParts.reduce(
        (sum, part) => sum + part.quantity,
        0
      );

      if (qty > totalConsumed) {
        Alert.alert(
          "Error",
          `No puedes devolver más de ${totalConsumed} unidades (consumidas: ${totalConsumed})`
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      if (modalType === "consume") {
        const req: ConsumeSparePart = {
          workOrderId: workOrder.id,
          workOrderCode: selectedPart.workOrderCode,
          sparePartId: selectedPart.sparePartId,
          sparePartCode: selectedPart.sparePartCode,
          unitsSparePart: qty,
          operatorId: authStore.factoryWorker!.id,
          warehouseId: selectedPart.warehouseId,
          warehouseName: selectedPart.warehouseName,
        };
        await sparePartService.consumeSparePart(req);
      } else {
        const req: RestoreSparePart = {
          workOrderId: workOrder.id,
          workOrderCode: selectedPart.workOrderCode,
          sparePartId: selectedPart.sparePartId,
          sparePartCode: selectedPart.sparePartCode,
          unitsSparePart: qty,
          operatorId: authStore.factoryWorker!.id,
          warehouseId: selectedPart.warehouseId,
          warehouseName: selectedPart.warehouseName,
        };
        await sparePartService.restoreSparePart(req);
      }
      await refresh();
      setIsLoading(false);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar el stock");
    } finally {
      setModalVisible(false);
    }
  };

  const handleRestore = async (
    sparePartId: string,
    sparePartCode: string,
    item: any
  ) => {
    if (
      workOrder.workOrderSpareParts.find((x) => x.sparePart.id === sparePartId)
        .quantity == 1
    ) {
      const req: RestoreSparePart = {
        workOrderId: workOrder.id,
        workOrderCode: workOrder.code,
        sparePartId: sparePartId,
        sparePartCode: sparePartCode,
        unitsSparePart: 1,
        operatorId: authStore.factoryWorker!.id,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse,
      };
      await sparePartService.restoreSparePart(req);
      onRefresh();
      return;
    }

    openModal(
      "restore",
      sparePartId,
      sparePartCode,
      item.warehouseId,
      item.warehouse ?? item.warehouseId,
      workOrder.workOrderSpareParts
        .filter((x) => x.sparePart.id === sparePartId)
        .map((x) => x.quantity)
        .reduce((a, b) => a + b, 0)
    );
  };

  const renderStockLine =
    (sparePartId: string, sparePartCode: string) =>
    ({
      item,
    }: {
      item: { warehouseId: string; warehouse?: string; stock: number };
    }) => {
      const quantity = consumedMap.get(sparePartId)?.get(item.warehouseId) || 0;

      const isConsumed = quantity > 0;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.stockContainer,
            pressed && styles.pressedContainer,
            isConsumed && styles.consumedContainer,
          ]}
          onPress={() =>
            handlePartPress(
              sparePartId,
              sparePartCode,
              item.warehouseId,
              item.warehouse ?? item.warehouseId,
              item.stock
            )
          }
        >
          <View style={styles.stockInfoContainer}>
            <Ionicons
              name={isConsumed ? "checkmark-circle" : "cube"}
              size={24}
              color={isConsumed ? theme.colors.success : theme.colors.primary}
            />
            <View style={styles.stockTextContainer}>
              <Text style={styles.warehouseText} numberOfLines={1}>
                {item.warehouse ?? item.warehouseId}
              </Text>
            </View>
          </View>

          {isConsumed && (
            <View style={styles.consumedBadge}>
              <Text style={styles.consumedText}>
                {workOrder.workOrderSpareParts
                  .filter((x) => x.sparePart.id === sparePartId)
                  .map((x) => x.quantity)
                  .reduce((a, b) => a + b, 0)}
              </Text>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={() => handleRestore(sparePartId, sparePartCode, item)}
              >
                <Ionicons name="arrow-undo" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      );
    };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#fff",
          borderRadius: 10,
          margin: 16,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            height: 48,
            fontSize: 18,
            paddingHorizontal: 12,
            color: theme.colors.text,
          }}
          placeholder="Buscar..."
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          style={{
            padding: 8,
            marginLeft: 8,
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
          }}
        >
          <Ionicons name="add-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      {stockAvailability.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.sparePartId}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.partName}>{item.sparePartName}</Text>
            <Text style={styles.partCode}>Código: {item.sparePartCode}</Text>
            <FlatList
              data={item.warehouseStock}
              keyExtractor={(w) => w.warehouseId}
              renderItem={renderStockLine(item.sparePartId, item.sparePartCode)}
            />
          </View>
        )}
      />

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.modalBox}>
            <Text style={modalStyles.modalTitle}>
              {modalType === "consume" ? (
                <>
                  <Ionicons
                    name="cart"
                    size={24}
                    color={theme.colors.primary}
                  />
                  {"  Consumir recanvi"}
                </>
              ) : (
                <>
                  <Ionicons
                    name="return-up-back"
                    size={24}
                    color={theme.colors.error}
                  />
                  {"  Retornar recanvi"}
                </>
              )}
            </Text>

            {/* Contador de cantidad mejorado */}
            <View style={modalStyles.quantityContainer}>
              <Text style={modalStyles.quantityLabel}>Quantitat:</Text>

              <View style={modalStyles.quantityControls}>
                <TouchableOpacity
                  style={modalStyles.quantityButton}
                  onPress={() => {
                    const newValue = Math.max(parseInt(quantity || "1") - 1, 1);
                    setQuantity(newValue.toString());
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={32} color="#fff" />
                </TouchableOpacity>

                <View style={modalStyles.quantityDisplay}>
                  <Text style={modalStyles.quantityText}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={modalStyles.quantityButton}
                  onPress={() => {
                    const newValue = parseInt(quantity || "1") + 1;
                    setQuantity(newValue.toString());
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botones de acción */}
            <View style={modalStyles.actionButtons}>
              <TouchableOpacity
                style={[modalStyles.actionButton, modalStyles.cancelButton]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.actionButton, modalStyles.confirmButton]}
                onPress={confirmModal}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color={theme.colors.white} />
                ) : (
                  <Ionicons
                    name={modalType === "consume" ? "checkmark" : "refresh"}
                    size={24}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
    color: theme.colors.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityContainer: {
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  quantityDisplay: {
    width: 100,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
});

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
  stockLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  stockInfo: {
    fontSize: 14,
    color: theme.colors.text,
  },
  buttonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  stockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pressedContainer: {
    backgroundColor: "#f0f0f0",
  },
  longPressActive: {
    borderColor: theme.colors.primary,
  },
  consumedContainer: {
    backgroundColor: "#f0f9f0",
    borderColor: theme.colors.success,
  },
  stockInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stockTextContainer: {
    marginLeft: 10,
  },
  stockQuantity: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  warehouseText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  consumedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.success,
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  consumedText: {
    color: "#fff",
    fontSize: 12,
    marginRight: 5,
  },
  restoreButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    marginHorizontal: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },

  modalButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
