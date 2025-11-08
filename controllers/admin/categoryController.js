const Category = require("../../model/categoryModel");
const mongoose = require("mongoose");
const Product = require("../../model/productModel");

// Getting all Categories to list on admin dashboard
const getCategories = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (status) {
      if (status === "active") {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find(filter).skip(skip).limit(limit).sort({ order: 1 });

    const totalAvailableCategories = await Category.countDocuments(filter);

    res.status(200).json({ categories, totalAvailableCategories });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Only getting one Category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const category = await Category.findOne({ _id: id });

    if (!category) {
      throw Error("No Such Category");
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creating new Category if needed for admin
const createCategory = async (req, res) => {
  try {
    let formData = req.body;
    const imgURL = req?.file?.key;


    const lastCategory = await Category.findOne().sort({ order: -1 });
    const nextOrder = lastCategory ? lastCategory.order + 1 : 1;

    if(nextOrder){
      formData = { ...formData, order: nextOrder };
    }

    if (imgURL) {
      formData = { ...formData, imgURL: `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(imgURL)}` };
    }

    const category = await Category.create(formData);

    res.status(200).json({ category });
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
};

// Updating the category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let formData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const imgURL = req?.file?.key;

    if (imgURL) {
      formData = { ...formData, imgURL: `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(imgURL)}` };
    }

    const category = await Category.findOneAndUpdate(
      { _id: id },
      { $set: { ...formData } },
      { new: true }
    );

    if (!category) {
      throw Error("No such Category");
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    // Find products under this category
    const products = await Product.find({ category: id });

    let uncategorizedCategory = await Category.findOne({ name: "Uncategorized" });

    // If "Uncategorized" category doesn't exist, create it
    if (!uncategorizedCategory) {
      uncategorizedCategory = await Category.create({
        name: "Uncategorized",
        isActive: true,
      });
    }

    // Move products to "Uncategorized" category
    if (products.length > 0) {
      await Product.updateMany(
        { category: id },
        { $set: { category: uncategorizedCategory._id } }
      );
    }

    // Delete the category
    const category = await Category.findOneAndDelete({ _id: id });

    if (!category) {
      throw Error("No Such Category");
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    console.log("Category Reorder Data:", req.body);
    const { orderedIds } = req.body; // Array of category IDs in the desired order

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index + 1 },
      },
    }));

    await Category.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: "Category order updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
  reorderCategories
};
