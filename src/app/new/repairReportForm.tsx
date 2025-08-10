import AssetSelector from "@components/AssetSelector";
import CustomerSelector from "@components/CustomerSelector";
import InstallationSelector from "@components/InstallationSelector";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAssets } from "@hooks/useAssets";
import { useCustomers } from "@hooks/useCustomers";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { Customer } from "@interfaces/Customer";
import {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrderType,
} from "@interfaces/WorkOrder";

import DateTimePicker from "@react-native-community/datetimepicker";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Card, TextInput } from "react-native-paper";
import { theme } from "styles/theme";

interface RepairReport {
  code: string;
  description: string;
  initialDateTime: Date;
  customerId: string;
  installationId: string;
  refCustomerId: string;
  stateWorkOrder: StateWorkOrder;
  workOrderType: WorkOrderType;
  originWorkOrder: OriginWorkOrder;
  downtimeReasonId: string;
  operatorCreatorId: string;
  operatorId: string[];
  userId: string;
}

const RepairReportForm = () => {
  //const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { factoryWorker } = useAuthStore();
  const { isCRM } = configService.getConfigSync();
  const { customers, getById } = useCustomers();

  const [isLoading, setIsLoading] = useState(false);

  const authStore = useAuthStore();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<RepairReport>>({
    code: "",
    description: "",
    initialDateTime: new Date(),
    installationId: "",
    customerId: undefined,
    refCustomerId: undefined,
    stateWorkOrder: StateWorkOrder.Waiting,
    workOrderType: WorkOrderType.Corrective,
    originWorkOrder: OriginWorkOrder.Maintenance,
    downtimeReasonId: "",
    operatorCreatorId: factoryWorker.id,
    operatorId: [],
    userId: "67dec0ce2464c1a06ae59182",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);

  const { generateWorkOrderCode, createRepairWorkOrder } = useWorkOrders();
  const { assets, fetchAllAssets } = useAssets();

  // Simular generación de código
  const generateWorkOrderCodeForRepair = async () => {
    // Simulación de generación de código
    const workOrderCode = await generateWorkOrderCode(WorkOrderType.Corrective);
    setFormData((prev) => ({ ...prev, code: workOrderCode }));
  };

  useEffect(() => {
    console.log("Auth store:", authStore);
    fetchAllAssets();
    generateWorkOrderCodeForRepair();
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setFormData((prev) => ({ ...prev, initialDateTime: currentDate }));
  };

  const handleAssetSelected = (assetId: string) => {
    if (assetId === "") return;
    setFormData((prev) => ({ ...prev, assetId }));
    setSelectedAssets((prevSelected) => [...prevSelected, assetId]);
  };

  const handleSelectedCustomer = async (id: string) => {
    const newCustomerSelected = await getById(id);
    setSelectedCustomerId(id);
    setSelectedCustomer(newCustomerSelected);
    setFormData((prev) => ({
      ...prev,
      customerId: id,
    }));
  };

  const handleDeleteSelectedCustomer = () => {
    setSelectedCustomer(undefined);
    setSelectedCustomerId(undefined);
    setFormData((prev) => ({
      ...prev,
      customerId: undefined,
      installationId: "",
    }));
  };

  const handleSubmit = async () => {
    console.log("Submitting form with data:", authStore.factoryWorker);
    if (!authStore.factoryWorker) {
      Alert.alert("Error", "No has iniciat sessió");
      return;
    }
    const newRepairReport = {
      ...formData,
      operatorId: [authStore.factoryWorker.id],
    };
    console.log("Form data:", newRepairReport);
    if (isLoading) return;
    if (!validateForm()) {
      return;
    }

    await createRepairWorkOrder(newRepairReport);
    Alert.alert("Èxit!", "Ordre de treball creada correctament");
    router.push("/workorders");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }
    if (isCRM) {
      if (!formData.customerId) {
        newErrors.customerId = "Falta el cliente";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      extraScrollHeight={300}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Núm. Ordre</Text>
                <TextInput
                  value={formData.code || ""}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, code: text }))
                  }
                  style={errors.code ? styles.inputError : styles.input}
                  mode="outlined"
                />
                {errors.code && (
                  <Text style={styles.errorText}>{errors.code}</Text>
                )}
              </View>
              {isCRM && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Referència Client</Text>
                  <TextInput
                    label="Referencia"
                    value={formData.refCustomerId || ""}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, refCustomerId: text }))
                    }
                    style={styles.input}
                    mode="outlined"
                  />
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
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
              {errors.initialDateTime && (
                <Text style={styles.errorText}>{errors.initialDateTime}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripció</Text>
              <TextInput
                label="Descripció"
                value={formData.description || ""}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
                style={[
                  styles.textArea,
                  errors.description ? styles.inputError : null,
                ]}
                mode="outlined"
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>
            {assets && assets.length > 0 && (
              <AssetSelector
                assets={assets}
                selectedAssets={selectedAssets}
                handleAssetSelected={handleAssetSelected}
                isCRM={isCRM}
              />
            )}
            {isCRM && (
              <CustomerSelector
                customers={customers}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={handleSelectedCustomer}
                onClearSelection={handleDeleteSelectedCustomer}
              />
            )}

            {selectedCustomer?.installations?.length > 0 && (
              <InstallationSelector
                installations={selectedCustomer.installations}
                selectedInstallation={formData.installationId}
                onSelectInstallation={(id) =>
                  setFormData((prev) => ({ ...prev, installationId: id }))
                }
              />
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={theme.commonStyles.saveButton}
                onPress={() => handleSubmit()}
              >
                <FontAwesome5 name="save" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    marginBottom: 24,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
  },
  inputError: {
    backgroundColor: "white",
    borderColor: "red",
  },
  textArea: {
    height: 100,
    backgroundColor: "white",
  },
  picker: {
    backgroundColor: "white",
  },
  dateButton: {
    backgroundColor: "white",
    justifyContent: "flex-start",
  },
  selectedItems: {
    marginTop: 8,
    gap: 8,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default RepairReportForm;
