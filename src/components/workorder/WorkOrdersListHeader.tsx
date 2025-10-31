import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { OperatorType } from "@interfaces/Operator";
import { translateOperatorType } from "@utils/workorderUtils";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "styles/colors";

export const WorkOrdersListHeader = ({
  operatorName,
  totalOrders,
  searchQuery,
  setSearchQuery,
  onOpenFilters,
  hasActiveFilters,
  operatorType,
  isCRM,
}: {
  operatorName: string;
  totalOrders: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
  operatorType: OperatorType;
  isCRM: boolean;
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* INFO OPERARIO */}
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <View style={styles.userIcon}>
            <FontAwesome5 name="user-cog" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.username} numberOfLines={1}>
              {operatorName} - {translateOperatorType(operatorType)}
            </Text>
            <Text style={styles.totalText}>Total ordres: {totalOrders}</Text>
          </View>
        </View>
      </View>

      {/* BUSCADOR + FILTROS */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#697384"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscador"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Botón de filtros */}
        {isCRM ? (
          <TouchableOpacity
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive, // ✅ cambio de color visual
            ]}
            onPress={onOpenFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive, // ✅ cambio de color visual
            ]}
            onPress={onOpenFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.grayBackground,
    borderBottomWidth: 2,
    borderBottomColor: "#055a9b",
    elevation: 3,
  },
  userRow: {
    marginBottom: 14,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0d8de0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.industrial,
  },
  totalText: {
    fontSize: 13,
    color: colors.industrial,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 46,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0a2947",
  },
  clearButton: {
    marginLeft: 6,
  },
  filterButton: {
    backgroundColor: "#0d8de0", // azul por defecto
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  // ✅ color alternativo para indicar que hay filtros activos
  filterButtonActive: {
    backgroundColor: "#E67E22", // naranja industrial
  },
});
