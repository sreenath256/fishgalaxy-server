const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const mongoose = require("mongoose");

const getProducts = async (req, res) => {
  try {
    const { category, priceRange, search, sort, page = 1, limit = 15, isLatestProduct, isOfferProduct } = req.query;
    let filter = {};

    if (category) {
      const categoryNames = category.split(",").map(name => name.trim());
      console.log("Received category:", categoryNames);

      // Escape regex special characters
      const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Build regex array that supports both exact and partial match
      const regexArray = categoryNames.map(name => new RegExp(escapeRegex(name), "i"));

      const categories = await Category.find({
        name: { $in: regexArray }
      });

      console.log("Matched categories:", categories.map(c => c.name));

      if (categories.length > 0) {
        filter.category = { $in: categories.map(cat => cat._id) };
      } else {
        return res.status(200).json({ products: [], totalAvailableProducts: 0 });
      }
    }



    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split(',').map(Number);
      filter.offer = {
        $gte: minPrice,
        $lte: maxPrice
      };
    }

    // Boolean filters for special product types
    if (isLatestProduct === 'true') {
      filter.isLatestProduct = true;
    }

    if (isOfferProduct === 'true') {
      filter.isOfferProduct = true;
    }

    let sortOptions = {};

    switch (sort) {
      case "price-asc":
        sortOptions.offer = 1; // Price low to high
        break;
      case "price-desc":
        sortOptions.offer = -1; // Price high to low
        break;
      case "latest":
        // Show latest products first, then others
        sortOptions = { isLatestProduct: -1, createdAt: -1 };
        break;
      case "offers":
        // Show offer products first, then others
        sortOptions = { isOfferProduct: -1, createdAt: -1 };
        break;
      default:
        // Default sorting (newest first)
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(
      {
        status: { $in: ["stocked"] },
        isActive: true,
        ...filter,
      },
      {
        name: 1,
        imageURL: 1,
        offer: 1,
        price: 1,
        description: 1,
        isLatestProduct: 1,
        isOfferProduct: 1
      }
    )
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", { name: 1 });

    const totalAvailableProducts = await Product.countDocuments({
      status: { $in: ["stocked"] },
      isActive: true,
      ...filter,
    });

    res.status(200).json({ products, totalAvailableProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const product = await Product.findOne({ _id: id }).populate("category", {
      name: 1,
    });

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAvailableQuantity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const stockQuantity = await Product.findOne(
      { _id: id },
      { stockQuantity: 1 }
    );

    res.status(200).json({ stockQuantity: stockQuantity.stockQuantity });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOfferProducts = async (req, res) => {
  try {
    const products = await Product.find(
      {
        isActive: true,
        isOfferProduct: true,
        status: { $in: ["stocked"] },
      },
      {
        name: 1,
        imageURL: 1,
        price: 1,
        offer: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(10);

    const totalAvailableProducts = await Product.countDocuments({
      status: { $in: ["stocked"] },
      isOfferProduct: true,
    });

    res.status(200).json({ products, totalAvailableProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getLatestProducts = async (req, res) => {
  try {

    const products = await Product.find(
      {
        isLatestProduct: true,
        isActive: true,
        status: { $in: ["stocked"] },
      },
      {
        name: 1,
        imageURL: 1,
        price: 1,
        offer: 1,
      }
    )


    const totalAvailableProducts = await Product.countDocuments({
      status: { $in: ["stocked"] },
      isLatestProduct: true,
    }).limit(10)

    res.status(200).json({ products, totalAvailableProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  getProducts,
  getProduct,
  getAvailableQuantity,
  getOfferProducts,
  getLatestProducts
};
