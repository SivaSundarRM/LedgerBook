const WEEKLY_DURATION_WEEKS = 26; // 6 months
const MONTHLY_DURATION_MONTHS = 12;

// Weekly loan: 36% total interest for 6 months
const WEEKLY_INTEREST_RATE = 0.36;

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function periodLengthMs(frequency) {
  const days = frequency === "monthly" ? 30 : 7;
  return days * 24 * 60 * 60 * 1000;
}

function calculateNextRepaymentDate(fromDate, frequency) {
  const days = frequency === "monthly" ? 30 : 7;
  return addDays(fromDate, days);
}

function isSamePeriod(dateA, dateB, frequency) {
  return (
    Math.abs(new Date(dateA) - new Date(dateB)) <
    periodLengthMs(frequency)
  );
}

/**
 * The date the loan's full term is scheduled to end (26 weeks for weekly
 * loans, 12 months for monthly loans) — i.e. when a loan becomes eligible
 * to be restarted if it still isn't fully repaid.
 */
function calculateTermEndDate(loan) {
  const durationDays =
    loan.frequency === "monthly"
      ? MONTHLY_DURATION_MONTHS * 30
      : WEEKLY_DURATION_WEEKS * 7;
  return addDays(loan.startDate, durationDays);
}

function calculateLoanTerms({ amount, interestRate, frequency }) {
  let totalRepayment;
  let totalInterest;
  let perPayment;

  if (frequency === "weekly") {
    totalInterest = amount * WEEKLY_INTEREST_RATE;
    totalRepayment = amount + totalInterest;
    perPayment = totalRepayment / WEEKLY_DURATION_WEEKS;
  } else {
    totalInterest = amount * (interestRate / 100) * MONTHLY_DURATION_MONTHS;
    totalRepayment = amount + totalInterest;
    perPayment = totalRepayment / MONTHLY_DURATION_MONTHS;
  }

  return {
    totalInterest: Number(totalInterest.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
    perPayment: Number(perPayment.toFixed(2)),
  };
}

/**
 * Calculates effective interest earned.
 */
function calculateInterestEarnedPercentage({
  loan,
  totalPaid,
  finalRepaymentDate,
}) {
  const interestEarned = totalPaid - loan.originalPrincipal;

  // Weekly loans always have fixed 36% interest
  if (loan.frequency === "weekly") {
    return 36;
  }

  // Monthly loans
  const start = new Date(loan.startDate);
  const end = new Date(finalRepaymentDate);

  const daysTaken = Math.max(
    (end - start) / (1000 * 60 * 60 * 24),
    1
  );

  const monthsTaken = daysTaken / 30;

  const monthlyRate =
    ((interestEarned / loan.originalPrincipal) / monthsTaken) * 100;

  return Number(monthlyRate.toFixed(2));
}

module.exports = {
  addDays,
  periodLengthMs,
  calculateNextRepaymentDate,
  isSamePeriod,
  calculateLoanTerms,
  calculateInterestEarnedPercentage,
  calculateTermEndDate,
  WEEKLY_DURATION_WEEKS,
  MONTHLY_DURATION_MONTHS,
};