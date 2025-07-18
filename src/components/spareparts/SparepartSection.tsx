import React, {useEffect, useMemo, useState} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkOrder } from "@interfaces/WorkOrder";
import {
  ConsumeSparePart,
  RestoreSparePart,
} from "@interfaces/SparePart";
import { useWareHouses } from "@hooks/useWarehouse";
import { useAuthStore } from "@store/authStore";
import { theme } from "styles/theme";
import SparePartService from "@services/sparepartService";

interface SparePartsSectionProps {
  workOrder: WorkOrder;
}

export const SparePartsSection = ({ workOrder }: SparePartsSectionProps) => {
  const { stockAvailability, refresh: fetchStockAvailability } = useWareHouses();
  const authStore = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalType, setModalType] = useState<"consume" | "restore" | null>(null);
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

  // Recarga stock tras consumo/restauración
  const refresh = async () => {
    setLoading(true);
    await fetchStockAvailability();
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stockAvailability;
    console.log(stockAvailability)
    return stockAvailability.filter((sp) =>
        sp.sparePartName.toLowerCase().includes(term)
    );
  }, [search, stockAvailability]);

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

  const confirmModal = async () => {
    if (!selectedPart || !quantity) return;
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return;
    if (modalType === "consume" && qty > selectedPart.maxStock) {
      alert(`No puedes consumir más de ${selectedPart.maxStock}`);
      return;
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
    } catch (e) {
      console.error(e);
      alert("Error al actualizar el stock");
    } finally {
      setModalVisible(false);
    }
  };

  const renderStockLine = (
      sparePartId: string,
      sparePartCode: string
  ) => ({
          item,
        }: {
    item: { warehouseId: string; warehouse?: string; stock: number };
  }) => (
      <>

        <View style={styles.stockLine}>
          <Text style={styles.stockInfo}>
            Almacén {item.warehouse ?? item.warehouseId}: {item.stock} uds.
          </Text>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
              style={[theme.commonStyles.modalBtn, { backgroundColor: theme.colors.error }]}
              onPress={() =>
                  openModal(
                      "consume",
                      sparePartId,
                      sparePartCode,
                      item.warehouseId,
                      item.warehouse ?? item.warehouseId,
                      item.stock
                  )
              }
          >
            <Ionicons name="remove-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
              style={[theme.commonStyles.modalBtn, { backgroundColor: theme.colors.success }]}
              onPress={() =>
                  openModal(
                      "restore",
                      sparePartId,
                      sparePartCode,
                      item.warehouseId,
                      item.warehouse ?? item.warehouseId,
                      Infinity
                  )
              }
          >

            <Ionicons name="add-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </>
  );

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Stock Disponible</Text>
        <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
        />
        <FlatList
            data={filteredData}
            keyExtractor={(item) => item.sparePartId}
            onRefresh={refresh}
            refreshing={loading}
            renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.partName}>{item.sparePartName}</Text>
                  <Text style={styles.partCode}>
                    Código: {item.sparePartCode}
                  </Text>
                  <FlatList
                      data={item.warehouseStock}
                      keyExtractor={(w) => w.warehouseId}
                      renderItem={renderStockLine(
                          item.sparePartId,
                          item.sparePartCode
                      )}
                  />
                </View>
            )}
        />

        {/* Modal Consumo/Restauración */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.backdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {modalType === "consume"
                    ? "Consumir recambio"
                    : "Restaurar recambio"}
              </Text>
              <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Cantidad"
                  value={quantity}
                  onChangeText={setQuantity}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { backgroundColor: theme.colors.error },
                    ]}
                    onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { backgroundColor: theme.colors.success },
                    ]}
                    onPress={confirmModal}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    width: '100%',
    justifyContent: "space-between",
    alignItems: "center",
    marginTop:10
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
});
