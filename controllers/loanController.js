const User = require("../models/userModel");
const Loan = require("../models/loanModel");
const sendEmail = require("../utils/sendEmail");
const Constant = require("../models/constantsModel");

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
  try {
    console.log(`"REQ BODY>>>>${JSON.stringify(req.body)}`);
    const { userId, loanId, loanAmount, loanStatus } = req.body;
    const loan = await Loan.findById(loanId);
    console.log("LOANNNNNN >>>>>>>>>", JSON.stringify(loan));
    if (loanStatus === "Approved") {
      const totalLoanProvidedByCompany = await Constant.find({
        key: "totalDisbursementAmount",
      });
      const totalLoanOfCompany = totalLoanProvidedByCompany[0]?.value;
      if (totalLoanOfCompany >= loanAmount) {
        if (loan) {
          loan.status = loanStatus;
          const filter = { id: loanId };
          const updateDoc = {
            $set: {
              status: loanStatus,
            },
          };
          await Loan.updateOne(filter, updateDoc);
          const newRemainingCompanyLoan = totalLoanOfCompany - loanAmount;
          // update Constant value
          await Constant.findOneAndUpdate({
            key: "totalDisbursementAmount",
            value: newRemainingCompanyLoan.toString(),
          });
          return res
            .status(200)
            .json({ message: "Loan approved successfully." });
        }
      } else {
        return res
          .status(400)
          .json({
            message: "Cannot process the request with the given amount.",
          });
      }
    } else {
      if (loan) {
        loan.status = loanStatus;
        const filter = { id: loanId };
        const updateDoc = {
          $set: {
            status: loanStatus,
          },
        };
        await Loan.updateOne(filter, updateDoc);
        let message = "Loan $loanStatus successfully.";
        return res.status(200).json({ message: message });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  changeLoanStatus,
};
