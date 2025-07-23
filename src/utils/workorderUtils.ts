import { StateWorkOrder } from "@interfaces/WorkOrder";

export const translateStateWorkOrder = (state: any): string => {
  switch (state) {
    case StateWorkOrder.Waiting:
      return "Pendent";
    case StateWorkOrder.OnGoing:
      return "En curs";
    case StateWorkOrder.Paused:
      return "Pausada";
    case StateWorkOrder.Finished:
      return "Finalitzada";
    case StateWorkOrder.PendingToValidate:
      return "Pendent Validar";
    case StateWorkOrder.Requested:
      return "Sol·licitat";
    case StateWorkOrder.Open:
      return "Obert";
    case StateWorkOrder.Closed:
      return "Tancat";
    case StateWorkOrder.NotFinished:
      return "No Finalitzada";
    default:
      return "";
  }
};

export function formatTimeSpan(timeSpan: string): string {
  const MIN_TIME_SPAN = "-10675199.02:48:05.4775808";

  if (timeSpan === MIN_TIME_SPAN) {
    return "";
  }

  const regex = /([-+]?)(?:(\d+)\.)?(\d+):(\d+):(\d+)/;
  const match = timeSpan.match(regex);

  if (!match) {
    return timeSpan;
  }

  const sign = match[1];
  const days = match[2] || "0";
  const hours = match[3];
  const minutes = match[4];
  const seconds = match[5];

  const totalHours = parseInt(hours) + parseInt(days) * 24;
  const formattedHours = totalHours.toString().padStart(2, "0");
  const formattedMinutes = minutes.padStart(2, "0");
  const formattedSeconds = seconds.padStart(2, "0");

  return `${sign}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
