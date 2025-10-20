import { InspectionPointsSection } from "@components/InspectionPoints/inspectionPointsSection";
import SignModal from "@components/SignModal";
import { SparePartsSection } from "@components/spareparts/SparepartSection";
import { AnimatedTabBar } from "@components/workorder/AnimatedTabBar";
import { CommentsSection } from "@components/workorder/CommentSection";
import {
  getDefaultTab,
  getVisibleTabs,
  getWorkOrderStateToUpdate,
  TabKey,
} from "@components/workorder/utils";
import { WorkOrderCompletionModal } from "@components/workorder/WorkOrderCompletionModal";
import { WorkOrderForm } from "@components/workorder/WorkOrderForm";
import { WorkOrderHeader } from "@components/workorder/WorkOrderHeader";
import { WorkOrderOperatorTimesComponent } from "@components/WorkOrderOperatorTimes/WorkOrderOperatorTimesComponent";
import { WorkOrderWorkersComponent } from "@components/workOrderWorkersComponent/WorkOrderWorkersComponent";
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
  WorkOrderOperatorTimes,
} from "@interfaces/WorkOrder";
import { LoadingScreen } from "@screens/loading/loading";
import { configService } from "@services/configService";
import { useAuthStore } from "@store/authStore";

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";
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
      if (tabBar !== undefined) setActiveTab(tabBar);
      else setActiveTab(getDefaultTab(data.workOrderType, isCRM));
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
        workerSign: signature,
      }));
      setSignatureType(SIGNATURE_TYPES.CLIENT);
    } else if (SIGNATURE_TYPES.CLIENT === signatureType) {
      setWorkOrder((prev) => ({
        ...prev,
        customerSign: signature,
      }));
      if (workOrder.workerSign) {
        await updateWorkOrderSign({
          workOrderId: workOrder.id,
          workerSign: workOrder.workerSign,
          customerSign: signature,
        });
      }
      setSignatureType(SIGNATURE_TYPES.UNDEFINED);
      Alert.alert("Ok", "Firma actualizada", [
        {
          text: "OK",
          onPress: () => router.push("/workorders"),
          style: "default",
        },
      ]);
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

  const confirmFinish = async () => {
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

      if (attachments.length > 0 || commentText) {
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
      if (workOrder.workerSign == null) {
        setSignatureType(SIGNATURE_TYPES.WORKER);
      }
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
      //Alert.alert("Actualizat correctament", "Ordre No Finalitzada");
      setSignatureType(SIGNATURE_TYPES.WORKER);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  function handleRemoveTime(id: string) {
    setWorkerTimes(workerTimes.filter((t) => t.id !== id));
  }

  const handleOnCreate = async (created: WorkOrderOperatorTimes) => {
    setTimeout(async () => {
      const workOrderRefreshed = await fetchById(workOrder.id);
      setWorkOrder(workOrderRefreshed);
      setWorkerTimes(workOrderRefreshed.workOrderOperatorTimes ?? []);
      setActiveTab("times");
    }, 500);
  };

  const handleOnFinalize = async (operatorId: string) => {};

  return (
    <SafeAreaView style={theme.commonStyles.mainContainer}>
      <WorkOrderHeader
        title={
          workOrder
            ? `${workOrder.code} - ${workOrder.description
                .trim()
                .slice(0, 50)}${workOrder.description.length > 50 ? "..." : ""}`
            : "Carregant ordre..."
        }
        state={workOrder?.stateWorkOrder ?? StateWorkOrder.Waiting}
        isCRM={isCRM}
        onFinish={() =>
          authStore.factoryWorker &&
          handleUpdateState(
            getWorkOrderStateToUpdate(
              workOrder.stateWorkOrder,
              workOrder.workOrderType,
              authStore.factoryWorker?.operatorType
            )
          )
        }
        onNotFinished={() => handleUpdateState(StateWorkOrder.NotFinished)}
        onSign={() => setSignatureType(SIGNATURE_TYPES.WORKER)}
        operatorType={
          authStore && authStore.factoryWorker
            ? authStore.factoryWorker.operatorType
            : OperatorType.Maintenance
        }
      />
      {workOrder && (
        <AnimatedTabBar
          activeTab={activeTab}
          onTabChange={(tabKey) => {
            setLoading(true);
            setActiveTab(tabKey);
            setTimeout(() => setLoading(false), 200);
          }}
          tabs={getVisibleTabs(workOrder.workOrderType)}
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
              onCreate={(c) => handleOnCreate(c)}
              onFinalize={handleOnFinalize}
              workOrderId={workOrder.id}
              onRemove={(e) => handleRemoveTime(e)}
            />
          ))}
      </View>

      <WorkOrderCompletionModal
        visible={showFinishModal}
        title="Observacions"
        commentText={commentText}
        attachments={attachments}
        loading={isLoadingConfirming}
        onChangeComment={setCommentText}
        onAddAttachment={handlePickAttachment}
        onRemoveAttachment={(index) =>
          setAttachments((prev) => prev.filter((_, i) => i !== index))
        }
        onCancel={() => setShowFinishModal(false)}
        onConfirm={confirmFinish}
      />

      <WorkOrderCompletionModal
        visible={showNotFinishedModal}
        title="Motiu No Finalització"
        commentText={commentText}
        attachments={attachments}
        loading={isLoadingConfirming}
        onChangeComment={setCommentText}
        onAddAttachment={handlePickAttachment}
        onRemoveAttachment={(index) =>
          setAttachments((prev) => prev.filter((_, i) => i !== index))
        }
        onCancel={() => setShowNotFinishedModal(false)}
        onConfirm={confirmNotFinished}
        confirmColor={theme.colors.warning}
      />

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
