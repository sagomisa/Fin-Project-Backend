// Create deposit route

const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createDeposit,
  getAllDeposits,
  getDepositById,
  updateDeposit,
  deleteDeposit,
  updateDepositStatus
} = require("../controllers/depositController");

router.post("/createDeposit", createDeposit);
router.get("/getAllDeposits", protect, getAllDeposits);
router.get("/getDepositById/:id", protect, getDepositById);
router.put("/updateDeposit/:id", protect, updateDeposit);
router.patch("/upgradeDepositStatus", protect, adminOnly, updateDepositStatus);
router.delete("/deleteDeposit/:id", protect, deleteDeposit);

module.exports = router;
