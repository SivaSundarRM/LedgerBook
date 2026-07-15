import React from "react";
import { Navbar } from "../components/Navbar";
import { LoanCalculator } from "../components/LoanCalculator";
import { LoanList } from "../components/LoanList";
import { useLoanManagement } from "../hooks/useLoanManagement";

export default function Dashboard() {
  const {
    loans,
    status,
    error,
    searchQuery,
    setSearchQuery,
    mutating,
    handleCreateLoan,
    handleMakePayment,
    handleRestartLoan,
    deleteLoan,
    refresh,
  } = useLoanManagement();

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[340px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <LoanCalculator onCreateLoan={handleCreateLoan} mutating={mutating} />
        </div>
        <LoanList
          loans={loans}
          status={status}
          error={error}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMakePayment={handleMakePayment}
          onRestartLoan={handleRestartLoan}
          onDelete={deleteLoan}
          mutating={mutating}
          onRetry={refresh}
        />
      </main>
    </div>
  );
}
