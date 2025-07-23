import { BaseModel } from "./baseModel";

export interface CustomerWorkOrder {
  customerId: string;
  customerName: string;
  customerAddress: CustomerAddress;
  customerInstallaionId: string;
  customerInstallationCode: string;
  customerInstallationAddress: CustomerAddress;
}

export interface CustomerAddress extends BaseModel {
  postalCode: string;
  address: string;
  city: string;
  country: string;
  province: string;
  isPrimary: boolean;
}
