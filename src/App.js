import React from 'react';
import { LoanCalculator } from './components/LoanCalculator';
import { LoanList } from './components/LoanList';
import { useLoanManagement } from './hook/useManagement';
import './App.css';

function App() {
  const {
    filteredLoans,
    searchQuery,
    setSearchQuery,
    error,
    handleCreateLoan,
    deleteLoan,
    handleMakePayment
  } = useLoanManagement();

  return (
    <div className="app-container">
      <LoanCalculator onCreateLoan={handleCreateLoan} error={error} />
      <LoanList
        loans={filteredLoans}
        onMakePayment={handleMakePayment}
        onDelete={deleteLoan}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        error={error}
      />
    </div>
  );
}

export default App;
