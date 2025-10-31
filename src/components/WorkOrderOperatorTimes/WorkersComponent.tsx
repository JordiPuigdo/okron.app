import { Ionicons } from "@expo/vector-icons";
import { useOperators } from "@hooks/useOperator";
import { useWorkOrders } from "@hooks/useWorkOrders";
import Operator from "@interfaces/Operator";
import { CreateWorkOrderRequest, WorkOrder } from "@interfaces/WorkOrder";
import { useNavigation } from "@react-navigation/native";
import { LoadingScreen } from "@screens/loading/loading";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { theme } from "styles/theme";

interface Props {
  workorder: WorkOrder;
  setWorkorder: (workorder: WorkOrder) => void;
  operatorLoggedId: string;
  onRefresh?: (tab: string) => void;
}

export const WorkersComponent: React.FC<Props> = ({
  workorder,
  setWorkorder,
  operatorLoggedId,
  onRefresh = () => {},
}) => {
  const { operators } = useOperators();
  const [search, setSearch] = useState("");
  const { updateWorkOrder } = useWorkOrders();
  const router = useRouter();
  const navigation = useNavigation();

  const currentOperatorIds = useMemo(
    () => workorder.operator.map((op) => op.id),
    [workorder]
  );

  const availableOperators = useMemo(() => {
    return operators
      .filter((op) => !currentOperatorIds.includes(op.id))
      .filter((op) =>
        op.name.toLowerCase().includes(search.trim().toLowerCase())
      );
  }, [operators, currentOperatorIds, search]);

  const handleManageOperatorTimes = (operator: Operator) => {
    router.push({
      pathname: "/operatorTimeManagement",
      params: {
        workOrderId: workorder.id,
        operatorId: operator.id,
        operatorName: operator.name,
      },
    });
  };

  const handleAddOperator = async (operator: Operator) => {
    const updatedWorkOrder = {
      ...workorder,
      operator: [...workorder.operator, operator],
    };
    setWorkorder(updatedWorkOrder);
    const newData = {
      id: workorder.id,
      description: workorder.description,
      code: workorder.code,
      workOrderType: workorder.workOrderType,
      operatorId: updatedWorkOrder.operator.map((op) => op.id),
      stateWorkOrder: workorder.stateWorkOrder,
      visibleReport: workorder.visibleReport ?? false,
      startTime: workorder.creationTime,
      operatorLoggedId: operatorLoggedId,
      userId: "67dec0ce2464c1a06ae59182",
    } as CreateWorkOrderRequest;
    await updateWorkOrder(newData);
    setSearch("");
  };

  const handleRemoveOperator = async (operatorId: string) => {
    const updatedWorkOrder = {
      ...workorder,
      operator: workorder.operator.filter((op) => op.id !== operatorId),
    };
    setWorkorder(updatedWorkOrder);
    const newData = {
      id: workorder.id,
      description: workorder.description,
      code: workorder.code,
      workOrderType: workorder.workOrderType,
      operatorId: updatedWorkOrder.operator.map((op) => op.id),
      stateWorkOrder: workorder.stateWorkOrder,
      visibleReport: workorder.visibleReport ?? false,
      startTime: workorder.creationTime,
      operatorLoggedId: operatorLoggedId,
      userId: "67dec0ce2464c1a06ae59182",
    } as CreateWorkOrderRequest;
    await updateWorkOrder(newData);
  };

  if (!operators || operators.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={Platform.OS === "android" ? 120 : 80}
      enableOnAndroid
    >
      <Text style={styles.sectionTitle}>Treballadors assignats</Text>
      <View style={styles.assignedContainer}>
        {workorder.operator.length === 0 ? (
          <Text style={styles.emptyText}>Cap treballador assignat</Text>
        ) : (
          workorder.operator.map((item) => (
            <View key={item.id} style={styles.operatorCard}>
              <TouchableOpacity
                style={styles.operatorInfo}
                onPress={() => handleManageOperatorTimes(item)}
              >
                <Text style={styles.operatorName}>{item.name}</Text>
                <Text style={styles.operatorSubtitle}>
                  Clica per gestionar els temps
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveOperator(item.id)}>
                <Ionicons
                  name="remove-circle"
                  size={28}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Text style={styles.sectionTitle}>Afegir treballador</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar treballador..."
        placeholderTextColor={theme.colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.resultsContainer}>
        {availableOperators.length === 0 ? (
          <Text style={styles.emptyText}>
            No hi ha treballadors disponibles
          </Text>
        ) : (
          availableOperators.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.addButton}
              onPress={() => handleAddOperator(item)}
            >
              <Ionicons name="person-add" size={22} color="#fff" />
              <Text style={styles.addButtonText}>{item.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
    marginTop: 16,
  },
  assignedContainer: {
    marginBottom: 20,
  },
  operatorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eef2f5",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  operatorSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  resultsContainer: {
    paddingBottom: 40,
  },
});
