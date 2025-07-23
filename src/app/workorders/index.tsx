import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrder,
} from "@interfaces/WorkOrder";
import { useAuthStore } from "../../stores/authStore";

import { WorkOrderItem } from "@components/workorder/WorkOrderItem";
import { Ionicons } from "@expo/vector-icons";
import { useWorkOrders } from "@hooks/useWorkOrders";
import { LoadingScreen } from "@screens/loading/loading";
import { router, useFocusEffect } from "expo-router";
import { theme } from "styles/theme";

export default function workOrders() {
  const { fetchWithFilters } = useWorkOrders();
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const authStore = useAuthStore();

  const fetchData = async () => {
    try {
      const data = await fetchWithFilters({
        originWorkOrder: OriginWorkOrder.Maintenance,
        operatorId: authStore.factoryWorker.id,
        userType: 0,
      });

      if (!data) return;
      setWorkOrders(
        data.sort((a, b) => {
          const startTimeA = new Date(a.startTime).valueOf();
          const startTimeB = new Date(b.startTime).valueOf();
          return startTimeA - startTimeB;
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

  const [showFinishedOnly, setShowFinishedOnly] = useState(false);

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

  const validStates = [StateWorkOrder.Finished, StateWorkOrder.NotFinished];
  const filteredWorkOrders = useMemo(() => {
    let result = workOrders;
    if (showFinishedOnly) {
      result = result.filter((wo) => validStates.includes(wo.stateWorkOrder));
    } else {
      result = result.filter((wo) => !validStates.includes(wo.stateWorkOrder));
    }

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
  }, [workOrders, searchQuery, authStore.factoryWorker, showFinishedOnly]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <View style={theme.commonStyles.mainContainer}>
      <View style={theme.commonStyles.header}>
        <View style={theme.commonStyles.leftColumn}>
          <Text
            style={theme.commonStyles.username}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {authStore.factoryWorker?.name ?? ""}
          </Text>
          <Text style={theme.commonStyles.total}>
            Total {filteredWorkOrders.length}
          </Text>
        </View>

        <View style={theme.commonStyles.centerColumn}>
          <TextInput
            style={theme.commonStyles.searchInput}
            placeholder="Buscar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={theme.commonStyles.rightColumn}>
          <TouchableOpacity
            onPress={() => setShowFinishedOnly(!showFinishedOnly)}
            style={{ padding: 8 }}
          >
            <Ionicons
              name={showFinishedOnly ? "checkmark-done" : "list"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => router.push("/corrective")}>
            <Ionicons name="add-circle" size={32} color="#fff" />
          </TouchableOpacity>*/}
        </View>
      </View>

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
    </View>
  );
}
