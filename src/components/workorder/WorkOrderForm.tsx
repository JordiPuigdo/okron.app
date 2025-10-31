import { MaterialIcons } from "@expo/vector-icons";
import {
  StateWorkOrder,
  WorkOrder,
  WorkOrderCommentType,
  WorkOrderTimeType,
} from "@interfaces/WorkOrder";
import { configService } from "@services/configService";
import dayjs from "dayjs";
import React from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "styles/theme";
import { WorkOrderSummary } from "./WorkOrderSummary";

interface Props {
  workOrder?: WorkOrder;
  onRefresh?: () => void;
}

const getInstallationAddress = (workOrder: WorkOrder) => {
  if (workOrder.customerWorkOrder.customerInstallationAddress) {
    return `${workOrder.customerWorkOrder.customerInstallationAddress.address}, ${workOrder.customerWorkOrder.customerInstallationAddress.city}, ${workOrder.customerWorkOrder.customerInstallationAddress.province}`;
  }
  return `${workOrder.customerWorkOrder.customerAddress.address}, ${workOrder.customerWorkOrder.customerAddress.city}, ${workOrder.customerWorkOrder.customerAddress.province}`;
};

export const WorkOrderForm: React.FC<Props> = ({ workOrder, onRefresh }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { isCRM } = configService.getConfigSync();

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [onRefresh]);

  if (!isCRM) return <WorkOrderSummary workOrder={workOrder} />;

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
          progressBackgroundColor="#ffffff"
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DADES CLIENT</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Direcció:</Text>
              <Text style={styles.value}>
                {workOrder.customerWorkOrder?.customerAddress?.address || "-"}
              </Text>

              <Text style={styles.label}>CP:</Text>
              <Text style={styles.value}>
                {workOrder.customerWorkOrder?.customerAddress?.postalCode ||
                  "-"}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Població:</Text>
              <Text style={styles.value}>
                {workOrder.customerWorkOrder?.customerAddress?.city || "-"}
              </Text>

              <Text style={styles.label}>Província:</Text>
              <Text style={styles.value}>
                {workOrder.customerWorkOrder?.customerAddress?.province || "-"}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>BOTIGA</Text>
              <Text>
                {workOrder.customerWorkOrder.customerInstallationCode || "-"}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Adreça</Text>
              <Text>{getInstallationAddress(workOrder) || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>NOM ORDRE</Text>
              <Text style={styles.value}>{workOrder.code || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Data</Text>
              <Text style={styles.value}>
                {dayjs(workOrder.creationTime).format("DD/MM/YYYY")}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>REF. CLIENT</Text>
              <Text style={styles.value}>{workOrder.refCustomerId || "-"}</Text>
            </View>
          </View>
        </View>
        {/* OBJECTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBJECTE</Text>
          <Text>{workOrder.asset?.description}</Text>
        </View>

        {/* AVÍS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVÍS</Text>
          <Text>{workOrder.description}</Text>
        </View>

        {/* DESCRIPCIÓ REPARACIÓ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIPCIÓ REPERACIÓ</Text>
          <Text>
            {workOrder.workOrderComments
              .filter((x) => x.type == WorkOrderCommentType.External)
              .map((x) => x.comment)
              .join(", ") || "-"}
          </Text>
        </View>

        {/* MATERIAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MATERIAL</Text>
          <Text>
            {(workOrder.workOrderSpareParts &&
              workOrder.workOrderSpareParts
                ?.map((sp) => sp.sparePart.description)
                .join(", ")) ||
              "-"}
          </Text>
        </View>

        {/* HORES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HORES</Text>

          {workOrder.workOrderOperatorTimes?.length ? (
            <View style={styles.compactContainer}>
              {workOrder.workOrderOperatorTimes
                .sort((a, b) => {
                  if (
                    a.type === WorkOrderTimeType.Travel &&
                    b.type !== WorkOrderTimeType.Travel
                  ) {
                    return -1;
                  }
                  if (
                    a.type !== WorkOrderTimeType.Travel &&
                    b.type === WorkOrderTimeType.Travel
                  ) {
                    return 1;
                  }
                  return 0;
                })
                .map((time, index) => (
                  <View key={`${time.id}-${index}`} style={styles.compactEntry}>
                    <MaterialIcons
                      name={
                        time.type === WorkOrderTimeType.Travel
                          ? "directions-car"
                          : "work"
                      }
                      size={16}
                      style={styles.compactIcon}
                    />
                    <Text style={styles.compactText}>
                      {dayjs(time.startTime).format("DD/MM HH:mm")} {" - "}
                      {time.endTime
                        ? dayjs(time.endTime).format("HH:mm")
                        : "--"}{" "}
                      <MaterialIcons
                        name="arrow-right"
                        style={{
                          marginHorizontal: 4,
                          color: theme.colors.textSecondary,
                          fontSize: 16,
                          alignContent: "center",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      />{" "}
                      {time.operator.name}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text>-</Text>
          )}
        </View>

        {/* NOM TÈCNICS */}
        <Section title="NOM TÈCNICS">
          <Text>{workOrder.operator.map((o) => o.name).join(", ")}</Text>
        </Section>

        {workOrder.stateWorkOrder === StateWorkOrder.NotFinished && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOTIU DE NO FINALITZACIÓ</Text>
            <Text style={styles.value}>
              {workOrder.workOrderComments
                .filter((x) => x.type == WorkOrderCommentType.NotFinished)
                .map((x) => x.comment)
                .join(", ") || "-"}
            </Text>
          </View>
        )}

        {workOrder.stateWorkOrder === StateWorkOrder.Finished && (
          <Section title="OBSERVACIONS">
            <Text>
              {workOrder.workOrderComments
                .filter((x) => x.type == WorkOrderCommentType.Internal)
                .map((x) => x.comment)}
            </Text>
          </Section>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={styles.sectionTitle}>FIRMA TÈCNIC</Text>
            {workOrder.workerSign && (
              <Image
                source={{ uri: workOrder.workerSign }}
                style={{ width: 150, height: 100 }}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.sectionTitle}>FIRMA CLIENT</Text>
            {workOrder.customerSign && (
              <Image
                source={{ uri: workOrder.customerSign }}
                style={{ width: 150, height: 100 }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 8,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textDecorationLine: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    marginBottom: 8,
    minHeight: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  signatureBox: {
    height: 80,
    width: "45%",
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 16,
  },
  compactContainer: {
    gap: 8,
  },
  compactEntry: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactIcon: {
    marginRight: 8,
    color: theme.colors.textSecondary,
  },
  compactText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={stylesSection.sectionContainer}>
    <Text style={stylesSection.sectionHeader}>{title}</Text>
    <View style={stylesSection.sectionContent}>{children}</View>
  </View>
);

const stylesSection = StyleSheet.create({
  sectionContainer: {
    backgroundColor: "#f4f7fa", // gris industrial claro
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  sectionContent: {
    paddingLeft: 4,
  },
});
