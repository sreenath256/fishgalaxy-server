const User = require("../../model/userModel");

// Getting all Customer to list on admin dashboard
const getCustomers = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,

    } = req.query;

    let filter = {};

    if (status) {
      if (status === "active") {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive

      const isNumber = !isNaN(search); // check if search is numeric

      filter.$or = [
        { name: { $regex: regex } },
        { shopName: { $regex: regex } },
        { email: { $regex: regex } },
        ...(isNumber ? [
          { mobile: Number(search) },
          { pincode: Number(search) }
        ] : [])
      ];
    }



    const skip = (page - 1) * limit;

    // Getting all users
    const customers = await User.find(
      { role: "user", ...filter },

    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalAvailableUsers = await User.countDocuments({
      role: "user",
      ...filter,
    });

    res.status(200).json({ customers, totalAvailableUsers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Not completed
const getCustomer = (req, res) => {
  const { id } = req.params;

  console.log(id);

  res.status(200).json({ msg: `User id ${id}` });
};

// Creating new Customer if needed for admin
const addCustomer = async (req, res) => {
  try {
    // Will be update later
    let formData = { ...req.body, isActive: true };
    const files = req?.files;

    if (files && files.length > 0) {
      formData.moreImageURL = [];
      formData.imageURL = "";
      files.map((file) => {
        if (file.fieldname === "imageURL") {
          formData.imageURL = file.filename;
        } else {
          formData.moreImageURL.push(file.filename);
        }
      });
    }

    const customer = await User.create(formData);

    res.status(200).json({ customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Not completed
const updateCustomer = (req, res) => {
  const { id } = req.params;

  console.log(id);

  res.status(200).json({ msg: `Customer Number ${id} - updated` });
};

// Delete a user
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await User.findOneAndDelete({ _id: id });

    if (!customer) {
      throw Error("No Such Customer");
    }

    res.status(200).json({ customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Block or unblock user
const blockOrUnBlockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const customer = await User.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );
    res.status(200).json({ customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  addCustomer,
  deleteCustomer,
  updateCustomer,
  blockOrUnBlockCustomer,
};
