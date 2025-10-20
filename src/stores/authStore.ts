import { OperatorType } from "@interfaces/Operator";
import { create } from "zustand";

type FactoryWorker = {
  id: string;
  name: string;
  operatorType: OperatorType;
};

type AuthState = {
  factoryWorker: FactoryWorker | null;
  setFactoryWorker: (user: FactoryWorker) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  factoryWorker: null,
  setFactoryWorker: (factoryWorker) => set({ factoryWorker }),
  logout: () => set({ factoryWorker: null }),
}));
