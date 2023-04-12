const User = require("../models/userModel");
const Loan = require("../models/loanModel");
const sendEmail = require("../utils/sendEmail");

const createLoan = async (req, res) => {
  try {
    console.log(`req>>>>>>>>>>${JSON.stringify(req.body)}`);
    const { id, amount } = req.body;
    console.log(`id>>>>>${req.body.id}`);
    console.log(`amount>>>>>${req.body.amount}`);
    const user = await User.findById(id);

    // Check if user has an existing loan
    const existingLoan = await Loan.findOne({ user: id });
    console.log(`existingLoan>>>>${existingLoan}`);
    /* Logic
    Check number of days. if numberOfDays < 60, 
    */
    // if (existingLoan) {
    //   console.log(`test>>>>>`);
    //   return res.status(400).json({ message: "You already have a loan" });
    // }

    if (existingLoan) {
      console.log("existingLoan called --->", existingLoan);
      return res.status(200).json({ message: "You already have a loan" });
    }

    const loan = new Loan({
      user,
      amount,
    });

    // Send email to user.

    // const subject = "New Loan Application - FIN Investments Inc.";
    // const send_to = user.email;
    // const sent_from = process.env.EMAIL_USER;
    // const reply_to = "";
    // const template = "newLoan";
    // const name = user.name;

    // await sendEmail(subject, send_to, sent_from, reply_to, template, name);

    const newLoan = await loan.save();
    console.log(`newLoan>>>>>>>${newLoan}`);
    res.status(201).json(newLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Retrieve and return all loans from the database.
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find({});
    res.status(200).json(loans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Find a single loan with a loanId
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findById(id);
    res.status(200).json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a loan identified by the loanId in the request
const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status } = req.body;
    const loan = await Loan.findById(id);
    if (amount) {
      loan.amount = amount;
    }
    if (status) {
      loan.status = status;
    }
    const updatedLoan = await loan.save();
    res.status(200).json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a loan with the specified loanId in the request
const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    await Loan.findByIdAndDelete(id);
    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change Loan Status
const changeLoanStatus = async (req, res) => {
  console.log(`reqbody>>>>${req.body}`);

  // const { status, id, amount } = req.body;

  // const loan = await Loan.findById(id);

  // if (!loan) {
  //   res.status(404);
  //   throw new Error("User not found");
  // }

  // loan.status = role;
  // await loan.save();

  // res.status(200).json({
  //   message: `Loan status updated to ${status}`,
  // });
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  changeLoanStatus,
};
