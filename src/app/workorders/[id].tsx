import { InspectionPointsSection } from "@components/InspectionPoints/inspectionPointsSection";
import SignModal from "@components/SignModal";
import { SparePartsSection } from "@components/spareparts/SparepartSection";
import { CommentsSection } from "@components/workorder/CommentSection";
import { TabBar } from "@components/workorder/TabBar";
import { TabKey } from "@components/workorder/utils";
import { WorkOrderForm } from "@components/workorder/WorkOrderForm";
import { WorkOrderOperatorTimesComponent } from "@components/WorkOrderOperatorTimes/WorkOrderOperatorTimesComponent";
import { WorkOrderWorkersComponent } from "@components/workOrderWorkersComponent/WorkOrderWorkersComponent";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useWorkerTimes } from "@hooks/useWorkerTimes";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { OperatorType } from "@interfaces/Operator";
import { SIGNATURE_TYPES, SignatureType } from "@interfaces/Signature";
import {
  AddCommentToWorkOrderRequest,
  StateWorkOrder,
  UpdateStateWorkOrder,
  WorkOrder,
  WorkOrderCommentType,
  WorkOrderInspectionPoint,
  WorkOrderType,
} from "@interfaces/WorkOrder";
import { Text } from "@react-navigation/elements";
import { LoadingScreen } from "@screens/loading/loading";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "styles/theme";

export default function WorkOrderDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    fetchById,
    updateStateWorkOrder,
    addCommentToWorkOrder,
    updateWorkOrderSign,
  } = useWorkOrders();
  const authStore = useAuthStore();

  const { isCRM } = configService.getConfigSync();
  const [workOrder, setWorkOrder] = useState<WorkOrder>();
  const [inspectionPoints, setInspectionPoints] = useState<
    WorkOrderInspectionPoint[]
  >([]);

  const { workerTimes, setWorkerTimes, handleFinalize } = useWorkerTimes();
  const [activeTab, setActiveTab] = useState<TabKey>("inspection");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLoadingConfirming, setLoadingConfirming] = useState<boolean>(false);

  // Modales y datos de comentario/adjuntos
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showNotFinishedModal, setShowNotFinishedModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [signatureType, setSignatureType] = useState<SignatureType>(
    SIGNATURE_TYPES.UNDEFINED
  );

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchData(id as string).finally(() => setLoading(false));
    }
  }, [id]);

  const fetchData = async (workOrderId: string, tabBar = undefined) => {
    try {
      if (!isLoading) setLoading(true);
      const data = await fetchById(workOrderId);
      setWorkOrder(data);
      setInspectionPoints(data.workOrderInspectionPoint ?? []);
      setWorkerTimes(data.workOrderOperatorTimes ?? []);
      setActiveTab(
        tabBar
          ? tabBar
          : data.workOrderType === WorkOrderType.Corrective
          ? isCRM
            ? "workOrder"
            : "comments"
          : "inspection"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAttachment = async () => {
    Alert.alert("Por favor elige camara o galeria", null, [
      { text: "Galería", onPress: () => pickAttachment("gallery") },
      { text: "Camara", onPress: () => pickAttachment("camera") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const pickAttachment = async (type) => {
    let result;

    if (type == "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
      });
    }

    if (type == "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
      });
    }

    if (!result.canceled) {
      result.assets.map((res) => {
        setAttachments((prev) => [...prev, res.uri]);
      });
    }
  };

  const handleUpdateState = (state: StateWorkOrder) => {
    if (state === StateWorkOrder.Finished && isCRM) {
      if (workOrder.workOrderComments.length === 0) {
        Alert.alert("Error", "Descripció de la reparació incompleta");
        return;
      }

      setShowFinishModal(true);
    } else if (state === StateWorkOrder.NotFinished && isCRM) {
      setShowNotFinishedModal(true);
    } else {
      // Sin CRM o estados intermedios, cambio directo
      updateSimpleState(state);
    }
  };

  const handleConfirmSignature = async (signature: string) => {
    if (SIGNATURE_TYPES.WORKER === signatureType) {
      setWorkOrder((prev) => ({
        ...prev,
        workerSignature: signature,
      }));
      setSignatureType(SIGNATURE_TYPES.CLIENT);
    } else if (SIGNATURE_TYPES.CLIENT === signatureType) {
      setWorkOrder((prev) => ({
        ...prev,
        clientSignature: signature,
      }));
      if (workOrder.workerSignature) {
        await updateWorkOrderSign({
          workOrderId: workOrder.id,
          workerSign: workOrder.workerSignature,
          customerSign: signature,
        });
      }
      setSignatureType(SIGNATURE_TYPES.UNDEFINED);
    }
  };

  const updateSimpleState = async (state: StateWorkOrder) => {
    if (!workOrder) return;
    const payload: UpdateStateWorkOrder = {
      workOrderId: workOrder.id,
      state,
      operatorId: authStore.factoryWorker?.id ?? "",
    };
    await updateStateWorkOrder([payload]);
    router.push("/workorders");
  };

  const confirmFinish = async (continueWorkOrder = false) => {
    setLoadingConfirming(true);
    try {
      if (!workOrder) return;
      await updateStateWorkOrder([
        {
          workOrderId: workOrder.id,
          state: StateWorkOrder.Finished,
          operatorId: authStore.factoryWorker?.id ?? "",
        },
      ]);

      if (!continueWorkOrder) {
        const files = attachments.map((uri) => ({
          uri,
          name: uri.split("/").pop() || "file",
          type: uri.match(/\.(mp4|mov)$/) ? "video/mp4" : "image/jpeg",
        }));
        if (commentText || attachments.length) {
          const req: AddCommentToWorkOrderRequest = {
            comment: commentText,
            operatorId: authStore.factoryWorker?.id ?? "",
            workOrderId: workOrder.id,
            type: WorkOrderCommentType.Internal,
            files: files as any,
          };
          await addCommentToWorkOrder(req);
        }
      }
      setShowFinishModal(false);
      setSignatureType(SIGNATURE_TYPES.WORKER);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConfirming(false);
    }
  };

  const confirmNotFinished = async () => {
    setLoadingConfirming(true);
    try {
      if (!workOrder) return;
      await updateStateWorkOrder([
        {
          workOrderId: workOrder.id,
          state: StateWorkOrder.NotFinished,
          operatorId: authStore.factoryWorker?.id ?? "",
        },
      ]);
      const files = attachments.map((uri) => ({
        uri,
        name: uri.split("/").pop() || "file",
        type: uri.match(/\.(mp4|mov)$/) ? "video/mp4" : "image/jpeg",
      }));
      const req: AddCommentToWorkOrderRequest = {
        comment: commentText,
        operatorId: authStore.factoryWorker?.id ?? "",
        workOrderId: workOrder.id,
        type: WorkOrderCommentType.NotFinished,
        files: files as any,
      };

      if (commentText || attachments.length) {
        await addCommentToWorkOrder(req);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConfirming(false);
      setShowNotFinishedModal(false);
      router.push("/workorders");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={theme.commonStyles.mainContainer}>
      <View style={theme.commonStyles.header}>
        <View style={{ flex: 1 }}>
          {workOrder ? (
            <Text style={theme.commonStyles.headerText}>
              {workOrder.code} -{" "}
              {workOrder.description.trim().length > 50
                ? workOrder.description
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 50) + "..."
                : workOrder.description.trim()}
            </Text>
          ) : (
            <Text style={theme.commonStyles.headerText}>
              Carregant ordre...
            </Text>
          )}
        </View>
        {workOrder && (
          <>
            {/* Botón No Finalizada solo si isCRM */}
            {isCRM && workOrder.stateWorkOrder !== StateWorkOrder.Finished && (
              <TouchableOpacity
                onPress={() => handleUpdateState(StateWorkOrder.NotFinished)}
                style={[
                  theme.commonStyles.finishButton,
                  { backgroundColor: theme.colors.error, marginRight: 8 },
                ]}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {/* Botón Finalizar/Reabrir */}
            <TouchableOpacity
              onPress={() =>
                handleUpdateState(
                  workOrder.stateWorkOrder === StateWorkOrder.Finished
                    ? StateWorkOrder.Waiting
                    : StateWorkOrder.Finished
                )
              }
              style={theme.commonStyles.finishButton}
            >
              <Ionicons
                name={
                  workOrder.stateWorkOrder === StateWorkOrder.Finished
                    ? "refresh"
                    : "checkmark-done"
                }
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            {isCRM && workOrder.stateWorkOrder == StateWorkOrder.Finished && (
              <TouchableOpacity
                style={[
                  theme.commonStyles.finishButton,
                  { backgroundColor: theme.colors.warning },
                ]}
                onPress={() => setSignatureType(SIGNATURE_TYPES.WORKER)}
              >
                <Ionicons name="create" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
      {workOrder && (
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          workOrderType={workOrder.workOrderType}
        />
      )}
      <View style={theme.commonStyles.content}>
        {activeTab === "workOrder" && workOrder && (
          <WorkOrderForm
            workOrder={workOrder}
            onRefresh={() => fetchData(workOrder.id, "workOrder")}
          />
        )}
        {activeTab === "inspection" && workOrder && (
          <InspectionPointsSection
            inspectionPoints={inspectionPoints}
            onUpdate={setInspectionPoints}
            workOrderId={workOrder.id}
          />
        )}
        {activeTab === "comments" && workOrder && (
          <CommentsSection
            comments={workOrder.workOrderComments ?? []}
            workOrderId={workOrder.id}
            onAddComment={async (commentText, files, type, commentObject) => {
              setWorkOrder((prev) => ({
                ...prev,
                workOrderComments: [
                  ...(prev.workOrderComments ?? []),
                  {
                    id: Math.random().toString(),
                    creationDate: new Date().toISOString(),
                    comment: commentText,
                    operator: {
                      id: authStore.factoryWorker.id,
                      code: "",
                      name: authStore.factoryWorker.name,
                      priceHour: 0,
                      operatorType: OperatorType.Maintenance,
                      active: true,
                    },
                    type: WorkOrderCommentType.External,
                    urls: commentObject.urls || [],
                  },
                ],
              }));
            }}
          />
        )}
        {activeTab === "spareParts" && workOrder && (
          <SparePartsSection
            workOrder={workOrder}
            setWorkOrder={setWorkOrder}
            onRefresh={() => fetchData(workOrder.id, "spareParts")}
          />
        )}
        {activeTab === "times" &&
          workOrder &&
          (isCRM ? (
            <WorkOrderWorkersComponent
              workorder={workOrder}
              setWorkorder={setWorkOrder}
              onRefresh={() => fetchData(workOrder.id, "times")}
            />
          ) : (
            <WorkOrderOperatorTimesComponent
              workerTimes={workerTimes}
              onCreate={(c) => setWorkerTimes([...workerTimes, c])}
              onFinalize={handleFinalize}
              workOrderId={workOrder.id}
            />
          ))}
      </View>

      {/* Modal Observaciones al finalizar (solo isCRM) */}
      <Modal visible={showFinishModal} transparent animationType="slide">
        <View style={theme.commonStyles.backdrop}>
          <View style={theme.commonStyles.modalBox}>
            <Text style={theme.commonStyles.modalTitle}>Observacions</Text>
            <TextInput
              style={theme.commonStyles.textArea}
              multiline
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[
                theme.commonStyles.addButton,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  height: 50,
                  marginVertical: 8,
                },
              ]}
              onPress={handlePickAttachment}
            >
              <FontAwesome5 name="camera" size={20} color="#fff" />
            </TouchableOpacity>
            <ScrollView horizontal style={theme.commonStyles.previewRow}>
              {attachments.map((uri, i) => (
                <View key={i} style={theme.commonStyles.previewBox}>
                  <Image
                    source={{ uri }}
                    style={theme.commonStyles.previewImage}
                  />
                  <TouchableOpacity
                    style={theme.commonStyles.removeIcon}
                    onPress={() =>
                      setAttachments((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <Ionicons name="close-circle" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View
              style={[
                theme.commonStyles.buttonRow,
                { justifyContent: "space-evenly" },
              ]}
            >
              <TouchableOpacity
                style={[
                  theme.commonStyles.modalBtn,
                  { backgroundColor: theme.colors.error },
                ]}
                onPress={() => setShowFinishModal(false)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  theme.commonStyles.modalBtn,
                  { backgroundColor: theme.colors.success },
                ]}
                onPress={() => confirmFinish()}
              >
                {isLoadingConfirming ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <MaterialIcons
                    name="check"
                    size={24}
                    color={theme.colors.white}
                  />
                )}
              </TouchableOpacity>

              {/* Continuar */}
              <TouchableOpacity
                style={[
                  theme.commonStyles.modalBtn,
                  { backgroundColor: theme.colors.success },
                ]}
                onPress={() => confirmFinish(true)}
              >
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Motivo No Finalizada */}
      <Modal visible={showNotFinishedModal} transparent animationType="slide">
        <View style={theme.commonStyles.backdrop}>
          <View style={theme.commonStyles.modalBox}>
            <Text style={theme.commonStyles.modalTitle}>
              Motiu No Finalització
            </Text>
            <TextInput
              style={theme.commonStyles.textArea}
              multiline
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[
                theme.commonStyles.addButton,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  height: 50,
                  marginVertical: 8,
                },
              ]}
              onPress={handlePickAttachment}
            >
              <FontAwesome5 name="camera" size={20} color="#fff" />
            </TouchableOpacity>
            <ScrollView horizontal style={theme.commonStyles.previewRow}>
              {attachments.map((uri, i) => (
                <View key={i} style={theme.commonStyles.previewBox}>
                  <Image
                    source={{ uri }}
                    style={theme.commonStyles.previewImage}
                  />
                  <TouchableOpacity
                    style={theme.commonStyles.removeIcon}
                    onPress={() =>
                      setAttachments((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <Ionicons name="close-circle" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={theme.commonStyles.buttonRow}>
              <TouchableOpacity
                style={[
                  theme.commonStyles.modalBtn,
                  { backgroundColor: theme.colors.error },
                ]}
                onPress={() => setShowNotFinishedModal(false)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  theme.commonStyles.modalBtn,
                  { backgroundColor: theme.colors.success },
                ]}
                onPress={confirmNotFinished}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {signatureType !== SIGNATURE_TYPES.UNDEFINED && (
        <SignModal
          signatureType={signatureType}
          handleConfirmSignature={handleConfirmSignature}
          onClose={() => setSignatureType(SIGNATURE_TYPES.UNDEFINED)}
        />
      )}
    </SafeAreaView>
  );
}
