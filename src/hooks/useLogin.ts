import { loginRequest } from "@services/autService";
import { useAuthStore } from "@store/authStore";
import { useState } from "react";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setFactoryWorker = useAuthStore((state) => state.setFactoryWorker);

  const login = async (username: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const factoryWorker = await loginRequest(username);
      if (factoryWorker == null) return false;
      setFactoryWorker(factoryWorker);
      return true;
    } catch (err: any) {
      setError("Login failed");
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setFactoryWorker(null);
  };

  return {
    login,
    logout,
    loading,
    error,
  };
};
