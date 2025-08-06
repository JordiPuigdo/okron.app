import { MaterialIcons } from "@expo/vector-icons";
import { Asset } from "@interfaces/Asset";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AssetSelector = ({
  assets,
  selectedAssets,
  handleAssetSelected,
  isCRM,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = assets.filter(
        (asset) =>
          asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssets(filtered);
    } else {
      setFilteredAssets(assets.slice(0, 20)); // Mostrar solo los primeros 20 por defecto
    }
  }, [searchQuery, assets]);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    handleAssetSelected(asset.id);
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{isCRM ? "Objecte" : "Equip"}</Text>

      {/* Input que activa el modal */}
      <TouchableOpacity
        style={styles.selectorInput}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={selectedAsset ? styles.selectedText : styles.placeholderText}
        >
          {selectedAsset
            ? `${selectedAsset.code} - ${selectedAsset.description}`
            : "Selecciona un equip"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
      </TouchableOpacity>

      {/* Modal con buscador */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color="gray"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar equip..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel·lar</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de resultados */}
          <FlatList
            data={filteredAssets}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.assetItem}
                onPress={() => handleSelectAsset(item)}
              >
                <Text style={styles.assetCode}>{item.code}</Text>
                <Text style={styles.assetDescription}>{item.description}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No s'han trobat resultats</Text>
              </View>
            }
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333",
  },
  selectorInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  cancelButton: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 16,
  },
  assetItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  assetCode: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  assetDescription: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default AssetSelector;
