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
      enum: ["approved", "pending", "rejected", "cancelled", "disbursed"],
      default: "pending",
    },
    remarks: {
      type: String,
      required: false,
      default: "",
    },
    approved_date: {
      type: Date,
      default: null
    },
    disbursed_date: {
      type: Date,
      default: null
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    disbursed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }
  },
  {
    timestamps: true,
    minimize: false,
  }
);

loanSchema.pre('save', function (next) {
  if(!this.isNew && this.isModified('status')){
    console.log("Original >>>>>>>.. "+this.status)
    next();
    console.log(this.current_user)
    if (
      (this.status === 'approved')
    ) {
      this.approved_date = new Date();
      this.approved_by = this.user
    }
    else if(this.status === 'disbursed'){
      this.disbursed_date = new Date();
      this.disbursed_by = this.user
    }
    else if(['pending', 'cancelled', 'rejected'].includes(this.status)){
      this.approved_date = null
      this.approved_by = null
    }
    next();
  }
  // console.log("HEYYYY")
  // console.log(this)
 

  next();
});

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
