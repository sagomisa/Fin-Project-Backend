const User = require("../models/userModel");
const Deposit = require("../models/depositModel");
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
    const deposit = await Deposit.find({}).populate('user', 'name email _id');
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

const sendStatusEmail = async (deposit, user) => {
  const subject = `Deposit completed for the month of ${deposit.deposit_for} - Fin Investments Inc.`;
  const send_to = deposit_user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@fininvestmentsinc.com";
  const template = "depositCompleted";
  const userName = deposit_user.name;
  var msg = `The deposit for the month of ${deposit.deposit_for} has been completed. Thank You`;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      userName,
      '',
      msg
    );
    return true;
  } catch (error) {
    return false;
  }
};

const updateDepositStatus = async (req, res) => {
  const { id, status } = req.body;

// Validate the provided status value
const validStatuses = ["paid", "unpaid"];
if (!validStatuses.includes(status)) {
  return res.status(400).json({ message: 'Invalid status value' });
}

Deposit.findById(id).populate('user', 'name email')
  .then(deposit => {
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found.' });
    }
    if (deposit.status === status) {
      return res.status(400).json({
        message: `Deposit status is already ${status}.`,
      });
    }
    deposit_user = deposit.user
    deposit.status = status;
    deposit.deposited_date = status === "paid" ? new Date() : null;
    deposit.save()
      .then(updatedDeposit => {
        if(updatedDeposit.status === "paid"){
          console.log(deposit_user.email)
          sendStatusEmail(
            updatedDeposit, 
            deposit_user
          );
        }
        return res.status(200).json({ message: "Deposit status updated successfully" });
      })
      .catch(error => {
        res.status(500).json({ message: 'An error occurred while updating the status.' });
      });
  })
  .catch(error => {
    res.status(500).json({ message: 'An error occurred while retrieving the status.' });
  });
}

module.exports = {
  createDeposit,
  getAllDeposits,
  getDepositById,
  updateDeposit,
  deleteDeposit,
  updateDepositStatus,
};
