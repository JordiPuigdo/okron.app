import { useAuthStore } from "@store/authStore";
import React, { createContext, ReactNode, useContext } from "react";
import { useLogin } from "../hooks/useLogin"; // asumimos que tu hook está aquí

interface AuthContextType {
  factoryWorker: { id: string; name: string } | null;
  loading: boolean;
  error: string | null;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { login, logout: logoutFn, loading, error } = useLogin();
  const factoryWorker = useAuthStore((state) => state.factoryWorker);
  const logoutStore = useAuthStore((state) => state.logout);

  const logout = () => {
    logoutStore();
    logoutFn();
  };

  return (
    <AuthContext.Provider
      value={{
        factoryWorker,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
