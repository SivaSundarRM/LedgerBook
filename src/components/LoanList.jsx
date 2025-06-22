import React from 'react';
import PropTypes from 'prop-types';
import LoanStatus from './LoanStatus';

export function LoanList({ loans = [], onMakePayment, onDelete, searchQuery, setSearchQuery, error }) {
  if (!onDelete) {
    console.error('onDelete function is missing in LoanList'); // Debugging
  }

  return (
    <section className="loan-list">
      <h2>Active Loans</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Borrower..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {error && <p className="error-message">{error}</p>}

      {loans.length === 0 ? (
        <p>No active loans available.</p>
      ) : (
        loans.map((loan) => (
          <LoanStatus key={loan.id} loan={loan} onMakePayment={onMakePayment} onDelete={onDelete} />
        ))
      )}
    </section>
  );
}

LoanList.propTypes = {
  loans: PropTypes.array.isRequired,
  onMakePayment: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired, // ✅ Ensure it's required
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  error: PropTypes.string,
};
