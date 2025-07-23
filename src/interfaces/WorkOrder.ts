import { Asset } from "./Asset";
import { BaseModel } from "./baseModel";
import { CustomerWorkOrder } from "./Customer";
import { Downtimes, DowntimesReasons } from "./Downtimes";
import InspectionPoint from "./InspectionPoint";
import Operator from "./Operator";
import { Preventive } from "./Preventive";
import { SparePart } from "./SparePart";
import { UserType } from "./User";

export interface WorkOrder extends BaseModel {
  id: string;
  code: string;
  description: string;
  startTime: Date;
  endTime: Date;
  stateWorkOrder: StateWorkOrder;
  workOrderType: WorkOrderType;
  machineId?: string;
  workOrderInspectionPoint?: WorkOrderInspectionPoint[];
  workOrderOperatorTimes?: WorkOrderOperatorTimes[];
  operator?: Operator[];
  operatorId?: string[];
  workOrderSpareParts?: WorkOrderSparePart[];
  workOrderComments?: WorkOrderComment[];
  asset?: Asset;
  preventive?: Preventive;
  plannedDuration: string;
  operatorsNames?: string;
  originWorkOrder?: OriginWorkOrder;
  downtimeReason?: DowntimesReasons;
  downtimes?: Downtimes[];
  originalWorkOrderId?: string;
  workOrderCreatedId?: string;
  visibleReport?: boolean;
  customerWorkOrder?: CustomerWorkOrder;
  refCustomerId?: string;
}

export enum WorkOrderType {
  Corrective = 0,
  Preventive = 1,
  Predicitve = 2,
  Ticket = 3,
}

export interface WorkOrderComment {
  id?: string;
  creationDate: string;
  comment: string;
  operator: Operator;
  type: WorkOrderCommentType;
  urls?: string[];
}

export interface WorkOrderSparePart {
  creationDate?: Date;
  id: string;
  quantity: number;
  sparePart: SparePart;
  operator?: Operator;
  warehouseId: string;
  warehouse: string;
  warehouseName: string;
}

export interface WorkOrderInspectionPoint {
  id: string;
  check?: boolean;
  inspectionPoint: InspectionPoint;
}

export interface WorkOrderOperatorTimes {
  id?: string;
  startTime: Date;
  endTime?: Date;
  totalTime?: string;
  operator: Operator;
  type: WorkOrderTimeType;
}

export interface SearchWorkOrderFilters {
  machineId?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  operatorId?: string;
  assetId?: string;
  stateWorkOrder?: StateWorkOrder;
  userType: UserType;
  originWorkOrder: OriginWorkOrder;
}

export enum OriginWorkOrder {
  Maintenance,
  Production,
}

export enum StateWorkOrder {
  Waiting,
  OnGoing,
  Paused,
  Finished,
  Requested,
  PendingToValidate,
  Open,
  Closed,
  NotFinished,
}

export interface CreateWorkOrderRequest {
  id?: string;
  code?: string;
  description: string;
  initialDateTime?: Date;
  stateWorkOrder: StateWorkOrder;
  workOrderType?: WorkOrderType;
  machineId?: string;
  assetId?: string;
  operatorId?: string[];
  inspectionPointId?: string[];
  sparePartId?: string[];
  userId?: string;
  operatorCreatorId: string;
  originWorkOrder: UserType;
  downtimeReasonId?: string;
  originalWorkOrderId?: string;
  originalWorkOrderCode?: string;
  workOrderCreatedId?: string;
  visibleReport?: boolean;
  startTime?: Date;
}
export interface AddCommentToWorkOrderRequest {
  comment: string;
  operatorId: string;
  workOrderId: string;
  type: WorkOrderCommentType;
  files?: UploadableFile[];
}

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

export enum WorkOrderCommentType {
  Internal,
  External,
  NotFinished,
}

export interface SaveInspectionResultPointRequest {
  workOrderId: string;
  workOrderInspectionPointId: string;
  resultInspectionPoint: ResultInspectionPoint;
}

export enum ResultInspectionPoint {
  Pending,
  Ok,
  NOk,
}

export interface UpdateWorkOrderOperatorTimes {
  workOrderId: string;
  startTime: Date;
  endTime?: Date;
  workOrderOperatorTimesId: string;
}

export interface AddWorkOrderOperatorTimes {
  WorkOrderId: string;
  startTime: Date;
  operatorId: string;
  workOrderOperatorTimesId?: string;
  type?: WorkOrderTimeType;
}

export enum WorkOrderTimeType {
  Time,
  Travel,
}

export interface UpdateStateWorkOrder {
  workOrderId: string;
  state: StateWorkOrder;
  operatorId?: string;
  userId?: string;
}
