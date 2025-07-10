import { Asset } from "@interfaces/Asset";

class AssetService {
  API = process.env.EXPO_PUBLIC_API_URL;

  async getAll(): Promise<Asset[]> {
    try {
      const url = `${this.API}Asset`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  }
}

export const assetService = new AssetService();
