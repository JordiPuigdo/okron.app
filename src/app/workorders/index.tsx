import React, { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import {
  StateWorkOrder,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderType,
} from "@interfaces/WorkOrder";
import { useAuthStore } from "../../stores/authStore";

import { getUserType, getWorkOrderOrigin } from "@components/workorder/utils";
import { WorkOrderFilters } from "@components/workorder/WorkOrderFilters";
import { WorkOrderItem } from "@components/workorder/WorkOrderItem";
import { WorkOrdersListHeader } from "@components/workorder/WorkOrdersListHeader";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { OperatorType } from "@interfaces/Operator";
import { LoadingScreen } from "@screens/loading/loading";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { router, useFocusEffect } from "expo-router";
import { theme } from "styles/theme";

dayjs.extend(isBetween);

export default function workOrders() {
  const { fetchWithFilters } = useWorkOrders();
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const authStore = useAuthStore();

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<{
    startDate?: Date;
    endDate?: Date;
    priority?: WorkOrderPriority | null;
    showFinishedToday?: boolean;
    workOrderType?: WorkOrderType | null;
    orderBy?: string | null;
  }>({});

  const fetchData = async () => {
    try {
      const data = await fetchWithFilters({
        originWorkOrder: getWorkOrderOrigin(
          authStore.factoryWorker.operatorType
        ),
        operatorId: authStore.factoryWorker.id,
        userType: getUserType(authStore.factoryWorker.operatorType),
      });

      if (!data) return;
      setWorkOrders(
        data.sort((a, b) => {
          const startTimeA = new Date(a.creationTime).valueOf();
          const startTimeB = new Date(b.creationTime).valueOf();
          return startTimeB - startTimeA;
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (authStore.factoryWorker) {
      fetchData();
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (authStore.factoryWorker) {
        fetchData();
      }

      return () => {};
    }, [authStore.factoryWorker])
  );

  const validStatesMaintenance = [
    StateWorkOrder.OnGoing,
    StateWorkOrder.Waiting,
    StateWorkOrder.Paused,
  ];

  const validStatesQuality = [
    StateWorkOrder.Open,
    StateWorkOrder.PendingToValidate,
  ];

  const validStatesRepairs = [
    StateWorkOrder.Waiting,
    StateWorkOrder.OnGoing,
    StateWorkOrder.Paused,
  ];

  function getValidStates() {
    if (!authStore) return validStatesMaintenance;
    const operatorType = authStore.factoryWorker?.operatorType;

    if (operatorType == OperatorType.Maintenance) {
      return validStatesMaintenance;
    } else if (
      operatorType == OperatorType.Quality ||
      operatorType == OperatorType.Production
    ) {
      return validStatesQuality;
    } else if (operatorType == OperatorType.Repairs) {
      return validStatesRepairs;
    }

    return [];
  }

  const filteredWorkOrders = useMemo(() => {
    if (
      !workOrders ||
      workOrders.length == 0 ||
      !authStore ||
      !authStore.factoryWorker
    )
      return [];
    let result = workOrders;

    const validStates = getValidStates?.() ?? [];

    // Mostrar solo las finalizadas o activas según el toggle
    if (filters.showFinishedToday) {
      result = result.filter((wo) => !validStates.includes(wo.stateWorkOrder));
    } else {
      result = result.filter((wo) => validStates.includes(wo.stateWorkOrder));
    }

    if (filters.workOrderType !== undefined && filters.workOrderType !== null) {
      result = result.filter(
        (wo) => wo.workOrderType === filters.workOrderType
      );
    }

    // 🔹 Filtro por fecha
    if (filters.startDate && filters.endDate) {
      result = result.filter((wo) => {
        return dayjs(wo.creationTime).isBetween(
          filters.startDate,
          filters.endDate,
          "day",
          "[]"
        );
      });
    }

    // 🔹 Filtro por prioridad
    if (filters.priority !== undefined && filters.priority !== null) {
      result = result.filter((wo) => wo.priority === filters.priority);
    }

    if (filters.orderBy) {
      switch (filters.orderBy) {
        case "code_asc":
          result = result.sort((a, b) => a.code.localeCompare(b.code));
          break;
        case "code_desc":
          result = result.sort((a, b) => b.code.localeCompare(a.code));
          break;
        case "date_asc":
          result = result.sort(
            (a, b) =>
              new Date(a.creationTime).getTime() -
              new Date(b.creationTime).getTime()
          );
          break;
        case "date_desc":
          result = result.sort(
            (a, b) =>
              new Date(b.creationTime).getTime() -
              new Date(a.creationTime).getTime()
          );
          break;
        case "state_asc":
          result = result.sort((a, b) => a.stateWorkOrder - b.stateWorkOrder);
          break;
        case "state_desc":
          result = result.sort((a, b) => b.stateWorkOrder - a.stateWorkOrder);
          break;
        case "priority_asc":
          result = result.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
          break;
        case "priority_desc":
          result = result.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
          break;
      }
    }

    // 🔹 Filtro por texto
    const query = searchQuery.toLowerCase().trim();
    if (!query) return result;

    return result
      .filter((wo) => !!wo && !!wo.code && !!wo.asset && !!wo.asset.description)
      .filter((workOrder) => {
        return (
          workOrder.code.toLowerCase().includes(query) ||
          workOrder.description.toLowerCase().includes(query) ||
          workOrder.asset.brand?.toLowerCase().includes(query) ||
          workOrder.asset.code?.toLowerCase().includes(query) ||
          workOrder.asset.description.toLowerCase().includes(query) ||
          workOrder.operator.some((x) => x.name.toLowerCase().includes(query))
        );
      });
  }, [
    workOrders,
    searchQuery,
    authStore.factoryWorker,
    filters.startDate,
    filters.endDate,
    filters.priority,
    filters.workOrderType,
    filters.showFinishedToday,
    filters.orderBy,
  ]);

  function areFiltersActive(filters) {
    return (
      filters.priority != null ||
      filters.startDate != null ||
      filters.endDate != null ||
      filters.showFinishedToday === true ||
      filters.workOrderType != null ||
      filters.orderBy != null
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <View style={theme.commonStyles.mainContainer}>
      <WorkOrdersListHeader
        operatorName={authStore.factoryWorker?.name ?? ""}
        totalOrders={filteredWorkOrders.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilters={() => setFiltersVisible(true)}
        hasActiveFilters={areFiltersActive(filters)}
        operatorType={authStore.factoryWorker?.operatorType!}
      />

      {
        <FlatList
          data={filteredWorkOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkOrderItem
              workOrder={item}
              onPress={() => router.push(`/workorders/${item.id} `)}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      }

      <WorkOrderFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={(newFilters) => setFilters(newFilters)}
      />
    </View>
  );
}
