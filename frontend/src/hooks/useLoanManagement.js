import { useCallback, useEffect, useRef, useState } from "react";
import { loansApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";

export function useLoanManagement() {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("loading"); // loading | error | success
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);
  const toast = useToast();
  const debounceRef = useRef(null);

  const fetchLoans = useCallback(async (query) => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    try {
      const res = await loansApi.list(query);
      setLoans(res.data);
      setStatus("success");
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLoans(searchQuery);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, fetchLoans]);

  const handleCreateLoan = async (borrowerName, amount, startDate, interestRate, frequency) => {
    setMutating(true);
    try {
      await loansApi.create({ borrowerName, amount, startDate, interestRate, frequency });
      toast.success(`Loan created for ${borrowerName}.`);
      await fetchLoans(searchQuery);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setMutating(false);
    }
  };

  const handleMakePayment = async (loanId, amount) => {
    setMutating(true);
    try {
      await loansApi.makePayment(loanId, amount);
      toast.success("Payment recorded.");
      await fetchLoans(searchQuery);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setMutating(false);
    }
  };

  const handleRestartLoan = async (loanId) => {
    setMutating(true);
    try {
      const res = await loansApi.restart(loanId);
      toast.success(
        `Loan restarted — ₹${res.data.newDisbursedAmount.toFixed(2)} handed over this cycle.`
      );
      await fetchLoans(searchQuery);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setMutating(false);
    }
  };

  const deleteLoan = async (loanId) => {
    setMutating(true);
    try {
      await loansApi.remove(loanId);
      toast.success("Loan deleted.");
      setLoans((prev) => prev.filter((l) => l._id !== loanId));
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setMutating(false);
    }
  };

  return {
    loans,
    searchQuery,
    setSearchQuery,
    status,
    error,
    mutating,
    handleCreateLoan,
    handleMakePayment,
    handleRestartLoan,
    deleteLoan,
    refresh: () => fetchLoans(searchQuery),
  };
}
