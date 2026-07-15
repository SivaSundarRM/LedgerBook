import React, { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";

const WEEKLY_DURATION_WEEKS = 26;
const MONTHLY_DURATION_MONTHS = 12;

const WEEKLY_INTEREST_RATE = 0.36;

function estimateTotals(amount, interestRate, frequency) {
  const principal = parseFloat(amount);
  const rate = parseFloat(interestRate);

  if (!Number.isFinite(principal) || principal <= 0) {
    return null;
  }

  let total;
  let perPayment;

  if (frequency === "weekly") {
    const totalInterest = principal * WEEKLY_INTEREST_RATE;
    total = principal + totalInterest;
    perPayment = total / WEEKLY_DURATION_WEEKS;
  } else {
    if (!Number.isFinite(rate) || rate < 0) {
      return null;
    }

    const totalInterest =
      principal * (rate / 100) * MONTHLY_DURATION_MONTHS;

    total = principal + totalInterest;
    perPayment = total / MONTHLY_DURATION_MONTHS;
  }

  return {
    total,
    perPayment,
  };
}

export function LoanCalculator({ onCreateLoan, mutating }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [fieldErrors, setFieldErrors] = useState({});

  const estimate = useMemo(
    () => estimateTotals(amount, interestRate, frequency),
    [amount, interestRate, frequency]
  );

  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = "Borrower name is required.";
    }

    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      errs.amount = "Enter an amount greater than 0.";
    }

    if (frequency === "monthly") {
      const numInterest = parseFloat(interestRate);

      if (!Number.isFinite(numInterest) || numInterest < 0) {
        errs.interestRate = "Enter a valid interest rate.";
      }
    }

    setFieldErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const ok = await onCreateLoan(
      name.trim(),
      parseFloat(amount),
      startDate || undefined,
      frequency === "weekly" ? 36 : parseFloat(interestRate),
      frequency
    );

    if (ok) {
      setName("");
      setAmount("");
      setStartDate("");
      setInterestRate("");
      setFrequency("weekly");
      setFieldErrors({});
    }
  };

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <PlusCircle size={18} className="text-moss-500" />
        <h2 className="text-base font-semibold text-ink-900">
          New Loan
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        <div>
          <label htmlFor="name" className="field-label">
            Borrower Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Siva"
            className="field-input"
            aria-invalid={!!fieldErrors.name}
          />

          {fieldErrors.name && (
            <p className="field-error">{fieldErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label htmlFor="amount" className="field-label">
              Amount (₹)
            </label>

            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="field-input tabular"
              aria-invalid={!!fieldErrors.amount}
            />

            {fieldErrors.amount && (
              <p className="field-error">{fieldErrors.amount}</p>
            )}
          </div>

          {frequency === "monthly" && (
            <div>
              <label htmlFor="interestRate" className="field-label">
                Monthly Interest (%)
              </label>

              <input
                id="interestRate"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="3"
                className="field-input tabular"
                aria-invalid={!!fieldErrors.interestRate}
              />

              {fieldErrors.interestRate && (
                <p className="field-error">
                  {fieldErrors.interestRate}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="frequency" className="field-label">
            Repayment Frequency
          </label>

          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="field-input"
          >
            <option value="weekly">
              Weekly • 26 Payments (6 Months)
            </option>

            <option value="monthly">
              Monthly • 12 Payments
            </option>
          </select>

          <p className="field-hint">
            {frequency === "weekly"
              ? "Fixed 36% interest for 6 months. Example: ₹10,000 → ₹13,600."
              : "Interest is calculated using the monthly interest rate entered."}
          </p>
        </div>

        <div>
          <label htmlFor="startDate" className="field-label">
            Start Date{" "}
            <span className="font-normal normal-case text-ink-300">
              (optional)
            </span>
          </label>

          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="field-input"
          />

          <p className="field-hint">
            Defaults to today if left blank.
          </p>
        </div>

        {estimate && (
          <div className="rounded-md border border-moss-200 bg-moss-100/60 px-4 py-3">

            <div className="flex justify-between">
              <span>Total Repayment</span>

              <span className="font-semibold">
                ₹{estimate.total.toFixed(2)}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span>
                Per {frequency === "weekly" ? "Week" : "Month"}
              </span>

              <span className="font-semibold">
                ₹{estimate.perPayment.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={mutating}
          className="btn-primary w-full"
        >
          {mutating ? "Creating..." : "Create Loan"}
        </button>

      </form>
    </div>
  );
}