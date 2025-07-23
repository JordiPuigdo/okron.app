import {
  AddCommentToWorkOrderRequest,
  AddWorkOrderOperatorTimes,
  CreateWorkOrderRequest,
  SaveInspectionResultPointRequest,
  SearchWorkOrderFilters,
  UpdateStateWorkOrder,
  UpdateWorkOrderOperatorTimes,
  WorkOrder,
  WorkOrderComment,
  WorkOrderType,
} from "@interfaces/WorkOrder";
import WorkOrderService from "@services/workOrdersService";
import { useState } from "react";
import { Fetcher } from "swr";

const workOrderService = new WorkOrderService();

const [isLoading, setIsLoading] = useState(false);

const fetchWorkOrdersWithFilters = async (
  filters?: SearchWorkOrderFilters
): Promise<WorkOrder[]> => {
  try {
    if (filters) {
      const response = await workOrderService.getWorkOrdersWithFilters(filters);
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
    const count = await workOrderService.countByWorkOrderType(type);
    const nextNumber = count + 1;
    const padded = nextNumber.toString().padStart(4, "0");

    const prefix =
      type === WorkOrderType.Corrective
        ? "COR"
        : type === WorkOrderType.Preventive
        ? "PRE"
        : "OT";

    return `${prefix}${padded}`;
  } catch (error) {
    console.error("Error generating work order code:", error);
    throw error;
  }
};

const createWorkOrder = async (data: CreateWorkOrderRequest): Promise<void> => {
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
    const response = await workOrderService.updateWorkOrderOperatorTimes(data);
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

export const useWorkOrders = () => {
  const fetchById: Fetcher<WorkOrder, string> = (id) => fetchWorkOrderById(id);

  const fetchWithFilters = async (
    filters?: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> => {
    return await fetchWorkOrdersWithFilters(filters);
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
    isLoading,
  };
};
