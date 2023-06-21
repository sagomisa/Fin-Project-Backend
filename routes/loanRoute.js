// Create loan route

const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  updateLoanStatus,
  getUserLoan,
  cancelLoan
} = require("../controllers/loanController");

router.post("/createLoan", createLoan);
router.get("/getAllLoans", protect, getAllLoans);
router.get("/getLoanById/:id", protect, getLoanById);
router.put("/updateLoan/:id", protect, updateLoan);
router.delete("/deleteLoan/:id", protect, adminOnly, deleteLoan);
router.patch("/changeLoanStatus", protect, adminOnly, updateLoanStatus);
router.get("/getUserLoan", protect, getUserLoan);
router.patch("/cancelLoan/:id", protect, cancelLoan);


module.exports = router;
