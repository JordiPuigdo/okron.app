import AssetSelector from "@components/AssetSelector";
import CustomerSelector from "@components/CustomerSelector";
import InstallationSelector from "@components/InstallationSelector";
import WorkOrderPrioritySelection from "@components/workorder/WorkOrderPriority";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, TextInput } from "react-native-paper";
import CommentUploadPhoto from "./CommentUploadPhoto";
import { OriginWorkOrderSelection } from "./OriginWorkOrderSelection";

const RepairReportFormUI = ({
  formData,
  date,
  showDatePicker,
  onChangeDate,
  handleAssetSelected,
  assets,
  errors,
  isCRM,
  customers,
  selectedCustomer,
  handleSelectedCustomer,
  handleDeleteSelectedCustomer,
  handleSubmit,
  isLoading,
  setFormData,
  selectedAssets,
  setCommentUpload,
}) => {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Nº ORDEN Y REFERENCIA */}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.sectionTitle}>Nº Ordre</Text>
                <TextInput
                  value={formData.code || ""}
                  mode="outlined"
                  outlineColor="#ccc"
                  activeOutlineColor="#0d8de0"
                  style={[styles.input, errors.code && styles.inputError]}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, code: text }))
                  }
                />
                {errors.code && (
                  <Text style={styles.errorText}>{errors.code}</Text>
                )}
              </View>

              {isCRM && (
                <View style={styles.field}>
                  <Text style={styles.sectionTitle}>Ref. Client</Text>
                  <TextInput
                    value={formData.refCustomerId || ""}
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#0d8de0"
                    style={styles.input}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, refCustomerId: text }))
                    }
                  />
                </View>
              )}
            </View>

            {/* FECHA */}
            <View style={styles.field}>
              <Text style={styles.sectionTitle}>Data</Text>
              <Button
                mode="outlined"
                onPress={() => onChangeDate(null, new Date())}
                style={styles.dateButton}
                labelStyle={styles.dateLabel}
                icon="calendar"
              >
                {date.toLocaleDateString("es-ES")}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            {/* DESCRIPCIÓN */}
            <View style={styles.field}>
              <Text style={styles.sectionTitle}>Descripció</Text>
              <TextInput
                value={formData.description || ""}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
                mode="outlined"
                outlineColor="#ccc"
                activeOutlineColor="#0d8de0"
                style={[
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {!isCRM && <WorkOrderPrioritySelection setFormData={setFormData} />}
            <OriginWorkOrderSelection
              setFormData={setFormData}
              selectedDefault={formData.originWorkOrder}
            />
            {/* SELECTORES */}
            {assets && assets.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {isCRM ? "Objecte" : "Equip"}
                </Text>
                <AssetSelector
                  assets={assets}
                  selectedAssets={selectedAssets}
                  handleAssetSelected={handleAssetSelected}
                  isCRM={isCRM}
                />
                {errors.assetId && (
                  <Text style={styles.errorText}>{errors.assetId}</Text>
                )}
              </>
            )}

            <Text style={styles.sectionTitle}>Afegir Fotos / Comentaris</Text>
            <CommentUploadPhoto setFiles={setCommentUpload} />

            {isCRM && (
              <>
                <Text style={styles.sectionTitle}>Client</Text>
                <CustomerSelector
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={handleSelectedCustomer}
                  onClearSelection={handleDeleteSelectedCustomer}
                />
              </>
            )}

            {selectedCustomer?.installations?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Instal·lació</Text>
                <InstallationSelector
                  installations={selectedCustomer.installations}
                  selectedInstallation={formData.installationId}
                  onSelectInstallation={(id) =>
                    setFormData((prev) => ({ ...prev, installationId: id }))
                  }
                />
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* BOTÓN FIJO GUARDAR */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="save" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f1f5f9", // okron.background
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // espacio para el botón fijo
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 16,
    gap: 20,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0a2947", // okron.950
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    height: 48,
  },
  inputError: {
    borderColor: "#dc3545", // error color
  },
  textArea: {
    backgroundColor: "white",
    borderRadius: 8,
    textAlignVertical: "top",
    paddingVertical: 10,
    minHeight: 100,
  },
  dateButton: {
    borderColor: "#ccc",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 16,
    color: "#0e406a",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#055a9b",
    marginTop: 10,
    marginBottom: 6,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0d8de0", // okron.500
    borderRadius: 10,
    height: 56,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});

export default RepairReportFormUI;
