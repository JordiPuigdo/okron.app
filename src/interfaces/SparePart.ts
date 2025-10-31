export interface SparePart {
  id: string;
  code: string;
  description: string;
  family: string;
  ubication: string;
  stock: number;
  brand: string;
  unitsConsum?: number;
  price: number;
  active: boolean;
  minium: number;
  maximum: number;
  colorRow: string;
  lastMovementConsume: Date;
  lastMovement: Date;
  lastRestockDate: Date;
  providers: ProviderSpareParts[];
  warehouses: WarehousesSparePart[];
  isVirtual: boolean;
  rrp: number;
}

export interface CreateSparePartRequest {
  code: string;
  description: string;
  family: string;
  ubication?: string;
  stock?: number;
  brand?: string;
}

export interface ProviderSpareParts {
  providerId: string;
  price: string;
  sparePart?: SparePart;
  isDefault: boolean;
  discount: number;
  refProvider: string;
}

export interface WarehousesSparePart {
  warehouseId: string;
  warehouseName: string;
}

export interface RestoreSparePart extends ConsumeSparePart {}

export interface ConsumeSparePart {
  workOrderId: string;
  sparePartId: string;
  sparePartCode: string;
  unitsSparePart: number;
  operatorId: string;
  warehouseId: string;
  workOrderCode: string;
  warehouseName: string;
}

export interface WareHouseStockAvailability {
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  isVirtual: boolean;
  warehouseStock: StockAvailability[];
}

export interface StockAvailability {
  warehouseId: string;
  warehouse: string;
  stock: number;
}
