import { FontAwesome5 } from "@expo/vector-icons";
import { StateWorkOrder, WorkOrder } from "@interfaces/WorkOrder";
import dayjs from "dayjs";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { stateColors } from "./WorkOrderItem";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  showOperators?: boolean;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  workOrder,
  showOperators,
}) => {
  const getBadgeStyle = (state: StateWorkOrder) => {
    switch (state) {
      case StateWorkOrder.Finished:
      case StateWorkOrder.Open:
        return [styles.badge, { backgroundColor: stateColors[state] }]; // verde
      case StateWorkOrder.OnGoing:
        return [styles.badge, { backgroundColor: stateColors[state] }]; // amarillo
      case StateWorkOrder.Waiting:
      case StateWorkOrder.NotFinished:
        return [styles.badge, { backgroundColor: stateColors[state] }]; // rojo
      case StateWorkOrder.PendingToValidate:
        return [styles.badge, { backgroundColor: stateColors[state] }];
      case StateWorkOrder.Closed:
        return [styles.badge, { backgroundColor: stateColors[state] }];
      case StateWorkOrder.Paused:
        return [styles.badge, { backgroundColor: stateColors[state] }];
      default:
        return styles.badge;
    }
  };

  const getBadgeText = (state: StateWorkOrder) => {
    switch (state) {
      case StateWorkOrder.Finished:
        return "Finalitzat";
      case StateWorkOrder.OnGoing:
        return "En curs";
      case StateWorkOrder.Waiting:
        return "Pendent";
      case StateWorkOrder.Open:
        return "Obert";
      case StateWorkOrder.Closed:
        return "Tancat";
      case StateWorkOrder.PendingToValidate:
        return "Pdt Validar";
      case StateWorkOrder.Paused:
        return "Pausada";
      default:
        return "-";
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.code}>{workOrder.code || "-"}</Text>
        <View style={getBadgeStyle(workOrder.stateWorkOrder)}>
          <Text style={styles.badgeText}>
            {getBadgeText(workOrder.stateWorkOrder)}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{workOrder.description || "-"}</Text>

      <Text style={styles.date}>
        {dayjs(workOrder.creationTime).format("DD/MM/YYYY HH:mm")}
      </Text>
      <Text style={styles.description}>
        {workOrder.originalWorkOrderCode ?? ""}
      </Text>

      {workOrder.workOrderComments &&
        workOrder.workOrderComments.length > 0 && (
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <FontAwesome5 name="comments" size={14} color="#0a2947" />
              <Text style={styles.commentsTitle}>Comentaris</Text>
            </View>

            {workOrder.workOrderComments.slice(0, 2).map((c, i) => (
              <View key={i} style={styles.commentRow}>
                {typeof c === "string" ? (
                  <Text style={styles.commentText}>• {c}</Text>
                ) : (
                  <Text style={styles.commentText}>
                    • {c.operator.name ? `${c.operator.name}: ` : ""}
                    {c.comment}
                  </Text>
                )}
              </View>
            ))}

            {workOrder.workOrderComments.length > 2 && (
              <Text style={styles.moreComments}>
                +{workOrder.workOrderComments.length - 2} més...
              </Text>
            )}
          </View>
        )}

      {showOperators && workOrder.operator?.length ? (
        <View style={styles.operators}>
          {workOrder.operator.map((op, i) => (
            <View key={i} style={styles.operatorRow}>
              <FontAwesome5
                name="user-cog"
                size={16}
                color="#374151"
                style={styles.icon}
              />
              <Text style={styles.operatorName}>{op.name}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  commentsSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#c3ccd6",
    paddingTop: 8,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentsTitle: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#0a2947",
  },
  commentRow: {
    marginLeft: 8,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: "#374151",
  },
  moreComments: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#e7ecf2", // gris industrial claro
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#c3ccd6", // borde aluminio
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  code: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a2947", // azul técnico oscuro
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    color: "#28313d",
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: "#526070",
  },
  operators: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#c3ccd6",
    paddingTop: 8,
  },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  operatorName: {
    color: "#0a2947",
    fontSize: 14,
  },
  icon: {
    marginRight: 6,
    color: "#526070",
  },
});
