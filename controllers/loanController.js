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
    const existingLoan = await Loan.findOne({ user: id, status: { $in: ['pending', 'approved'] } });
    console.log(`existingLoan>>>>${existingLoan}`);

    if (existingLoan) {
      console.log("existingLoan called --->", existingLoan);
      return res.status(400).json({ message: "You already have a loan in process" });
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
    const loans = await Loan.find({})
    .populate('user', 'name email')
    .populate('approved_by', 'name email')
    .populate('disbursed_by', 'name email')
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

// Update loan status
const updateLoanStatus = async (req, res) => {
  const { userId, id, amount, status, remarks, email, name } = req.body;


  // Validate the provided status value
  const validStatuses = ["approved", "pending", "rejected", "cancelled", "disbursed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  const totalLoanProvidedByCompany = await Constant.findOne({
    key: "totalDisbursementAmount",
  });

  // Retrieve the loan by loanId
  Loan.findById(id)
    .then(loan => {
      console.log(loan)
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found.' });
      }
      if (loan.status === status) {
        return res.status(400).json({
          message: `Loan status is already ${status}.`,
        });
      }
      
      if (loan.status === 'disbursed') {
        // Prevent update if loan is already disbursed
        return res.status(400).json({ message: 'Cannot update a loan that is already disbursed!' });
      }

      if(status === 'approved' &&  totalLoanProvidedByCompany.value < loan.amount){
        return res.status(500).json({ message: 'Error! Not Enough disbursment amount available.' });
      }

      if (status === 'disbursed' && loan.status !== 'approved')
        return res.status(500).json({ message: 'Only approved loan can be disbursed!' });

      const prevStatus = loan.status;
      // Update the loan object
      loan.status = status;
      loan.remarks = remarks || "";
      loan.current_user = req.user
      loan.save()
        .then(updatedLoan => {
          console.log(prevStatus +" => " + status)
          if(status === 'disbursed' && prevStatus !== 'disbursed'){
            totalLoanProvidedByCompany.value = totalLoanProvidedByCompany.value - loan.amount;
            totalLoanProvidedByCompany.save((err, updatedRecord) => {
              console.log(updatedRecord)
              if (err) {
                console.error(err);
              }
            })
          }
          sendStatusEmail(
            loan.status,
            email,
            name,
            remarks
          );
          return res.status(200).json({ message: "Loan updated successfully" });
        })
        .catch(error => {
          res.status(500).json({ message: 'An error occurred while updating the loan.' });
        });
    })
    .catch(error => {
      res.status(500).json({ message: 'An error occurred while retrieving the loan.' });
    });
};

// Retrieve and return current user loan.
const getUserLoan = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user })
    .populate('user', 'name email')
    .sort({createdAt: -1});

    res.status(200).json(loans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel loan for user
const cancelLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findById(id).populate('user', '_id name email')
    .populate('approved_by', 'name email')
    .populate('disbursed_by', 'name email')
    const prevStatus = loan.status;

    if(!loan){
      return res.status(404).json({ message: 'Loan not found.' });
    }
    if (loan.status === 'disbursed') {
      // Prevent update if loan is already disbursed
      return res.status(400).json({ message: 'Cannot update a loan that is already disbursed!' });
    }
    if(req.user._id.toString() !== loan.user._id.toString()){
      return res.status(400).json({ message: 'Error! Unauthorized access' });
    }
    loan.status = "cancelled";
    loan.remarks = "cancelled by User";
    loan.save().then(updatedLoan => {
      if(prevStatus === 'approved'){
        Constant.findOne({
          key: "totalDisbursementAmount",
        }).then((totalLoanProvidedByCompany)=>{
          totalLoanProvidedByCompany.value = totalLoanProvidedByCompany.value + loan.amount;
          totalLoanProvidedByCompany.save((err, updatedRecord) => {
            console.log(updatedRecord)
            if (err) {
              console.error(err);
            }
          })
        })
      }
      res.status(200).json(updatedLoan);
    }).catch(error => {
      res.status(500).json({ message: 'An error occurred while updating the loan.' });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendStatusEmail = async (loanStatus, email, name, remarks) => {
  const subject = "Loan status update- Fin Investments Inc.";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@fininvestmentsinc.com";
  const template = "loanApproved";
  const userName = name;
  const loanStat = loanStatus;
  var msg = "";

  console.log(`status>>>>>${loanStat}`);
  if (loanStat === "approved") {
    msg =
      "We are pleased to inform you that your loan application has been approved";
  } else if (loanStat === "rejected") {
    msg = `Unfortunately, you loan has been rejected. The reason of rejection is: ${remarks}`;
  } else if (loanStat === "cancelled") {
    msg = "Your loan has been cancelled upon your request.";
  } 
  else if (loanStat === "disbursed") {
    msg = "Your loan has been disbursed Successfully.";
  }
  else if (loanStat === "pending") {
    msg = "Your loan is pending and yet to be approved.";
  }
  else {
    msg = "You loan status is updated";
  }
  console.log(`messagege>>>>${msg}`);
  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      userName,
      loanStat,
      msg
    );
    return true;
  } catch (error) {
    return false;
  }
};
module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  updateLoanStatus,
  sendStatusEmail,
  getUserLoan,
  cancelLoan
};
