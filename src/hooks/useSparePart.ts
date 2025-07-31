import { SparePart } from "@interfaces/SparePart";
import SparePartService from "@services/sparepartService";

export const useSparePart = () => {
  const sparePartService = new SparePartService();

  const createSparePart = async (description: string): Promise<boolean> => {
    try {
      const newSparePart = {
        code: "",
        description: description,
        stock: 0,
        brand: "",
        ubication: "",
        active: true,
        minium: 0,
        maximum: 0,
        colorRow: "#FFFFFF",
        lastMovementConsume: new Date(),
        lastMovement: new Date(),
        lastRestockDate: new Date(),
        providers: [
          {
            providerId: "6874be0fbe01a5200314cac9",
            price: "0",
            isDefault: true,
            discount: 0,
            refProvider: "",
          },
        ],
        warehouses: [
          {
            warehouseId: "6874bb2dbe01a5200314cac5",
            warehouseName: "Magatzem Virtual",
          },
        ],
        isVirtual: true,
        rrp: 0,
      } as SparePart;
      const response = await sparePartService.createSparePart(newSparePart);
      return response!;
    } catch (error) {
      console.error("Error creating spare part:", error);
      throw error;
    }
  };

  return {
    createSparePart,
  };
};
