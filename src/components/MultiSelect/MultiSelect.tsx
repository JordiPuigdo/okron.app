import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { SelectableItem } from "@interfaces/MultiSelect";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "styles/theme";

interface MultiSelectSearchProps {
  label: string;
  items: SelectableItem[];
  selectedIds: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectSearch({
  label,
  items,
  selectedIds,
  onChange,
}: MultiSelectSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) && !selectedIds.includes(item.id)
    );
  }, [items, query, selectedIds]);

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
      setQuery(""); // Reset búsqueda
      setOpen(false); // Cierra automáticamente
    }
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  return (
    <View style={theme.commonStyles.multiSelectContainer}>
      <Text style={theme.commonStyles.inputLabel}>{label}</Text>

      <TouchableOpacity
        style={theme.commonStyles.selectInputBox}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.9}
      >
        {selectedItems.length === 0 ? (
          <Text style={theme.commonStyles.placeholderText}>Seleccionar...</Text>
        ) : (
          <View style={theme.commonStyles.chipContainer}>
            {selectedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={theme.commonStyles.chip}
                onPress={() => toggleItem(item.id)}
              >
                <Text style={theme.commonStyles.chipText}>{item.label}</Text>
                <Ionicons name="close" size={14} color={theme.colors.white} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {open && (
        <View style={theme.commonStyles.dropdown}>
          <TextInput
            style={theme.commonStyles.searchInput}
            placeholder="Buscar..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholderTextColor={theme.colors.placeholderText}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 200 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={theme.commonStyles.selectItem}
                onPress={() => toggleItem(item.id)}
              >
                <Text style={theme.commonStyles.selectItemText}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
