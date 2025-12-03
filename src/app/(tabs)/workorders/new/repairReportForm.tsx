import {
  getWorkOrderOrigin,
  getWorkOrderState,
  getWorkOrderType,
  getWorkOrderTypeByOriginType,
} from "@components/workorder/utils";
import { useAssets } from "@hooks/useAssets";
import { useCustomers } from "@hooks/useCustomers";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { Customer } from "@interfaces/Customer";
import {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrderCommentType,
  WorkOrderPriority,
  WorkOrderType,
} from "@interfaces/WorkOrder";

import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommentUploadProps } from "./components/CommentUploadPhoto";
import RepairReportFormUI from "./components/RepairReportFormUI";

export interface RepairReport {
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
  assetId: string;
  priority: WorkOrderPriority;
  originalWorkOrderId?: string;
  originalWorkOrderCode?: string;
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
    stateWorkOrder:
      factoryWorker != null
        ? getWorkOrderState(factoryWorker.operatorType)
        : StateWorkOrder.Open,

    workOrderType:
      factoryWorker != null
        ? getWorkOrderType(factoryWorker.operatorType)
        : WorkOrderType.Corrective,
    originWorkOrder:
      factoryWorker != null
        ? getWorkOrderOrigin(factoryWorker.operatorType)
        : OriginWorkOrder.Maintenance,
    downtimeReasonId: "",
    assetId: "",
    operatorId: [],
    userId: "67dec0ce2464c1a06ae59182",
    priority: WorkOrderPriority.Low,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);

  const [commentUpload, setCommentUpload] = useState<CommentUploadProps>();

  const {
    generateWorkOrderCode,
    createRepairWorkOrder,
    addCommentToWorkOrder,
  } = useWorkOrders();
  const { assets, fetchAllAssets } = useAssets();

  const generateWorkOrderCodeForRepair = async () => {
    const workOrderCode = await generateWorkOrderCode(
      getWorkOrderTypeByOriginType(formData.originWorkOrder)
    );
    setFormData((prev) => ({ ...prev, code: workOrderCode }));
  };

  useEffect(() => {
    if (!assets) {
      fetchAllAssets();
    }
    generateWorkOrderCodeForRepair();
  }, [formData.originWorkOrder]);

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
    if (isLoading) return;
    setIsLoading(true);
    if (!authStore.factoryWorker) {
      Alert.alert("Error", "No has iniciat sessió");
      return;
    }
    const newRepairReport = {
      ...formData,
      operatorId: [authStore.factoryWorker.id],
      operatorCreatorId: factoryWorker.id,
    };

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const response = await createRepairWorkOrder(newRepairReport);
    await sendComments(response.id);
    Alert.alert("Èxit!", "Ordre de treball creada correctament");
    router.push("/workorders");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim() || formData.description === "") {
      newErrors.description = "La descripció es obligatoria";
    }

    if (isCRM) {
      if (!formData.customerId) {
        newErrors.customerId = "Falta el client";
      }
    }

    if (!formData.assetId || formData.assetId === "") {
      newErrors.assetId = "Falta el equip";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendComments = async (workOrderId: string) => {
    if (
      !commentUpload ||
      !commentUpload.files ||
      commentUpload.files.length === 0
    )
      return;

    const filesToSend = commentUpload.files.map((file) => {
      return {
        uri: file,
        name: file.split("/").pop() || "file",
        type: file.match(/\.(mp4|mov)$/) ? "video/mp4" : "image/jpeg",
      };
    });

    await addCommentToWorkOrder({
      comment: commentUpload.comment ?? "",
      operatorId: authStore.factoryWorker!.id,
      workOrderId: workOrderId,
      type: WorkOrderCommentType.Internal,
      files: filesToSend as any,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <RepairReportFormUI
        formData={formData}
        date={date}
        showDatePicker={showDatePicker}
        onChangeDate={onChangeDate}
        handleAssetSelected={handleAssetSelected}
        assets={assets}
        errors={errors}
        isCRM={isCRM}
        customers={customers}
        selectedCustomer={selectedCustomer}
        handleSelectedCustomer={handleSelectedCustomer}
        handleDeleteSelectedCustomer={handleDeleteSelectedCustomer}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        setFormData={setFormData}
        selectedAssets={selectedAssets}
        setCommentUpload={setCommentUpload}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
});

export default RepairReportForm;
