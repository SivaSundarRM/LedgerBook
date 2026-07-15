const WEEKLY_DURATION_WEEKS = 26; // 6 months
const MONTHLY_DURATION_MONTHS = 12; // 1 year

export function calculateTermEndDate(loan) {
  const durationDays =
    loan.frequency === "monthly" ? MONTHLY_DURATION_MONTHS * 30 : WEEKLY_DURATION_WEEKS * 7;
  const result = new Date(loan.startDate);
  result.setDate(result.getDate() + durationDays);
  return result;
}

export function isTermExpired(loan) {
  return new Date() >= calculateTermEndDate(loan);
}

export function effectiveStatus(loan) {
  if (loan.status === "restarted") return "restarted";
  return loan.remainingAmount <= 0 ? "repaid" : "active";
}
