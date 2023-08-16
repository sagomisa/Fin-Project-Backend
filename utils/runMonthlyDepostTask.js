const Deposit = require("../models/depositModel");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");

const runMonthlyDepositTask = () => {
  const todaysDate = new Date();
  let userEmails = [];
  User.find()
    .sort("-createdAt")
    .select("-password")
    .then((users) => {
      users.forEach((user) => {
        if (user.role === "member") {
          userEmails.push(user.email);
          new Deposit({
            user,
            amount: 250,
            status: "unpaid",
            deposit_for: todaysDate,
          }).save();
        }
      });
      const subject = `Deposit for the month of ${todaysDate.toLocaleDateString()}`;
      const send_to = userEmails.join(", ");
      const sent_from = process.env.EMAIL_USER;
      const reply_to = "noreply@fininvestmentsinc.com";
      const template = "pendingDeposit";
      const userName = "user";
      const msg = `You have pending deposit amount for ${todaysDate.toLocaleDateString()}, 
                    we kindly remind you to make the payment on time.`;
      sendEmail(
        subject,
        send_to,
        sent_from,
        reply_to,
        template,
        userName,
        "",
        msg
      ).then(() => {
        console.log("Deposit reminder email sent to all members.");
      });
    });
  };
const testFunction = () => {
  console.log("This is test to check node cron in production.");
};

module.exports = {
  runMonthlyDepositTask,
  testFunction,
};
