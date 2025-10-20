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

class WorkOrderService {
  API = process.env.EXPO_PUBLIC_API_URL;
  async getWorkOrdersWithFilters(
    searchWorkOrderFilters: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> {
    try {
      const url = `${this.API}GetWorkOrderWithFilters`;

      const response = await fetch(url, {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchWorkOrderFilters),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch WorkOrders-machines");
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching WorkOrders by machines:", error);
      throw error;
    }
  }

  async getWorkOrderById(Id: string): Promise<WorkOrder | undefined> {
    try {
      const url = `${this.API}workorder/${Id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch WorkOrders");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching WorkOrder:", error);
      throw error;
    }
  }

  async generateWorkOrderCode(workOrderType: WorkOrderType): Promise<string> {
    try {
      const url = `${this.API}workOrder/GenerateWorkOrderCode?workOrderType=${workOrderType}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch GenerateWorkOrderCode");
      }
      if (response.status === 204) {
        return "";
      }
      return response.text();
    } catch (error) {
      console.error("Error fetching GenerateWorkOrderCode:", error);
      throw error;
    }
  }

  async createWorkOrder(WorkOrder: CreateWorkOrderRequest): Promise<WorkOrder> {
    const response = await fetch(`${this.API}workorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(WorkOrder),
    });
    if (!response.ok) {
      throw new Error("Failed to create machine WorkOrder");
    }

    return response.json();
  }

  async addCommentToWorkOrder(
    addCommentToWorkOrder: AddCommentToWorkOrderRequest
  ): Promise<WorkOrderComment> {
    try {
      const formData = new FormData();
      formData.append("comment", addCommentToWorkOrder.comment);
      formData.append("operatorId", addCommentToWorkOrder.operatorId);
      formData.append("workOrderId", addCommentToWorkOrder.workOrderId);
      formData.append("type", addCommentToWorkOrder.type.toString());
      addCommentToWorkOrder.files?.forEach((file) => {
        if (file.uri && file.name && file.type) {
          formData.append("Files", {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        }
      });
      const url = `${this.API}AddCommentToWorkOrder`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(
          "Failed to fetch addCommentToWorkOrder " + response.json()
        );
      }
      if (response.status === 204) {
        return {} as WorkOrderComment;
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching addCommentToWorkOrder:", error);
      throw error;
    }
  }

  async saveInspectionPointResult(
    saveInspectionPointResul: SaveInspectionResultPointRequest
  ): Promise<WorkOrder[]> {
    try {
      const url = `${this.API}SaveInsepctionPointResult`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveInspectionPointResul),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch WorkOrders-machines");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching WorkOrders by machines:", error);
      throw error;
    }
  }

  async updateWorkOrderOperatorTimes(
    updateWorkOrderOperatorTimes: UpdateWorkOrderOperatorTimes
  ): Promise<boolean> {
    try {
      const url = `${this.API}UpdateWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateWorkOrderOperatorTimes),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch UpdateWorkOrderOperatorTimes");
      }
      if (response.status === 204) {
        return true;
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching UpdateWorkOrderOperatorTimes:", error);
      throw error;
    }
  }

  async addWorkOrderOperatorTimes(
    AddWorkOrderOperatorTimesValues: AddWorkOrderOperatorTimes
  ): Promise<AddWorkOrderOperatorTimes> {
    try {
      const url = `${this.API}AddWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(AddWorkOrderOperatorTimesValues),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch AddWorkOrderOperatorTimes");
      }
      if (response.status === 204) {
        return response.json();
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching AddWorkOrderOperatorTimes:", error);
      throw error;
    }
  }

  async updateStateWorkOrder(
    updateStateWorkOrder: UpdateStateWorkOrder[]
  ): Promise<boolean> {
    try {
      const url = `${this.API}workorder/state`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateStateWorkOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to update WorkOrder");
      }
      return true;
    } catch (error) {
      console.error("Error updating WorkOrder:", error);
      throw error;
    }
  }

  async updateWorkOrder(
    updateWorkOrder: CreateWorkOrderRequest
  ): Promise<boolean> {
    try {
      const url = `${this.API}workorder`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateWorkOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to update WorkOrder");
      }

      if (response.status === 204) {
        return true;
      }

      return response.json();
    } catch (error) {
      console.error("Error updating WorkOrder:", error);
      throw error;
    }
  }

  async updateWorkOrderSign(
    updateWorkOrderSign: UpdateWorkOrderSign
  ): Promise<boolean> {
    try {
      const url = `${this.API}workOrder/Sign`;
      console.log(updateWorkOrderSign);
      console.log(url);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateWorkOrderSign),
      });

      if (!response.ok) {
        throw new Error("Failed to update WorkOrder");
      }
      return true;
    } catch (error) {
      console.error("Error updating WorkOrder:", error);
      throw error;
    }
  }
  async deleteWorkerTimes(
    request: DeleteWorkOrderOperatorTimes
  ): Promise<boolean> {
    try {
      const url = `${this.API}DeleteWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to delete Worker Times");
      }
      return true;
    } catch (error) {
      console.error("Error deleting Worker Times:", error);
      throw error;
    }
  }

  async deleteWorkerComment(workOrderId: string, commentId: string) {
    try {
      const url = `${this.API}CommentToWorkOrder`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workOrderId, commentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
}

export default WorkOrderService;
