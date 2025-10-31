import {
  AddCommentToWorkOrderRequest,
  AddWorkOrderOperatorTimes,
  CreateWorkOrderRequest,
  DeleteWorkOrderOperatorTimes,
  SaveInspectionResultPointRequest,
  SearchWorkOrderFilters,
  UpdateStateWorkOrder,
  UpdateWorkOrderOperatorTimes,
  UpdateWorkOrderSign,
  WorkOrder,
  WorkOrderComment,
  WorkOrderType,
} from "@interfaces/WorkOrder";
import WorkOrderService from "@services/workOrdersService";
import { useState } from "react";
import { Fetcher } from "swr";

export const useWorkOrders = () => {
  const workOrderService = new WorkOrderService();

  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkOrdersWithFilters = async (
    filters?: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> => {
    try {
      if (filters) {
        const response = await workOrderService.getWorkOrdersWithFilters(
          filters
        );
        return response;
      }
      return [];
    } catch (error) {
      console.error("Error fetching work orders with filters:", error);
      throw error;
    }
  };

  const generateWorkOrderCode = async (
    type: WorkOrderType = WorkOrderType.Corrective
  ): Promise<string> => {
    try {
      const workOrderCode = await workOrderService.generateWorkOrderCode(type);
      return workOrderCode;
    } catch (error) {
      console.error("Error generating work order code:", error);
      throw error;
    }
  };

  const createWorkOrder = async (
    data: CreateWorkOrderRequest
  ): Promise<void> => {
    try {
      await workOrderService.createWorkOrder(data);
    } catch (error) {
      console.error("Error creating work order:", error);
      throw error;
    }
  };

  const addCommentToWorkOrder = async (
    data: AddCommentToWorkOrderRequest
  ): Promise<WorkOrderComment> => {
    try {
      const response = await workOrderService.addCommentToWorkOrder(data);
      return response!;
    } catch (error) {
      console.error("Error adding comment to work order:", error);
      throw error;
    }
  };

  const fetchWorkOrderById = async (id: string): Promise<WorkOrder> => {
    try {
      const response = await workOrderService.getWorkOrderById(id);

      return response!;
    } catch (error) {
      console.error("Error fetching work order by ID:", error);
      throw error;
    }
  };

  const saveInspectionPointResult = async (
    data: SaveInspectionResultPointRequest
  ): Promise<WorkOrder[]> => {
    try {
      const response = await workOrderService.saveInspectionPointResult(data);
      return response!;
    } catch (error) {
      console.error("Error saving inspection point result:", error);
      throw error;
    }
  };

  const updateWorkOrderOperatorTimes = async (
    data: UpdateWorkOrderOperatorTimes
  ): Promise<boolean> => {
    try {
      const response = await workOrderService.updateWorkOrderOperatorTimes(
        data
      );
      return response!;
    } catch (error) {
      console.error("Error updating work order operator times:", error);
      throw error;
    }
  };

  const addWorkOrderOperatorTimes = async (
    data: AddWorkOrderOperatorTimes
  ): Promise<AddWorkOrderOperatorTimes> => {
    try {
      const response = await workOrderService.addWorkOrderOperatorTimes(data);
      return response!;
    } catch (error) {
      console.error("Error adding work order operator times:", error);
      throw error;
    }
  };

  const updateStateWorkOrder = async (
    data: UpdateStateWorkOrder[]
  ): Promise<boolean> => {
    try {
      const response = await workOrderService.updateStateWorkOrder(data);
      return response!;
    } catch (error) {
      console.error("Error updating work order state:", error);
      throw error;
    } finally {
    }
  };

  const updateWorkOrder = async (
    data: CreateWorkOrderRequest
  ): Promise<boolean> => {
    try {
      const response = await workOrderService.updateWorkOrder(data);
      return response!;
    } catch (error) {
      console.error("Error updating work order:", error);
      throw error;
    }
  };

  const fetchById: Fetcher<WorkOrder, string> = (id) => fetchWorkOrderById(id);

  const fetchWithFilters = async (
    filters?: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> => {
    return await fetchWorkOrdersWithFilters(filters);
  };

  const createRepairWorkOrder = async (data: any): Promise<WorkOrder> => {
    try {
      const response = await workOrderService.createWorkOrder(data);
      return response!;
    } catch (error) {
      console.error("Error creating work order:", error);
      throw error;
    }
  };

  const updateWorkOrderSign = async (
    data: UpdateWorkOrderSign
  ): Promise<boolean> => {
    try {
      const response = await workOrderService.updateWorkOrderSign(data);
      return response!;
    } catch (error) {
      console.error("Error updating work order sign:", error);
      throw error;
    }
  };

  const deleteWorkerTimes = async (
    data: DeleteWorkOrderOperatorTimes
  ): Promise<boolean> => {
    try {
      const response = await workOrderService.deleteWorkerTimes(data);
      return response!;
    } catch (error) {
      console.error("Error deleting worker times:", error);
      throw error;
    }
  };

  const deleteWorkerComment = async (
    workOrderId: string,
    commentId: string
  ): Promise<boolean> => {
    try {
      const response = await workOrderService.deleteWorkerComment(
        workOrderId,
        commentId
      );
      return response!;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  return {
    fetchById,
    generateWorkOrderCode,
    fetchWithFilters,
    createWorkOrder,
    addCommentToWorkOrder,
    saveInspectionPointResult,
    updateWorkOrderOperatorTimes,
    addWorkOrderOperatorTimes,
    updateStateWorkOrder,
    updateWorkOrder,
    createRepairWorkOrder,
    updateWorkOrderSign,
    deleteWorkerTimes,
    deleteWorkerComment,
    isLoading,
  };
};
