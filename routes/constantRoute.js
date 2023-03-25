const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getConstants,
  getConstantByKey,
  updateConstantValue,
} = require("../controllers/constantController");

router.get("/getConstants", protect, getConstants);
router.get("/getConstantByKey/:key", protect, getConstantByKey);
router.put("/updateConstantValue", protect, updateConstantValue);

module.exports = router;
