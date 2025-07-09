const User = require("../model/userModel");
const OTP = require("../model/otpModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { sendOTPMail, passwordChangedMail } = require("../util/mailFunction");
const twilio = require("twilio");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};



const cookieConfig = {
  secure: true,
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24,
};



const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Sending OTP to email for validation
const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      throw Error("Provide a mobile number");
    }

    // Use E.164 format: +91xxxxxxxxxx
    if (!/^\+?[1-9]\d{7,14}$/.test(mobile)) {
      throw Error("Invalid mobile number");
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      throw Error("Mobile number is not already registered");
    }

    const existingOTP = await OTP.findOne({ mobile });

    // if (existingOTP) {
    //   throw Error("OTP already sent to this number");
    // }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await OTP.create({ mobile, otp });

    await client.messages.create({
      body: `Your OTP for Fish Galexy login is ${otp}. Please DO NOT share it with anyone to keep your account safe.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile, // must be in format like +919876543210
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Validating above OTP
const validateOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const data = await OTP.findOne({ mobile });

    if (!data) {
      throw Error("OTP expired");
    }

    if (otp !== data.otp) {
      throw Error("OTP is not matched");
    }

    const user = await User.findOne({ mobile });

    
    if (!user) {
      throw Error("User not found");
    }

    const token = createToken(user._id);

    res.cookie("user_token", token, cookieConfig);

    res.status(200).json({
      success: true,
      message: "OTP validation Success",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Incase the user forget the password can reset after verifying otp
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw Error("Provide an Email");
    }

    if (!validator.isEmail(email)) {
      throw Error("Invalid Email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Error("Email is not Registered");
    }

    const otpExists = await OTP.findOne({ email });

    if (otpExists) {
      await OTP.findOneAndDelete({ _id: otpExists._id });
    }

    let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    await OTP.create({ email, otp });

    res
      .status(200)
      .json({ msg: "OTP is send to your email Address", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Validating forgot OTP
const validateForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw Error("All fields are required");
    }

    if (!validator.isEmail(email)) {
      throw Error("Invalid Email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Error("Email is not Registered");
    }

    const validOTP = await OTP.findOne({ email });

    if (otp !== validOTP.otp) {
      throw Error("Wrong OTP. Please Check again");
    }

    res.status(200).json({ success: true, message: "OTP validation Success" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Setting up new password
const newPassword = async (req, res) => {
  try {
    const { email, password, passwordAgain } = req.body;

    if (!email || !password || !passwordAgain) {
      throw Error("All fields are required");
    }

    if (!validator.isEmail(email)) {
      throw Error("Invalid Email");
    }

    if (!validator.isStrongPassword(password)) {
      throw Error("Password is not Strong enough");
    }

    if (password !== passwordAgain) {
      throw Error("Passwords are not same");
    }

    const oldUserData = await User.findOne({ email });

    const match = await bcrypt.compare(password, oldUserData.password);

    if (match) {
      throw Error("Provide new Password");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hash,
        },
      }
    );

    if (user) {
      try {
        passwordChangedMail(email);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Resending OTP incase the user doesn't receive the OTP
const resentOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw Error("Email is required");
    }

    if (!validator.isEmail(email)) {
      throw Error("Invalid Email");
    }

    const otpData = await OTP.findOne({ email });

    if (!otpData) {
      throw Error("No OTP found in this email. Try again...");
    }

    if (otpData.otp) {
      sendOTPMail(email, otpData.otp);
    } else {
      throw Error("Cannot find OTP");
    }

    res.status(200).json({ message: "OTP resend successfully", success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  sendOTP,
  validateOTP,
  forgotPassword,
  validateForgotOTP,
  newPassword,
  resentOTP,
};
