import React, { useState } from "react";
import { Trash2, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { calculateTermEndDate, effectiveStatus } from "../utils/loanTerm";

function RestartLoanDialog({ loan, onConfirm, onCancel, mutating }) {
  const shortfall = Number(loan.remainingAmount.toFixed(2));
  const newDisbursedAmount = Math.max(loan.originalPrincipal - shortfall, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-restart-title"
    >
      <div className="card w-full max-w-sm p-5 animate-fade-in">
        <h3 id="confirm-restart-title" className="font-semibold text-ink-900">
          Restart {loan.borrowerName}'s loan?
        </h3>
        <p className="mt-1.5 text-sm text-ink-500">
          The loan term is over with an unpaid balance of{" "}
          <span className="tabular font-semibold text-ink-700">₹{shortfall.toFixed(2)}</span>. A
          new cycle will start: that balance is deducted up front, so{" "}
          {loan.borrowerName} actually receives{" "}
          <span className="tabular font-semibold text-ink-700">
            ₹{newDisbursedAmount.toFixed(2)}
          </span>{" "}
          in hand, while owing a fresh{" "}
          <span className="tabular font-semibold text-ink-700">
            ₹{loan.totalRepayment.toFixed(2)}
          </span>{" "}
          total.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={mutating} className="btn-primary">
            Restart loan
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteDialog({ borrowerName, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="card w-full max-w-sm p-5 animate-fade-in">
        <h3 id="confirm-delete-title" className="font-semibold text-ink-900">
          Delete this loan?
        </h3>
        <p className="mt-1.5 text-sm text-ink-500">
          This permanently removes {borrowerName}'s loan and its full payment history. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn bg-rust-500 text-white hover:bg-rust-600"
          >
            Delete loan
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoanStatus({ loan, onMakePayment, onRestartLoan, onDelete, mutating }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  const status = effectiveStatus(loan);
  const isRepaid = status === "repaid";
  const isRestarted = status === "restarted";
  const progress = Math.min(100, Math.max(0, 100 - (loan.remainingAmount / loan.totalRepayment) * 100));
  const startDate = new Date(loan.startDate);
  const nextDate = new Date(loan.nextRepaymentDate);
  const termEndDate = calculateTermEndDate(loan);
  const canRestart = status === "active" && new Date() >= termEndDate;
  const showDisbursed =
    loan.disbursedAmount != null && Number(loan.disbursedAmount) !== Number(loan.amount);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a valid payment amount greater than ₹0.");
      return;
    }
    setPaymentError("");
    const ok = await onMakePayment(loan._id, amount);
    if (ok) setPaymentAmount("");
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between border-b border-ink-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-ink-900">
            {loan.borrowerName}
            {loan.cycle > 1 && (
              <span className="ml-1.5 align-middle text-xs font-medium text-ink-400">
                · Cycle {loan.cycle}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            Started {startDate.toLocaleDateString()} · {loan.frequency === "weekly" ? "Weekly" : "Monthly"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isRestarted ? (
            <span className="badge bg-amber-400/15 text-amber-600">
              <RefreshCw size={13} /> Restarted
            </span>
          ) : isRepaid ? (
            <span className="badge bg-moss-100 text-moss-600">
              <CheckCircle2 size={13} /> Repaid
            </span>
          ) : (
            <span className="badge bg-ink-100 text-ink-500">
              <Clock size={13} /> Active
            </span>
          )}
          {canRestart && (
            <button
              onClick={() => setConfirmingRestart(true)}
              aria-label={`Restart ${loan.borrowerName}'s loan`}
              className="btn-ghost !min-h-0 !p-2"
              title="Loan term is over — restart with the unpaid balance rolled forward"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <button
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Delete ${loan.borrowerName}'s loan`}
            className="btn-danger !min-h-0 !p-2"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-3 px-5 pt-4 text-sm ${
          showDisbursed ? "sm:grid-cols-5" : "sm:grid-cols-4"
        }`}
      >
        <div>
          <p className="text-xs text-ink-400">Principal</p>
          <p className="tabular font-semibold text-ink-900">₹{loan.amount.toFixed(2)}</p>
        </div>
        {showDisbursed && (
          <div>
            <p className="text-xs text-ink-400">Cash given</p>
            <p className="tabular font-semibold text-ink-900">₹{loan.disbursedAmount.toFixed(2)}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-ink-400">Total due</p>
          <p className="tabular font-semibold text-ink-900">₹{loan.totalRepayment.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Remaining</p>
          <p className="tabular font-semibold text-ink-900">₹{loan.remainingAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">Interest</p>
          <p className="tabular font-semibold text-ink-900">{loan.interestRate}%</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isRestarted ? "bg-amber-400" : "bg-moss-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-ink-400">
          <span>{progress.toFixed(1)}% repaid</span>
          {status === "active" && <span>Next: {nextDate.toLocaleDateString()}</span>}
        </div>
      </div>

      {isRestarted && (
        <div className="mx-5 mt-4 rounded-md bg-amber-400/10 px-3.5 py-2.5 text-sm text-amber-600">
          Loan term ended with ₹{loan.remainingAmount.toFixed(2)} unpaid — rolled forward into a
          new cycle.
        </div>
      )}

      {isRepaid && loan.interestEarnedPercentage != null && (
        <div className="mx-5 mt-4 rounded-md bg-moss-100/60 px-3.5 py-2.5 text-sm text-moss-600">
          Fully repaid — effective interest earned:{" "}
          <span className="font-semibold">{loan.interestEarnedPercentage}%</span>
        </div>
      )}

      {loan.missedPayments > 0 && status === "active" && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-md bg-amber-400/10 px-3.5 py-2.5 text-sm text-amber-600">
          <AlertCircle size={15} className="shrink-0" />
          {loan.missedPayments} missed payment{loan.missedPayments > 1 ? "s" : ""}
        </div>
      )}

      {canRestart && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-md bg-ink-100/70 px-3.5 py-2.5 text-sm text-ink-600">
          <RefreshCw size={15} className="shrink-0" />
          Loan term ended on {termEndDate.toLocaleDateString()} — you can restart it.
        </div>
      )}

      <div className="px-5 pt-4">
        <p className="field-label">Payment history</p>
        {loan.payments.length === 0 ? (
          <p className="text-sm text-ink-400">No payments recorded yet.</p>
        ) : (
          <ul className="max-h-32 space-y-1 overflow-y-auto text-sm">
            {[...loan.payments].reverse().map((payment) => (
              <li key={payment._id} className="flex justify-between text-ink-600">
                <span>{new Date(payment.date).toLocaleDateString()}</span>
                <span className="tabular font-medium">₹{payment.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === "active" && (
        <form onSubmit={handlePaymentSubmit} noValidate className="flex gap-2 px-5 py-4">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Payment amount"
            className="field-input tabular flex-1"
            aria-label="Payment amount"
          />
          <button type="submit" disabled={mutating} className="btn-primary shrink-0">
            Record
          </button>
        </form>
      )}
      {paymentError && <p className="field-error px-5 pb-4">{paymentError}</p>}
      {status !== "active" && <div className="pb-5" />}

      {confirmingDelete && (
        <ConfirmDeleteDialog
          borrowerName={loan.borrowerName}
          onConfirm={() => {
            setConfirmingDelete(false);
            onDelete(loan._id);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {confirmingRestart && (
        <RestartLoanDialog
          loan={loan}
          mutating={mutating}
          onConfirm={async () => {
            const ok = await onRestartLoan(loan._id);
            if (ok) setConfirmingRestart(false);
          }}
          onCancel={() => setConfirmingRestart(false)}
        />
      )}
    </div>
  );
}
