const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,

    },
    pincode: {
      type: Number,
      required: true,

    },
    address: {
      type: String,
      required: true,

    },

    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "superAdmin"],
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    profileImgURL: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.statics.signup = async function (
  userCredentials,
  role,
) {
  const { name, shopName, mobile, email, pincode, address } =
    userCredentials;

  if (
    !name ||
    !shopName ||
    !mobile ||
    !pincode ||
    !address
  ) {
    throw Error("All fields are required");
  }

  if (name.trim() === "" || shopName.trim() === "" || pincode.trim() === "" || address.trim() === "") {
    throw Error("All Fields are required");
  }

  if (!validator.isMobilePhone(mobile)) {
    throw Error("Mobile number is not valid");
  }


  // Checking if the email is already registered.
  const exists = await this.findOne({ mobile });
  if (exists) {
    throw Error("Mobile Number already in use");
  }

  





  const user = await this.create({
    ...userCredentials,
    isActive: true,
    role,
  });


  return user;
};

UserSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields are required");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  let user = await this.findOne({ email });
  if (!user) {
    throw Error("This email is not registered. Please check!");
  }
  if (!user.isActive) {
    throw Error(
      "Your account is blocked. Contact customer care for further details"
    );
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect Password");
  }

  user.password = "";

  return user;
};

UserSchema.statics.changePassword = async function (
  _id,
  currentPassword,
  password,
  passwordAgain
) {
  if (password !== passwordAgain) {
    throw Error("Password doesn't match");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }
  const exists = await this.findOne({ _id });
  if (!exists) {
    throw Error("Cannot find email");
  }

  const match = await bcrypt.compare(currentPassword, exists.password);

  if (!match) {
    throw Error("Current Password is wrong");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  let user = await this.updateOne({ _id }, { $set: { password: hash } });
  console.log(user);

  user.password = "";

  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
