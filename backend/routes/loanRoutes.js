const express = require("express");
const {
  getLoans,
  getLoan,
  createLoan,
  makePayment,
  restartLoan,
  getProfitSummary,
  deleteLoan,
} = require("../controllers/loanController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// Must be registered before "/:id" so "profit" isn't treated as an id.
router.get("/profit", getProfitSummary);

router.route("/").get(getLoans).post(createLoan);
router.route("/:id").get(getLoan).delete(deleteLoan);
router.post("/:id/payments", makePayment);
router.post("/:id/restart", restartLoan);

module.exports = router;
