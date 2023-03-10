// Create loan route

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} = require("../controllers/loanController");

router.post("/createLoan", createLoan);
router.get("/getAllLoans", protect, getAllLoans);
router.get("/getLoanById/:id", protect, getLoanById);
router.put("/updateLoan/:id", protect, updateLoan);
router.delete("/deleteLoan/:id", protect, deleteLoan);

module.exports = router;
