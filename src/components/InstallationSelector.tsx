import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { DataTable } from "react-native-paper";

const InstallationSelector = ({
  installations,
  selectedInstallation,
  onSelectInstallation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInstallations = useMemo(() => {
    if (!searchTerm) return installations;
    const term = searchTerm.toLowerCase();
    return installations.filter(
      (i) =>
        i.code.toLowerCase().includes(term) ||
        i.address.address.toLowerCase().includes(term)
    );
  }, [installations, searchTerm]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Botigues</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar botiga..."
        onChangeText={setSearchTerm}
        value={searchTerm}
      />

      <DataTable>
        {filteredInstallations.map((installation) => (
          <DataTable.Row
            key={installation.id}
            onPress={() => onSelectInstallation(installation.id)}
            style={[
              styles.installationRow,
              selectedInstallation === installation.id && styles.selectedRow,
            ]}
          >
            <DataTable.Cell>
              <Text style={styles.installationCode}>{installation.code}</Text>
            </DataTable.Cell>
            <DataTable.Cell>
              <Text style={styles.installationAddress}>
                {installation.address.address}
              </Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  dropdownButton: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
  },
  dropdown: {
    display: "none", // Ocultamos el dropdown por defecto
  },
  searchDropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 1000,
    elevation: 5,
    maxHeight: 300,
  },
  searchInput: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsList: {
    maxHeight: 250,
  },
  customerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  customerTaxId: {
    fontSize: 14,
    color: "#666",
  },
  noResults: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedCustomer: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedTaxId: {
    fontSize: 14,
    color: "#666",
  },
  clearButton: {
    marginLeft: 10,
    padding: 5,
  },
  clearButtonText: {
    fontSize: 20,
    color: "#666",
  },
  installationRow: {
    backgroundColor: "#fff",
  },
  selectedRow: {
    backgroundColor: "#e3f2fd",
  },
  installationCode: {
    fontWeight: "bold",
  },
  installationAddress: {
    color: "#555",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
  },
  dropdownButtonText: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default InstallationSelector;
