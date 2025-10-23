import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { OperatorType } from "@interfaces/Operator";
import { UserType } from "@interfaces/User";
import {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrderType,
} from "@interfaces/WorkOrder";

import React, { JSX } from "react";

export type TabKey =
  | "inspection"
  | "comments"
  | "spareParts"
  | "times"
  | "workOrder";

export interface TabItem {
  key: TabKey;
  icon: JSX.Element;
  visible?: boolean;
}

export const TABS: TabItem[] = [
  {
    key: "workOrder",
    icon: React.createElement(MaterialIcons, {
      name: "assignment",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
  {
    key: "inspection",
    icon: React.createElement(MaterialIcons, {
      name: "assignment-turned-in",
      size: 24,
      color: "black",
    }),
    visible: true,
  },

  {
    key: "comments",
    icon: React.createElement(FontAwesome5, {
      name: "comment-alt",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
  {
    key: "spareParts",
    icon: React.createElement(Ionicons, {
      name: "construct",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
  {
    key: "times",
    icon: React.createElement(Entypo, {
      name: "stopwatch",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
];

export function getWorkOrderTypeByOriginType(
  originType: OriginWorkOrder
): WorkOrderType {
  switch (originType) {
    case OriginWorkOrder.Maintenance:
      return WorkOrderType.Corrective;
    case OriginWorkOrder.Quality:
      return WorkOrderType.Ticket;
    case OriginWorkOrder.Production:
      return WorkOrderType.Ticket;
    default:
      return WorkOrderType.Corrective;
  }
}

export function getWorkOrderType(operatorType: OperatorType) {
  if (operatorType == undefined) return WorkOrderType.Corrective;
  switch (operatorType) {
    case OperatorType.Maintenance:
      return WorkOrderType.Corrective;
    case OperatorType.Production:
      return WorkOrderType.Ticket;
    case OperatorType.Quality:
      return WorkOrderType.Ticket;
    default:
      return WorkOrderType.Corrective;
  }
}

export function getWorkOrderOrigin(operatorType: OperatorType) {
  if (operatorType == undefined) return OriginWorkOrder.Maintenance;

  switch (operatorType) {
    case OperatorType.Maintenance:
      return OriginWorkOrder.Maintenance;
    case OperatorType.Quality:
      return OriginWorkOrder.Quality;
    case OperatorType.Production:
      return OriginWorkOrder.Production;
    default:
      return OriginWorkOrder.Maintenance;
  }
}

export function getUserType(operatorType: OperatorType) {
  if (operatorType == undefined) return UserType.Maintenance;

  switch (operatorType) {
    case OperatorType.Maintenance:
      return UserType.Maintenance;
    case OperatorType.Production:
      return UserType.Production;
    case OperatorType.Quality:
      return UserType.Quality;
    case OperatorType.Repairs:
      return UserType.CRM;
    case OperatorType.Assembly:
      return UserType.CRM;
    default:
      return UserType.Maintenance;
  }
}

export function getDefaultTab(
  workOrderType: WorkOrderType,
  isCRM: boolean
): TabKey {
  if (isCRM) {
    return "workOrder";
  }
  return workOrderType === WorkOrderType.Corrective ||
    workOrderType == WorkOrderType.Ticket
    ? "workOrder"
    : "inspection";
}

export function getWorkOrderStateToUpdate(
  workorderState: StateWorkOrder,
  workOrderType: WorkOrderType,
  operatorType: OperatorType
) {
  if (workOrderType === WorkOrderType.Preventive) {
    return StateWorkOrder.Finished;
  }

  if (operatorType === OperatorType.Maintenance) {
    switch (workorderState) {
      case StateWorkOrder.Waiting:
      case StateWorkOrder.OnGoing:
      case StateWorkOrder.Paused:
        return StateWorkOrder.PendingToValidate;

      case StateWorkOrder.NotFinished:
      case StateWorkOrder.Finished:
        return StateWorkOrder.Waiting;

      case StateWorkOrder.Open:
        return StateWorkOrder.Closed;

      case StateWorkOrder.Closed:
        return StateWorkOrder.Open;
      case StateWorkOrder.PendingToValidate:
        return StateWorkOrder.Waiting;
      default:
        return StateWorkOrder.Finished;
    }
  }

  if (operatorType === OperatorType.Quality) {
    switch (workorderState) {
      case StateWorkOrder.Waiting:
      case StateWorkOrder.OnGoing:
      case StateWorkOrder.Paused:
        return StateWorkOrder.PendingToValidate;

      case StateWorkOrder.NotFinished:
      case StateWorkOrder.Finished:
        return StateWorkOrder.Waiting;

      case StateWorkOrder.Open:
        return StateWorkOrder.Closed;

      case StateWorkOrder.Closed:
        return StateWorkOrder.Open;
      case StateWorkOrder.PendingToValidate:
        return StateWorkOrder.Finished;
      default:
        return StateWorkOrder.Finished;
    }
  }
}

export function getVisibleTabs(workOrderType: WorkOrderType) {
  return TABS.map((tab) => {
    // 🔹 Mostrar inspección solo para Preventive
    if (tab.key === "inspection") {
      return { ...tab, visible: workOrderType === WorkOrderType.Preventive };
    }
    if (tab.key === "times") {
      return {
        ...tab,
        visible:
          workOrderType === WorkOrderType.Corrective ||
          workOrderType === WorkOrderType.Preventive,
      };
    }
    if (tab.key === "spareParts") {
      return {
        ...tab,
        visible:
          workOrderType === WorkOrderType.Corrective ||
          workOrderType === WorkOrderType.Preventive,
      };
    }
    return tab;
  });
}
