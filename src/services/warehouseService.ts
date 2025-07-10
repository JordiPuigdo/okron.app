import { WareHouseStockAvailability } from "@interfaces/SparePart";

class WarehouseService {
  API = process.env.EXPO_PUBLIC_API_URL;

  async stockAvailability(): Promise<WareHouseStockAvailability[]> {
    try {
      const response = await fetch(`${this.API}warehouse/stockAvailability`);
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouses: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      throw error;
    }
  }
}

export default WarehouseService;
