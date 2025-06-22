import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const LoanStatus = ({ loan, onMakePayment, onDelete, error }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Calculate the date when repayments can start
  const loanStartDate = new Date(loan.startDate);
  const repaymentStartDate = new Date(loanStartDate);
  repaymentStartDate.setDate(loanStartDate.getDate() + 7);

  const handleDelete = () => {
    console.log('🗑️ Deleting loan ID:', loan.id);
    if (onDelete) {
      onDelete(loan.id);
    } else {
      console.error('❌ ERROR: onDelete is undefined');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    const currentDate = new Date();

    // Check if the current date is before the repayment start date
    if (currentDate < repaymentStartDate) {
      setPaymentError(`Payments can only be made starting from ${repaymentStartDate.toLocaleDateString()}.`);
      return;
    }

    if (!isNaN(amount) && amount >= 0) { // Allow 0 payments
      onMakePayment(loan.id, amount);
      setPaymentAmount('');
      setPaymentError(''); // Clear any previous errors
    } else {
      setPaymentError('Please enter a valid payment amount.');
    }
  };

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
      </div>

      {/* Payment History */}
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

      {/* Payment Form */}
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

      {/* Display payment error if any */}
      {paymentError && <p className="error-message">{paymentError}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LoanStatus;
