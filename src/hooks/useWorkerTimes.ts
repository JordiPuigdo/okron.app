import { WorkOrderOperatorTimes } from "@interfaces/WorkOrder";
import dayjs from "dayjs";
import { useState } from "react";

export const useWorkerTimes = () => {
  const [workerTimes, setWorkerTimes] = useState<WorkOrderOperatorTimes[]>([]);

  const handleFinalize = (operatorId: string) => {
    const t = workerTimes.find(
      (o) => o.operator.id === operatorId && !o.endTime
    );
    if (t) {
      t.endTime = new Date();
      t.totalTime = dayjs(t.endTime).diff(dayjs(t.startTime)).toString();
      setWorkerTimes([...workerTimes]);
    }
  };

  return {
    workerTimes,
    setWorkerTimes,
    handleFinalize,
  };
};
