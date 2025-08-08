import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function LoanCalculator({ onCreateLoan, error }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [frequency, setFrequency] = useState('weekly');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numInterest = parseFloat(interestRate);

    if (!name.trim() || isNaN(numAmount) || numAmount <= 0 || isNaN(numInterest) || numInterest < 0) {
      console.error('Invalid input values');
      return;
    }

    onCreateLoan(name.trim(), numAmount, startDate || undefined, numInterest, frequency);
    setName('');
    setAmount('');
    setStartDate('');
    setInterestRate('');
    setFrequency('weekly');
  };

  const estimatedTotalRepayment = () => {
    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate);
    if (isNaN(principal) || isNaN(rate)) return null;

    if (frequency === 'weekly') {
      return principal + 360;
    } else {
      const monthlyInterest = principal * (rate / 100);
      return principal + (monthlyInterest * 12);
    }
  };

  const perPaymentAmount = () => {
    const total = estimatedTotalRepayment();
    if (!total) return null;
    return frequency === 'weekly' ? total / 26 : total / 12;
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
          <label htmlFor="amount">Loan Amount (₹)</label>
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
          <label htmlFor="interestRate">Interest Rate (%)</label>
          <input
            type="number"
            id="interestRate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 3"
            min="0"
            step="0.1"
            required
          />
          <p className="info-text">
            {frequency === 'weekly'
              ? 'Fixed ₹360 interest added for 6 months duration.'
              : 'Monthly interest % applied over 12 months.'}
          </p>
        </div>

        <div>
          <label htmlFor="frequency">Repayment Frequency</label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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

        {estimatedTotalRepayment() && (
          <>
            <p className="info-text">
              Estimated Total Repayment: ₹{estimatedTotalRepayment().toFixed(2)}
            </p>
            <p className="info-text">
              Per {frequency === 'weekly' ? 'Week' : 'Month'}: ₹{perPaymentAmount().toFixed(2)}
            </p>
          </>
        )}

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
