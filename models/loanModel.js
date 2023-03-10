const mongoose = require("mongoose");

const loanSchema = mongoose.Schema(
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
      default: "pending",
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
