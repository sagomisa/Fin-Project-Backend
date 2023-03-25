const mongoose = require("mongoose");

const constantSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Constant = mongoose.model("Constant", constantSchema);
module.exports = Constant;
