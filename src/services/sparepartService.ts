import {
  ConsumeSparePart,
  RestoreSparePart,
  SparePart,
} from "@interfaces/SparePart";

class SparePartService {
  API = process.env.EXPO_PUBLIC_API_URL;

  async getSpareParts(withoutStock = false): Promise<SparePart[]> {
    const response = await fetch(
      `${this.API}SparePart?withoutStock=${withoutStock}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch inspection points");
    }
    return response.json();
  }

  async consumeSparePart(
    consumeSparePartRequest: ConsumeSparePart
  ): Promise<boolean> {
    try {
      const url = `${this.API}sparePart/Consume`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consumeSparePartRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to update sparePart`);
      }
      return true;
    } catch (error) {
      console.error("Error updating SparePart:", error);
      throw error;
    }
  }

  async restoreSparePart(restoreSparePart: RestoreSparePart): Promise<boolean> {
    try {
      const url = `${this.API}sparePart/restore`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restoreSparePart),
      });

      if (!response.ok) {
        throw new Error(`Failed to update sparePart`);
      }
      return true;
    } catch (error) {
      console.error("Error updating SparePart:", error);
      throw error;
    }
  }

  async createSparePart(sparePart: SparePart): Promise<boolean> {
    try {
      const url = `${this.API}sparePart`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sparePart),
      });

      if (!response.ok) {
        throw new Error(`Failed to update sparePart`);
      }
      return true;
    } catch (error) {
      console.error("Error updating SparePart:", error);
      throw error;
    }
  }
}

export default SparePartService;
