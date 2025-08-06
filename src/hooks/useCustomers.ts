import { Customer } from "@interfaces/Customer";
import { configService } from "@services/configService";
import { CustomerService } from "@services/customerService";
import { useEffect, useState } from "react";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isCRM } = configService.getConfigSync();
  const customerService = new CustomerService();

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isCRM && fetchCustomers();
  }, []);

  const getById = async (id: string) => {
    try {
      const customer = await customerService.getById(id);
      return customer;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getById,
  };
}
