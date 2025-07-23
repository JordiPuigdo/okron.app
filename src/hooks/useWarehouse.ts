import { useEffect, useState } from "react";

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
    let loadingTimeout: ReturnType<typeof setTimeout>;

    try {
      loadingTimeout = setTimeout(() => setLoading(true), 200); // Evita parpadeos
      setError(null);
      const response = await wareHouseService.stockAvailability();
      const formattedResponse = response.map((item) => {
        const [sparePartCode, ...nameParts] = item.sparePartName.split(" - ");
        return {
          sparePartId: item.sparePartId,
          sparePartCode: sparePartCode.trim(),
          sparePartName: nameParts.join(" - ").trim(),
          warehouseStock: item.warehouseStock,
        };
      });
      setStockAvailability(formattedResponse);
      return formattedResponse;
    } catch (err) {
      console.error("Error fetching stock availability:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      clearTimeout(loadingTimeout);
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
