require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Loan = require("../models/Loan");
const { calculateNextRepaymentDate, calculateLoanTerms } = require("./loanMath");

const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "demo1234";

async function seed() {
  await connectDB();

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({ name: "Demo User", email: DEMO_EMAIL, password: DEMO_PASSWORD });
    console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log("Demo user already exists, skipping user creation.");
  }

  const existingLoans = await Loan.countDocuments({ owner: user._id });
  if (existingLoans === 0) {
    const sample = [
      { borrowerName: "Asha Rao", amount: 5000, interestRate: 3, frequency: "weekly" },
      { borrowerName: "Vikram Shah", amount: 20000, interestRate: 2, frequency: "monthly" },
    ];

    for (const s of sample) {
      const startDate = new Date();
      const { totalRepayment } = calculateLoanTerms(s);
      await Loan.create({
        owner: user._id,
        borrowerName: s.borrowerName,
        amount: s.amount,
        originalPrincipal: s.amount,
        interestRate: s.interestRate,
        frequency: s.frequency,
        totalRepayment,
        remainingAmount: totalRepayment,
        startDate,
        nextRepaymentDate: calculateNextRepaymentDate(startDate, s.frequency),
      });
    }
    console.log("Seeded sample loans.");
  } else {
    console.log("Demo user already has loans, skipping loan seeding.");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
