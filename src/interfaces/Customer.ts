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

export interface Customer extends BaseModel {
  code: string;
  name: string;
  taxId: string;
  accountNumber: string;
  fiscalName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: CustomerAddress[];
  installations: CustomerInstallations[];
  comments: string;
}

export interface CustomerInstallations extends BaseModel {
  code: string;
  address: CustomerAddress;
}
