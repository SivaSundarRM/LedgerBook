const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Loan = require("../models/Loan");
const {
  calculateNextRepaymentDate,
  isSamePeriod,
  calculateLoanTerms,
  calculateInterestEarnedPercentage,
  calculateTermEndDate,
} = require("../utils/loanMath");

// A loan's status isn't always trustworthy for older records (the field was
// added after some loans already existed), so derive it from the numbers
// whenever possible. "restarted" is the one state that can't be derived and
// is trusted as stored.
function effectiveStatus(loan) {
  if (loan.status === "restarted") return "restarted";
  return loan.remainingAmount <= 0 ? "repaid" : "active";
}

// @route GET /api/loans?search=&page=&limit=
const getLoans = asyncHandler(async (req, res) => {
  const search = (req.query.search || "").trim();
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);

  const filter = { owner: req.user._id };
  if (search) {
    filter.borrowerName = { $regex: search, $options: "i" };
  }

  const [loans, total] = await Promise.all([
    Loan.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Loan.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: loans,
    meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  });
});

// @route GET /api/loans/:id
const getLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({ _id: req.params.id, owner: req.user._id });
  if (!loan) throw new ApiError(404, "Loan not found.");
  res.json({ success: true, data: loan });
});

const createLoan = asyncHandler(async (req, res) => {
  const { borrowerName, amount, startDate, interestRate = 0, frequency = "weekly" } = req.body;

  if (!borrowerName?.trim()) {
    throw new ApiError(400, "Borrower name is required.");
  }

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    throw new ApiError(400, "Loan amount must be greater than 0.");
  }

  const numInterest = Number(interestRate);
  if (!Number.isFinite(numInterest) || numInterest < 0) {
    throw new ApiError(400, "Interest rate must be a non-negative number.");
  }

  if (!["weekly", "monthly"].includes(frequency)) {
    throw new ApiError(400, "Frequency must be either 'weekly' or 'monthly'.");
  }

  const loanStartDate = startDate ? new Date(startDate) : new Date();
  if (Number.isNaN(loanStartDate.getTime())) {
    throw new ApiError(400, "Start date is invalid.");
  }

  const nextRepaymentDate = calculateNextRepaymentDate(loanStartDate, frequency);
  const { totalRepayment } = calculateLoanTerms({
    amount: numAmount,
    interestRate: numInterest,
    frequency,
  });

  const loan = await Loan.create({
    owner: req.user._id,
    borrowerName: borrowerName.trim(),
    amount: numAmount,
    originalPrincipal: numAmount,
    interestRate: numInterest,
    frequency,
    totalRepayment,
    remainingAmount: totalRepayment,
    disbursedAmount: numAmount,
    cycle: 1,
    status: "active",
    startDate: loanStartDate,
    nextRepaymentDate,
    payments: [],
  });

  res.status(201).json({ success: true, data: loan });
});

// @route POST /api/loans/:id/payments
const makePayment = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({ _id: req.params.id, owner: req.user._id });
  if (!loan) throw new ApiError(404, "Loan not found.");

  const paymentAmount = Number(req.body.amount);
  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    throw new ApiError(400, "Enter a valid payment amount greater than 0.");
  }

  if (loan.remainingAmount <= 0) {
    throw new ApiError(400, "This loan is already fully repaid.");
  }

  if (paymentAmount > loan.remainingAmount) {
    throw new ApiError(400, "Payment amount exceeds the remaining balance.");
  }

  const currentDate = new Date();
  const repaymentStart = calculateNextRepaymentDate(loan.startDate, loan.frequency);
  if (currentDate < repaymentStart) {
    throw new ApiError(
      400,
      `Repayments start from ${repaymentStart.toLocaleDateString()}, not before.`
    );
  }

  const lastPayment = loan.payments.length > 0 ? loan.payments[loan.payments.length - 1].date : null;
  if (lastPayment && isSamePeriod(currentDate, lastPayment, loan.frequency)) {
    throw new ApiError(400, `Only one payment per ${loan.frequency.slice(0, -2)} period is allowed.`);
  }

  if (loan.nextRepaymentDate < currentDate) {
    const periodMs = (loan.frequency === "monthly" ? 30 : 7) * 24 * 60 * 60 * 1000;
    const missedPeriods = Math.floor((currentDate - loan.nextRepaymentDate) / periodMs);
    loan.missedPayments += Math.max(missedPeriods, 0);
  }

  loan.payments.push({ amount: paymentAmount, date: currentDate });
  loan.remainingAmount = Math.max(loan.remainingAmount - paymentAmount, 0);
  loan.nextRepaymentDate = calculateNextRepaymentDate(currentDate, loan.frequency);

  if (loan.remainingAmount <= 0 && !loan.finalRepaymentDate) {
    loan.finalRepaymentDate = currentDate;
    loan.status = "repaid";
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    loan.interestEarnedPercentage = calculateInterestEarnedPercentage({
      loan,
      totalPaid,
      finalRepaymentDate: currentDate,
    });
  }

  await loan.save();
  res.json({ success: true, data: loan });
});

// @route POST /api/loans/:id/restart
// When a borrower crosses the full loan term without repaying in full, the
// lender can "restart" the loan: the unpaid balance is deducted from the
// next disbursal, but the borrower's repayment target resets to a fresh
// full term at the original loan amount.
const restartLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({ _id: req.params.id, owner: req.user._id });
  if (!loan) throw new ApiError(404, "Loan not found.");

  if (effectiveStatus(loan) !== "active") {
    throw new ApiError(400, "Only an active, unpaid loan can be restarted.");
  }

  const termEndDate = calculateTermEndDate(loan);
  const now = new Date();
  if (now < termEndDate) {
    throw new ApiError(
      400,
      `This loan's term runs until ${termEndDate.toLocaleDateString()}. It can only be restarted after that date.`
    );
  }

  const shortfall = Number(loan.remainingAmount.toFixed(2));
  const newDisbursedAmount = Number(
    Math.max(loan.originalPrincipal - shortfall, 0).toFixed(2)
  );

  const { totalRepayment } = calculateLoanTerms({
    amount: loan.originalPrincipal,
    interestRate: loan.interestRate,
    frequency: loan.frequency,
  });

  loan.status = "restarted";
  await loan.save();

  const nextRepaymentDate = calculateNextRepaymentDate(now, loan.frequency);

  const newLoan = await Loan.create({
    owner: req.user._id,
    borrowerName: loan.borrowerName,
    amount: loan.originalPrincipal,
    originalPrincipal: loan.originalPrincipal,
    interestRate: loan.interestRate,
    frequency: loan.frequency,
    totalRepayment,
    remainingAmount: totalRepayment,
    disbursedAmount: newDisbursedAmount,
    parentLoan: loan._id,
    cycle: (loan.cycle || 1) + 1,
    status: "active",
    startDate: now,
    nextRepaymentDate,
    payments: [],
  });

  res.status(201).json({
    success: true,
    data: {
      closedLoan: loan,
      newLoan,
      shortfall,
      newDisbursedAmount,
    },
  });
});

// @route GET /api/loans/profit
// Profit per borrower, aggregated across every loan cycle (including any
// restarts). "Realized" profit only counts cash actually collected so far;
// "projected" profit assumes every currently-outstanding balance eventually
// gets paid in full.
const getProfitSummary = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ owner: req.user._id }).sort({
    borrowerName: 1,
    cycle: 1,
  });

  const byBorrower = new Map();

  for (const loan of loans) {
    const key = loan.borrowerName;
    if (!byBorrower.has(key)) {
      byBorrower.set(key, {
        borrowerName: key,
        totalDisbursed: 0,
        totalCollected: 0,
        outstanding: 0,
        cycles: 0,
        restarts: 0,
        activeLoanCount: 0,
        repaidLoanCount: 0,
      });
    }

    const agg = byBorrower.get(key);
    const collectedForLoan = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    const status = effectiveStatus(loan);

    agg.totalDisbursed += loan.disbursedAmount ?? loan.amount;
    agg.totalCollected += collectedForLoan;
    agg.cycles += 1;

    if (status === "restarted") {
      agg.restarts += 1;
    } else {
      agg.outstanding += Math.max(loan.remainingAmount, 0);
      if (status === "active") agg.activeLoanCount += 1;
      if (status === "repaid") agg.repaidLoanCount += 1;
    }
  }

  const round2 = (n) => Number(n.toFixed(2));

  const byBorrowerSummary = Array.from(byBorrower.values())
    .map((agg) => {
      const realizedProfit = agg.totalCollected - agg.totalDisbursed;
      const projectedProfit = agg.totalCollected + agg.outstanding - agg.totalDisbursed;
      const realizedProfitPercent =
        agg.totalDisbursed > 0 ? (realizedProfit / agg.totalDisbursed) * 100 : 0;
      const projectedProfitPercent =
        agg.totalDisbursed > 0 ? (projectedProfit / agg.totalDisbursed) * 100 : 0;

      return {
        borrowerName: agg.borrowerName,
        totalDisbursed: round2(agg.totalDisbursed),
        totalCollected: round2(agg.totalCollected),
        outstanding: round2(agg.outstanding),
        realizedProfit: round2(realizedProfit),
        projectedProfit: round2(projectedProfit),
        realizedProfitPercent: round2(realizedProfitPercent),
        projectedProfitPercent: round2(projectedProfitPercent),
        cycles: agg.cycles,
        restarts: agg.restarts,
        activeLoanCount: agg.activeLoanCount,
        repaidLoanCount: agg.repaidLoanCount,
      };
    })
    .sort((a, b) => b.projectedProfit - a.projectedProfit);

  const totalsRaw = byBorrowerSummary.reduce(
    (acc, s) => ({
      totalDisbursed: acc.totalDisbursed + s.totalDisbursed,
      totalCollected: acc.totalCollected + s.totalCollected,
      outstanding: acc.outstanding + s.outstanding,
      realizedProfit: acc.realizedProfit + s.realizedProfit,
      projectedProfit: acc.projectedProfit + s.projectedProfit,
    }),
    { totalDisbursed: 0, totalCollected: 0, outstanding: 0, realizedProfit: 0, projectedProfit: 0 }
  );

  const totals = {
    ...Object.fromEntries(Object.entries(totalsRaw).map(([k, v]) => [k, round2(v)])),
    borrowerCount: byBorrowerSummary.length,
    realizedProfitPercent:
      totalsRaw.totalDisbursed > 0
        ? round2((totalsRaw.realizedProfit / totalsRaw.totalDisbursed) * 100)
        : 0,
    projectedProfitPercent:
      totalsRaw.totalDisbursed > 0
        ? round2((totalsRaw.projectedProfit / totalsRaw.totalDisbursed) * 100)
        : 0,
  };

  res.json({ success: true, data: { byBorrower: byBorrowerSummary, totals } });
});

const deleteLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!loan) throw new ApiError(404, "Loan not found.");
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = {
  getLoans,
  getLoan,
  createLoan,
  makePayment,
  restartLoan,
  getProfitSummary,
  deleteLoan,
};
