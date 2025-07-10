import { useState, useEffect } from "react";

import { WareHouseStockAvailability } from "@interfaces/SparePart";
import WarehouseService from "@services/warehouseService";

export const useWareHouses = () => {
  const [stockAvailability, setStockAvailability] = useState<
    WareHouseStockAvailability[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const wareHouseService = new WarehouseService();

  const fetchStockAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wareHouseService.stockAvailability();
      setStockAvailability(response);
      return response;
    } catch (err) {
      console.error("Error fetching stock availability:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Opcional: Carga inicial automática
  useEffect(() => {
    fetchStockAvailability();
  }, []);

  return {
    stockAvailability,
    loading,
    error,
    refresh: fetchStockAvailability,
  };
};
