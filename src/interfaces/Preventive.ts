import { Asset } from "./Asset";
import InspectionPoint from "./InspectionPoint";
import Operator from "./Operator";

export interface Preventive {
  id: string;
  code: string;
  description: string;

  startExecution: Date;
  lastExecution: Date;
  hours?: number;
  days: number;
  counter: number;
  inspectionPoints: InspectionPoint[];
  operators: Operator[];
  assetId?: string[];
  asset: Asset;
  active: boolean;
  plannedDuration: string;
  spareParts: SparePartPreventive[];
}

export interface SparePartPreventive {
  sparePartId: string;
  sparePartCode: string;
  sparePartDescription: string;
}
