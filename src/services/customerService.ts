import { Customer } from "@interfaces/Customer";

export class CustomerService {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.EXPO_PUBLIC_API_URL! + "customers"
  ) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Customer[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Error fetching customers");
    return res.json();
  }

  async getById(id: string): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error("Error fetching customer");
    return res.json();
  }
}
