import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const LoanStatus = ({ loan, onMakePayment, onDelete, error }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const loanStartDate = new Date(loan.startDate);
  const repaymentStartDate = new Date(loanStartDate);
  repaymentStartDate.setDate(loanStartDate.getDate() + 7);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      onDelete(loan.id);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    const currentDate = new Date();

    if (currentDate < repaymentStartDate) {
      setPaymentError(`Payments can only be made starting from ${repaymentStartDate.toLocaleDateString()}.`);
      return;
    }

    if (!isNaN(amount) && amount > 0) {
      onMakePayment(loan.id, amount);
      setPaymentAmount('');
      setPaymentError('');
    } else {
      setPaymentError('Please enter a valid payment amount greater than ₹0.');
    }
  };

  const isRepaid = loan.remainingAmount <= 0;
  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  const progress = 100 - (loan.remainingAmount / loan.totalRepayment) * 100;

  let actualInterestEarned = null;

  if (isRepaid && loan.payments.length > 0) {
    const principal = loan.amount;
    const totalInterest = totalPaid - principal;

    const start = new Date(loan.startDate);
    const end = new Date(loan.finalRepaymentDate || loan.payments[loan.payments.length - 1].date);
    const daysTaken = (end - start) / (1000 * 60 * 60 * 24);
    const monthsTaken = daysTaken / 30;

    if (loan.frequency === 'weekly') {
      const annualInterestRate = (totalInterest / principal) * (365 / daysTaken) * 100;
      actualInterestEarned = `${annualInterestRate.toFixed(2)}% annualized over ${Math.round(daysTaken)} days`;
    } else {
      const monthlyEffectiveRate = (totalInterest / principal) / monthsTaken * 100;
      actualInterestEarned = `${monthlyEffectiveRate.toFixed(2)}% monthly average over ${Math.round(monthsTaken)} months`;
    }
  }

  return (
    <div className="loan-card">
      <div className="loan-header">
        <h2>{loan.borrower.name}</h2>
        <p>Started: {loanStartDate.toLocaleDateString()}</p>
        <p>Next Payment: {new Date(loan.nextRepaymentDate).toLocaleDateString()}</p>
        <button onClick={handleDelete} className="delete-btn">
          <Trash2 />
        </button>
      </div>

      <div className="loan-details">
        <p>Initial Amount: ₹{loan.amount.toFixed(2)}</p>
        <p>Total Repayment: ₹{loan.totalRepayment.toFixed(2)}</p>
        <p>Remaining: ₹{loan.remainingAmount.toFixed(2)}</p>
        <p>Interest Rate: {loan.interestRate}%</p>
        <p>Repayment Frequency: {loan.frequency === 'weekly' ? 'Weekly' : 'Monthly'}</p>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-label">{progress.toFixed(1)}% Repaid</p>
        </div>

        {isRepaid && actualInterestEarned && (
          <p className="success-message">
            ✅ Fully repaid. Effective interest earned: <strong>{actualInterestEarned}</strong>
          </p>
        )}
      </div>

      <div className="payment-history">
        <h3>Payment History</h3>
        {loan.payments.length === 0 ? (
          <p>No payments made yet.</p>
        ) : (
          <ul>
            {loan.payments.map((payment, index) => (
              <li key={index}>
                {new Date(payment.date).toLocaleDateString()} - ₹{payment.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isRepaid && (
        <form onSubmit={handlePaymentSubmit} className="payment-form">
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter payment amount"
            min="0"
            required
          />
          <button type="submit">Make Payment</button>
        </form>
      )}

      {paymentError && <p className="error-message">{paymentError}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LoanStatus;
