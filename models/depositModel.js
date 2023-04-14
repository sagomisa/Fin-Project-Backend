const mongoose = require("mongoose");

const depositSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unpaid",
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const Deposit = mongoose.model("Deposit", depositSchema);

module.exports = Deposit;
