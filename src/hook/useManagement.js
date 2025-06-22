import { useState, useEffect } from "react";

const STORAGE_KEY = "loan_system_data";

// Helper functions
function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateNextRepaymentDate(currentDate) {
  return addDaysToDate(currentDate, 7);
}

function isSameWeek(date1, date2) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.abs(date1 - date2) < oneWeek;
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

  // Fetch loans with borrower details
  const getLoansWithDetails = () => {
    return (data.loans || []).map((loan) => ({
      ...loan,
      borrower: (data.borrowers || []).find((b) => b.id === loan.borrowerId) || { name: "Unknown" },
      payments: (data.payments || []).filter((p) => p.loanId === loan.id),
    }));
  };

  // Update filteredLoans whenever data or searchQuery changes
  useEffect(() => {
    const loansWithDetails = getLoansWithDetails();

    const updatedFilteredLoans = searchQuery
      ? loansWithDetails.filter((loan) =>
          loan.borrower && loan.borrower.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : loansWithDetails;

    setFilteredLoans(updatedFilteredLoans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, searchQuery]);

  // Handle creating a loan
  const handleCreateLoan = (name, amount, startDate) => {
    if (!name.trim()) {
      setError("Borrower name is required");
      return;
    }
    if (amount <= 0) {
      setError("Loan amount must be greater than 0");
      return;
    }

    const loanStartDate = startDate ? new Date(startDate) : new Date();
    const nextRepaymentDate = calculateNextRepaymentDate(loanStartDate);

    if (loanStartDate.toDateString() === new Date().toDateString()) {
      alert("Repayment will start from next week!");
    }

    const borrowerId = Date.now().toString();
    const loanId = (Date.now() + 1).toString();

    const borrower = { id: borrowerId, name: name.trim(), createdAt: new Date().toISOString() };
    const loan = {
      id: loanId,
      borrowerId: borrowerId,
      amount,
      totalRepayment: amount * 1.36,
      startDate: loanStartDate.toISOString(),
      nextRepaymentDate: nextRepaymentDate.toISOString(),
      remainingAmount: amount * 1.36,
      payments: [],
      missedPayments: 0,
    };

    setData((prev) => ({
      borrowers: [...prev.borrowers, borrower],
      loans: [...prev.loans, loan],
      payments: prev.payments || [],
    }));

    setError(null);
  };

  // Handle making a payment
  const handleMakePayment = (loanId, paymentAmount) => {
    setData((prev) => {
      const loan = prev.loans?.find((l) => l.id === loanId);
      if (!loan) return prev;
  
      if (paymentAmount > loan.remainingAmount) {
        setError("Payment amount cannot exceed remaining balance");
        return prev;
      }
  
      const currentDate = new Date();
      const lastPayment =
        loan.payments?.length > 0 ? new Date(loan.payments[loan.payments.length - 1].date) : null;
  
      if (lastPayment && isSameWeek(currentDate, lastPayment)) {
        setError("Only one payment is allowed per week for this loan");
        return prev;
      }
  
      const loanCreationDate = new Date(loan.startDate);
      if (loanCreationDate.toDateString() === currentDate.toDateString()) {
        alert("Repayment cannot be made today, it starts next week.");
        return prev;
      }
  
      let nextRepaymentDate = calculateNextRepaymentDate(currentDate);
  
      // Check if the borrower missed previous payments
      if (new Date(loan.nextRepaymentDate) < currentDate) {
        const missedWeeks = Math.floor((currentDate - new Date(loan.nextRepaymentDate)) / (7 * 24 * 60 * 60 * 1000));
        loan.missedPayments += missedWeeks;
        nextRepaymentDate = calculateNextRepaymentDate(currentDate);
      }
  
      const newPayment = {
        id: Date.now().toString(),
        loanId: loan.id,
        amount: paymentAmount,  // ✅ Allow 0 payments
        date: currentDate.toISOString(),
      };
  
      return {
        borrowers: prev.borrowers || [],
        loans: prev.loans.map((l) =>
          l.id === loanId
            ? {
                ...l,
                remainingAmount: l.remainingAmount - paymentAmount,
                payments: [...(l.payments || []), newPayment],  // ✅ Always add payments
                nextRepaymentDate: nextRepaymentDate.toISOString(),
                missedPayments: loan.missedPayments,
              }
            : l
        ),
        payments: [...(prev.payments || []), newPayment], // ✅ Always add payments
      };
    });
  
    setError(null);
  };
  
  // Delete a loan
  const deleteLoan = (loanId) => {
    setData((prev) => {
      const loanToDelete = prev.loans.find((loan) => loan.id === loanId);
      if (!loanToDelete) {
        setError("Loan not found");
        return prev;
      }

      const updatedLoans = prev.loans.filter((loan) => loan.id !== loanId);
      const updatedPayments = prev.payments.filter((payment) => payment.loanId !== loanId);

      return {
        borrowers: prev.borrowers,
        loans: updatedLoans,
        payments: updatedPayments,
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
