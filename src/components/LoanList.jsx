import React from 'react';
import PropTypes from 'prop-types';
import LoanStatus from './LoanStatus';

export function LoanList({
  loans = [],
  onMakePayment,
  onDelete,
  searchQuery,
  setSearchQuery,
  error,
}) {
  const filteredLoans = loans.filter((loan) =>
    loan.borrower?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="loan-list">
      <h2>Active Loans</h2>

      <input
        type="text"
        placeholder="Search Borrower..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {error && <p className="error-message">{error}</p>}

      {filteredLoans.length === 0 ? (
        <p>No matching loans found.</p>
      ) : (
        filteredLoans.map((loan) => (
          <div key={loan.id} className="loan-wrapper">
            <div className="loan-meta">
              <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
              <p><strong>Repayment:</strong> {loan.frequency}</p>
              <p><strong>Remaining:</strong> ₹{loan.remainingAmount.toFixed(2)}</p>
            </div>
            <LoanStatus
              loan={loan}
              onMakePayment={onMakePayment}
              onDelete={onDelete}
              error={error}
            />
          </div>
        ))
      )}
    </section>
  );
}

LoanList.propTypes = {
  loans: PropTypes.array.isRequired,
  onMakePayment: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  error: PropTypes.string,
};
