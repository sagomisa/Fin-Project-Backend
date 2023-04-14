const User = require("../models/userModel");
const Deposit = require("../models/loanModel");
const sendEmail = require("../utils/sendEmail");

const createDeposit = async (req, res) => {
  try {
    const { id, amount, status } = req.body;
    const user = await User.findById(id);

    const deposit = new Deposit({
      user,
      amount,
      status,
    });

    // Send email to user.
    const subject = "Request for Deposit - FIN Investments Inc.";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "";
    const template = "deposit";
    const name = user.name;

    await sendEmail(subject, send_to, sent_from, reply_to, template, name);

    const newDeposit = await deposit.save();

    res.status(201).json(newDeposit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Retrieve and return all deposits from the database.
const getAllDeposits = async (req, res) => {
  try {
    const deposit = await Deposit.find({});
    res.status(200).json(deposit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Find a single deposit with a depositId
const getDepositById = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await Deposit.findById(id);
    res.status(200).json(deposit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a deposit identified by the depositId in the request
const updateDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status } = req.body;
    const deposit = await Deposit.findById(id);
    if (amount) {
      deposit.amount = amount;
    }
    if (status) {
      deposit.status = status;
    }
    const updatedDeposit = await deposit.save();
    res.status(200).json(updatedDeposit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a deposit with the specified depositId in the request
const deleteDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    await Deposit.findByIdAndDelete(id);
    res.status(200).json({ message: "Deposit deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createDeposit,
  getAllDeposits,
  getDepositById,
  updateDeposit,
  deleteDeposit,
};
