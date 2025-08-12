const mongoose = require("mongoose");
const { sendOTPMail } = require("../util/mailFunction");

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, //Expire in 5 minute
  },
});

async function sendVerificationEmail(mobile, otp) {
  try {
    sendOTPMail(mobile, otp);
  } catch (error) {
    console.log("Error occurred while sending mobile: ", error);
    throw error;
  }
}
otpSchema.pre("save", async function (next) {
  console.log("New document saved to the database",this.otp);

  // if (this.isNew) {
  //   await sendVerificationEmail(this.mobile, this.otp);
  // }
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
