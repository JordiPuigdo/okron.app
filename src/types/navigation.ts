// types/navigation.ts

export type RootStackParamList = {
  // ... tus pantallas existentes
  OperatorTimeManagement: {
    workOrderId: string;
    operatorId: string;
    operatorName: string;
  };
};

// Declaración global para useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
