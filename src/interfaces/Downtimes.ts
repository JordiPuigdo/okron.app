import { BaseModel } from "./baseModel";
import Operator from "./Operator";

export interface Downtimes extends BaseModel {
  startTime: string;
  endTime: string;
  totalTime: string;
  operator: Operator;
  originDownTime: OriginDowntime;
  id: string;
}

export enum OriginDowntime {
  Maintenance,
  Production,
}

export interface DowntimesReasons extends BaseModel {
  description: string;
  machineId: string;
  assetId: string;
  downTimeType: DowntimesReasonsType;
}

export enum DowntimesReasonsType {
  Maintanance,
  Production,
}
