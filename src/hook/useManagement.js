import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "loan_system_data";

function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateNextRepaymentDate(currentDate, frequency = "weekly") {
  const daysToAdd = frequency === "monthly" ? 30 : 7;
  return addDaysToDate(currentDate, daysToAdd);
}

function isSamePeriod(date1, date2, frequency) {
  const diff = Math.abs(date1 - date2);
  const onePeriod = frequency === "monthly" ? 30 : 7;
  return diff < onePeriod * 24 * 60 * 60 * 1000;
}

export function useLoanManagement() {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : { borrowers: [], loans: [], payments: [] };
    } catch (error) {
      console.error("Error parsing stored data", error);
      return { borrowers: [], loans: [], payments: [] };
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [filteredLoans, setFilteredLoans] = useState([]);

  const getLoansWithDetails = useCallback(() => {
    return (data.loans || []).map((loan) => {
      const borrower = (data.borrowers || []).find((b) => b.id === loan.borrowerId) || { name: "Unknown" };
      const payments = (data.payments || []).filter((p) => p.loanId === loan.id);
      return { ...loan, borrower, payments };
    });
  }, [data]);

  useEffect(() => {
    const loansWithDetails = getLoansWithDetails();
    const updatedFilteredLoans = searchQuery
      ? loansWithDetails.filter((loan) =>
          loan.borrower?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : loansWithDetails;

    setFilteredLoans(updatedFilteredLoans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, searchQuery, getLoansWithDetails]);

  const handleCreateLoan = (name, amount, startDate, interestRate = 3, frequency = "weekly") => {
    if (!name.trim()) {
      setError("Borrower name is required");
      return;
    }
    if (amount <= 0) {
      setError("Loan amount must be greater than 0");
      return;
    }

    const loanStartDate = startDate ? new Date(startDate) : new Date();
    const nextRepaymentDate = calculateNextRepaymentDate(loanStartDate, frequency);

    const borrowerId = Date.now().toString();
    const loanId = (Date.now() + 1).toString();

    const borrower = { id: borrowerId, name: name.trim(), createdAt: new Date().toISOString() };

    let totalRepayment = 0;
    const durationWeeks = 26; // fixed for 6 months
    const durationMonths = 12; // for monthly loan

    if (frequency === "weekly") {
      totalRepayment = amount + 360; // Fixed 360 Rs interest for 6 months
    } else {
      const monthlyInterest = amount * (interestRate / 100);
      totalRepayment = amount + (monthlyInterest * durationMonths);
    }

    const loan = {
      id: loanId,
      borrowerId,
      amount,
      originalPrincipal: amount,
      interestRate,
      frequency,
      totalRepayment,
      startDate: loanStartDate.toISOString(),
      nextRepaymentDate: nextRepaymentDate.toISOString(),
      remainingAmount: totalRepayment,
      payments: [],
      missedPayments: 0,
      finalRepaymentDate: null,
      interestEarnedPercentage: null,
    };

    setData((prev) => ({
      borrowers: [...prev.borrowers, borrower],
      loans: [...prev.loans, loan],
      payments: prev.payments || [],
    }));

    setError(null);
  };

  const handleMakePayment = (loanId, paymentAmount) => {
    setData((prev) => {
      const loan = prev.loans.find((l) => l.id === loanId);
      if (!loan) return prev;

      if (paymentAmount > loan.remainingAmount) {
        setError("Payment amount exceeds remaining balance");
        return prev;
      }

      const currentDate = new Date();
      const lastPayment = loan.payments?.length > 0
        ? new Date(loan.payments[loan.payments.length - 1].date)
        : null;

      const repaymentStart = calculateNextRepaymentDate(new Date(loan.startDate), loan.frequency);
      if (currentDate < repaymentStart) {
        alert("Repayment cannot be made today; it starts next period.");
        return prev;
      }

      if (lastPayment && isSamePeriod(currentDate, lastPayment, loan.frequency)) {
        setError(`Only one payment per ${loan.frequency} is allowed`);
        return prev;
      }

      let nextRepaymentDate = calculateNextRepaymentDate(currentDate, loan.frequency);

      if (new Date(loan.nextRepaymentDate) < currentDate) {
        const missedPeriods = Math.floor(
          (currentDate - new Date(loan.nextRepaymentDate)) / 
          ((loan.frequency === "monthly" ? 30 : 7) * 24 * 60 * 60 * 1000)
        );
        loan.missedPayments += missedPeriods;
      }

      const newPayment = {
        id: Date.now().toString(),
        loanId: loan.id,
        amount: paymentAmount,
        date: currentDate.toISOString(),
      };

      const updatedPayments = [...(loan.payments || []), newPayment];
      const newRemaining = loan.remainingAmount - paymentAmount;

      let finalRepaymentDate = loan.finalRepaymentDate;
      let interestEarnedPercentage = loan.interestEarnedPercentage;

      if (newRemaining <= 0 && !loan.finalRepaymentDate) {
        finalRepaymentDate = currentDate.toISOString();
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const interestEarned = totalPaid - loan.originalPrincipal;

        const start = new Date(loan.startDate);
        const end = new Date(currentDate);
        const daysTaken = (end - start) / (1000 * 60 * 60 * 24);
        const monthsTaken = daysTaken / 30;

        if (loan.frequency === "weekly") {
          const yearlyInterest = (interestEarned / loan.originalPrincipal) * (365 / daysTaken) * 100;
          interestEarnedPercentage = parseFloat(yearlyInterest.toFixed(2));
        } else {
          const monthlyRate = (interestEarned / loan.originalPrincipal) / monthsTaken * 100;
          interestEarnedPercentage = parseFloat(monthlyRate.toFixed(2));
        }
      }

      return {
        borrowers: prev.borrowers,
        loans: prev.loans.map((l) =>
          l.id === loanId
            ? {
                ...l,
                remainingAmount: newRemaining,
                payments: updatedPayments,
                nextRepaymentDate: nextRepaymentDate.toISOString(),
                missedPayments: loan.missedPayments,
                finalRepaymentDate,
                interestEarnedPercentage,
              }
            : l
        ),
        payments: [...prev.payments, newPayment],
      };
    });

    setError(null);
  };

  const deleteLoan = (loanId) => {
    setData((prev) => {
      const loanToDelete = prev.loans.find((loan) => loan.id === loanId);
      if (!loanToDelete) {
        setError("Loan not found");
        return prev;
      }

      return {
        borrowers: prev.borrowers,
        loans: prev.loans.filter((loan) => loan.id !== loanId),
        payments: prev.payments.filter((payment) => payment.loanId !== loanId),
      };
    });
    setError(null);
  };

  return {
    filteredLoans,
    searchQuery,
    setSearchQuery,
    error,
    handleCreateLoan,
    handleMakePayment,
    deleteLoan,
  };
}
