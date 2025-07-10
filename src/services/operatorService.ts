import Operator from "@interfaces/Operator";

class OperatorService {
  API = process.env.EXPO_PUBLIC_API_URL;

  async getOperators(): Promise<Operator[]> {
    try {
      const url = `${this.API}operator`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch operators");
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching operators:", error);
      throw error;
    }
  }
}

export const operatorService = new OperatorService();
