// Create deposit route

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createDeposit,
  getAllDeposits,
  getDepositById,
  updateDeposit,
  deleteDeposit,
} = require("../controllers/depositController");

router.post("/createDeposit", createDeposit);
router.get("/getAllDeposits", protect, getAllDeposits);
router.get("/getDepositById/:id", protect, getDepositById);
router.put("/updateDeposit/:id", protect, updateDeposit);
router.delete("/deleteDeposit/:id", protect, deleteDeposit);

module.exports = router;
