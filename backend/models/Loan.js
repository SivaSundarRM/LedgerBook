const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: Date.now },
  },
  { _id: true }
);

const loanSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    borrowerName: {
      type: String,
      required: [true, "Borrower name is required"],
      trim: true,
      maxlength: 120,
    },
    amount: { type: Number, required: true, min: 0.01 },
    originalPrincipal: { type: Number, required: true, min: 0.01 },
    interestRate: { type: Number, required: true, min: 0, default: 0 },
    frequency: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
      default: "weekly",
    },
    totalRepayment: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    // Actual cash handed to the borrower for this cycle. Usually equals
    // `amount`, but differs when a loan is restarted: the unpaid balance
    // from the previous cycle is deducted from the fresh disbursal.
    disbursedAmount: {
      type: Number,
      required: true,
      min: 0,
      default: function () {
        return this.amount;
      },
    },
    // Links a restarted loan cycle back to the cycle it replaced.
    parentLoan: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", default: null },
    // 1 = original loan, 2 = first restart, 3 = second restart, etc.
    cycle: { type: Number, default: 1, min: 1 },
    // "restarted" is set explicitly when a new cycle is spun up from this
    // loan. "active" / "repaid" are otherwise derived from remainingAmount,
    // but the stored value keeps direct DB queries simple.
    status: {
      type: String,
      enum: ["active", "repaid", "restarted"],
      default: "active",
    },
    startDate: { type: Date, required: true },
    nextRepaymentDate: { type: Date, required: true },
    finalRepaymentDate: { type: Date, default: null },
    interestEarnedPercentage: { type: Number, default: null },
    missedPayments: { type: Number, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

loanSchema.index({ owner: 1, borrowerName: "text" });

module.exports = mongoose.model("Loan", loanSchema);
