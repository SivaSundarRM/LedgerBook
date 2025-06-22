import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function LoanCalculator({ onCreateLoan, error }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    console.log('Submit Button Clicked'); // Log to debug

    // Check if the amount is valid
    if (!isNaN(numAmount) && numAmount > 0) {
      console.log('Creating Loan:', name, numAmount, startDate); // Log for debugging
      onCreateLoan(name, numAmount, startDate || undefined);  // Trigger the create loan
      setName('');
      setAmount('');
      setStartDate('');
    } else {
      console.error('Amount is invalid'); // Log if the amount is invalid
    }
  };

  return (
    <div className="loan-calculator">
      <h2>Create New Loan</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Borrower Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter borrower name"
            required
          />
        </div>

        <div>
          <label htmlFor="amount">Loan Amount ($)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="startDate">Loan Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <p className="info-text">Optional. If not set, today's date will be used.</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle />
            <p>{error}</p>
          </div>
        )}

        <button type="submit">Create Loan</button>
      </form>
    </div>
  );
}
