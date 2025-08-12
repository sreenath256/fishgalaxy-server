const mongoose = require("mongoose");
const Category = require("../model/categoryModel");
const { Schema } = mongoose;

const productsSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: Category,
    },
    imageURL: {
      type: String,
    },
    price: {
      type: Number,
    },
    offer: {
      type: Number,
    },
    status: {
      type: String,
      enum: [
        "stocked",
        "out of stock"
      ],
    },
    moreImageURL: [
      {
        type: String,
      },
    ],
    isLatestProduct: {
      type: Boolean,
      default: false,
    },
    isOfferProduct: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
    },

  },
  { timestamps: true }
);

const Products = mongoose.model("Products", productsSchema);

module.exports = Products;
