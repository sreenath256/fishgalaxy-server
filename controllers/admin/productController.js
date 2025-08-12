const Cart = require("../../model/cartModel");
const Product = require("../../model/productModel");
const mongoose = require("mongoose");

// Getting all products to list on admin dashboard
const getProducts = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      startingDate,
      endingDate,
      category
    } = req.query;

    let filter = {
      isActive: true,
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }


    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }
    const skip = (page - 1) * limit;

    // Date
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }

    const products = await Product.find(filter, {
      attributes: 0,
      moreImageURL: 0,
    })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
      .skip(skip)
      .limit(limit)
      .populate("category", { name: 1 });

    const totalAvailableProducts = await Product.countDocuments(filter);

    res.status(200).json({ products, totalAvailableProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get single Product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const product = await Product.findOne({ _id: id });

    if (!product) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creating new Product
const addProduct = async (req, res) => {
  try {
    console.log("Reached Data from fronend\n", req.body)
    let formData = { ...req.body, isActive: true };
    const files = req?.files;

    console.log(files)

    if (files && files.length > 0) {
      formData.moreImageURL = [];
      formData.imageURL = "";
      files.map((file) => {
        if (file.fieldname === "imageURL") {
          formData.imageURL = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`; // ✅ store the URL
        } else {
          formData.moreImageURL.push(`${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`); // ✅ store URLs
        }
      });

    }

    const product = await Product.create(formData);

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let formData = req.body;


    console.log("FormData ", formData)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    // Get the existing product first
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw Error("No Such Product");
    }

    const files = req?.files;

    if (files && files.length > 0) {
      // Initialize arrays if they don't exist
      formData.moreImageURL = existingProduct.moreImageURL || [];
      formData.imageURL = existingProduct.imageURL || "";

      files.forEach((file) => {
        if (file.fieldname === "imageURL") {
          formData.imageURL = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`;
        } else if (file.fieldname === "moreImageURL") {
          formData.moreImageURL.push(`${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`);
        }
      });

      // Clean up empty values
      if (formData.imageURL === "") {
        delete formData.imageURL;
      }
      if (formData.moreImageURL.length === 0) {
        delete formData.moreImageURL;
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: id },
      { $set: formData },
      { new: true }
    );

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deleting a Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    // Start a transaction to ensure both operations succeed or fail together
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Soft delete the product
      const product = await Product.findOneAndUpdate(
        { _id: id },
        { $set: { isActive: false } },
        { new: true, session } // Include session in the operation
      );

      if (!product) {
        throw Error("No Such Product");
      }

      // 2. Remove the product from all carts
      await Cart.updateMany(
        { "items.product": id },
        { $pull: { items: { product: id } } },
        { session }
      );

      // Commit the transaction if both operations succeed
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Product deactivated and removed from all carts successfully",
        product
      });
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
  updateProduct,
};
