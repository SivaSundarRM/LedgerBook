import { useCallback, useEffect, useState } from "react";
import { loansApi } from "../api/endpoints";

export function useProfitSummary() {
  const [byBorrower, setByBorrower] = useState([]);
  const [totals, setTotals] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | error | success
  const [error, setError] = useState(null);

  const fetchProfit = useCallback(async () => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    try {
      const res = await loansApi.profit();
      setByBorrower(res.data.byBorrower);
      setTotals(res.data.totals);
      setStatus("success");
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchProfit();
  }, [fetchProfit]);

  return { byBorrower, totals, status, error, refresh: fetchProfit };
}
