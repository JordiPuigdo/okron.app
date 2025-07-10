import { useEffect, useState } from "react";

import Operator from "@interfaces/Operator";
import { operatorService } from "@services/operatorService";

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await operatorService.getOperators();
      setOperators(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  return {
    operators,
    loading,
    error,
    refetch: fetchOperators,
  };
}
