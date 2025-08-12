const mongoose = require("mongoose");
const User = require("./userModel");
const Product = require("./productModel");
const Coupon = require("./couponModel");
const Counter = require("./counterModel");

const { Schema } = mongoose;

const AddressSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
});

const ProductSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: Product,
    required: true,
  },
  name: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  offer: {
    type: Number,
    required: true,
  },
});

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "canceled",
      "return request",
      "return approved",
      "return rejected",
      "pickup completed",
      "returned",
    ],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  reason: {
    type: String,
  },
});

const OrderSchema = new Schema(
  {
    orderId: {
      type: Number,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "canceled",
        "return request",
        "return approved",
        "return rejected",
        "pickup completed",
        "returned",
      ],
      default: "pending",
    },
    statusHistory: [StatusHistorySchema],

    deliveryDate: {
      type: Date,
      default: () => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 7); // For a week
        return currentDate;
      },
    },
    subTotal: {
      type: Number,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    products: [ProductSchema],
    address: AddressSchema,
    totalQuantity: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Order ID generation
OrderSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const counter = await Counter.findOne({ model: "Order", field: "orderId" });

    // Checking if order counter already exist
    if (counter) {
      this.orderId = counter.count + 1;
      counter.count += 1;
      await counter.save();
    } else {
      await Counter.create({ model: "Order", field: "orderId" });
      this.orderId = 1000;
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("Order", OrderSchema);
