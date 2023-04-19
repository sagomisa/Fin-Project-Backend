const User = require("../models/userModel");
const Loan = require("../models/loanModel");
const sendEmail = require("../utils/sendEmail");
const Constant = require("../models/constantsModel");
const ObjectId = require("mongodb").ObjectID;

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

    if (existingLoan) {
      console.log("existingLoan called --->", existingLoan);
      return res.status(200).json({ message: "You already have a loan" });
    }

    const loan = new Loan({
      user,
      amount,
    });

    // Send email to user.

    const subject = "New Loan Application - FIN Investments Inc.";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "";
    const template = "newLoan";
    const name = user.name;

    // await sendEmail(subject, send_to, sent_from, reply_to, template, name);

    // Send email to admin.

    const subject1 = "New Loan Application - FIN Investments Inc.";
    const send_to1 = "fininvestmentsinc@gmail.com";
    const sent_from1 = process.env.EMAIL_USER;
    const reply_to1 = "";
    const template1 = "newLoanForAdmin";

    // await sendEmail(subject1, send_to1, sent_from1, reply_to1, template1);
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
    const { userId, id, amount, status, remarks, email, name } = req.body;
    const loan = await Loan.findById(id);
    console.log("LOANNNNNN >>>>>>>>>", JSON.stringify(loan));
    if (loan.status === "Approved" && status === "Approved") {
      return res.status(400).json({
        message: "You have already approved the request.",
      });
    }
    if (status === "Approved") {
      const totalLoanProvidedByCompany = await Constant.find({
        key: "totalDisbursementAmount",
      });
      console.log(`totalLoanProvidedByCompany>>${totalLoanProvidedByCompany}`);
      console.log(`loanAmount>>>${amount}`);
      const totalLoanOfCompany = totalLoanProvidedByCompany[0]?.value;
      if (totalLoanOfCompany >= amount) {
        if (loan) {
          loan.status = status;
          const filter = { _id: ObjectId(id) };
          const updateDoc = {
            $set: {
              status: status,
            },
          };
          console.log(`updated loan${JSON.stringify(loan)}`);
          await Loan.updateOne(filter, updateDoc);
          const newRemainingCompanyLoan = totalLoanOfCompany - amount;
          // update Constant value
          await Constant.findOneAndUpdate({
            key: "totalDisbursementAmount",
            value: newRemainingCompanyLoan.toString(),
          });
          // sendStatusEmail(loan.status, email, name, remarks);
          return res
            .status(200)
            .json({ message: "Loan approved successfully." });
        }
      } else {
        return res.status(400).json({
          message: "Cannot process the request with the given amount.",
        });
      }
    } else {
      if (loan) {
        console.log(`remarks>>>${remarks}`);
        loan.status = status;
        const filter = { _id: id };
        const updateDoc = {
          $set: {
            status: status,
            remarks: status === "Rejected" ? remarks : "",
          },
        };

        await Loan.updateOne(filter, updateDoc);
        // sendStatusEmail(loan.status, email, name, remarks);
        let message = `Loan ${status} successfully.`;
        return res.status(200).json({ message: message });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendStatusEmail = async (loanStatus, email, name, remarks) => {
  console.log(`Emaillkkkllkl${email}`);
  const subject = "Loan status update- Fin Investments Inc.";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@fininvestmentsinc.com";
  const template = "loanApproved";
  const userName = name;
  const status = loanStatus;
  var msg = "";

  console.log(`status>>>>>${status}`);
  if (status === "Approved") {
    msg =
      "We are pleased to inform you that your loan application has been approved";
  } else if (status === "Rejected") {
    msg = `Unfortunately, you loan has been rejected. The reason of rejection is: ${remarks}`;
  } else if (status === "Cancelled") {
    msg = "Your loan has been cancelled upon your request.";
  } else {
    msg = "Test";
  }

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      userName,
      status,
      msg
    );
    // res.status(200).json({ message: "Loan status Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
};
module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  changeLoanStatus,
  sendStatusEmail,
};
