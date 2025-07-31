import { debounce } from "lodash";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CustomerSelector = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onClearSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Filtrado optimizado con debounce
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers.slice(0, 50); // Mostrar solo los primeros 50 inicialmente
    const term = searchTerm.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(term));
  }, [customers, searchTerm]);

  const handleSearch = debounce((text) => {
    setSearchTerm(text);
  }, 300);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => {
        onSelectCustomer(item.id);
        setDropdownVisible(false);
      }}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerTaxId}>{item.taxId}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Client</Text>

      {selectedCustomer ? (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedCustomer}>
            <Text style={styles.selectedName}>{selectedCustomer.name}</Text>
            <Text style={styles.selectedTaxId}>{selectedCustomer.taxId}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearSelection}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownButtonText}>Selecciona un client</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      )}

      {dropdownVisible && (
        <View style={styles.searchDropdown}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar client..."
            onChangeText={handleSearch}
            autoFocus
          />
          <ScrollView
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          >
            {filteredCustomers.length === 0 ? (
              <View style={styles.noResults}>
                <Text>No s'han trobat resultats</Text>
              </View>
            ) : (
              filteredCustomers.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.customerItem}
                  onPress={() => {
                    onSelectCustomer(item.id);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerTaxId}>{item.taxId}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

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
    display: "none",
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

export default CustomerSelector;
