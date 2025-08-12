const Order = require("../../model/orderModel");
const mongoose = require("mongoose");
const Payment = require("../../model/paymentModel");
const uuid = require("uuid");
const { generateInvoicePDF } = require("../Common/invoicePDFGenFunctions");
const User = require("../../model/userModel");

// Function checking if the passed status is valid or not. Ensuring redundant searches are avoided
function isValidStatus(status) {
  const validStatusValues = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  return validStatusValues.includes(status);
}

// Get a single order details
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    let find = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }

    // console.log(find);

    const order = await Order.findOne(find).populate("products.productId", {
      imageURL: 1,
      name: 1,
    });

    // console.log(order);

    if (!order) {
      throw Error("No Such Order");
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Orders List
const getOrders = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      startingDate,
      endingDate,
    } = req.query;

    let filter = {};

    // Date filtering
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      date.setHours(23, 59, 59, 999); // Include all times up to end of day
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }
    // Status filtering
    if (status) {
      if (!isValidStatus(status)) {
        throw Error("Not a valid status");
      }
      filter.status = status;
    } else {
      filter.status = {
        $in: [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "returned",
        ],
      };
    }

    // Search functionality
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        // Case 1: Search by order ID (_id)
        filter._id = search;
      } else {
        const searchAsNumber = Number(search);
        if (!isNaN(searchAsNumber)) {
          // Case 2: Search by orderId (number)
          filter.orderId = searchAsNumber;
        } else {
          // Case 3: Search by shopName or user name (case insensitive)
          // Create a separate filter for text search
          const textSearchFilter = {
            $or: [
              { "address.shopName": { $regex: search, $options: "i" } },
              { "address.name": { $regex: search, $options: "i" } },
              // Also search in user's name if populated
              { "user.name": { $regex: search, $options: "i" } },
              { "user.shopName": { $regex: search, $options: "i" } },
            ],
          };

          // Combine with existing filters
          filter = { ...filter, ...textSearchFilter };
        }
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter, {
      statusHistory: 0,
    })
      .skip(skip)
      .limit(limit)
      .populate("user", { name: 1, shopName: 1 })
      .populate("products.productId")
      .sort({ createdAt: -1 });

    const totalAvailableOrders = await Order.countDocuments(filter);

    res.status(200).json({ orders, totalAvailableOrders });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Updating the status of orders.
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    let find = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }
    const { status, description, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const statusExists = await Order.findOne({
      ...find,
      "statusHistory.status": status,
    });

    let updateOptions = {
      $set: {
        status,
      },
    };

    if (!statusExists) {
      updateOptions.$push = {
        statusHistory: {
          status,
          description,
          date: new Date(date),
        },
      };
    }

    const updated = await Order.findOneAndUpdate(find, updateOptions, {
      new: true,
    });

    if (!updated) {
      throw Error("Something went wrong");
    }





    const order = await Order.findOne(find, {
      products: { $slice: 1 },
    })
      .populate("user", { name: 1, shopName: 1 })
      .populate("products.productId", { imageURL: 1, name: 1 });

    res.status(200).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generating pdf invoices
const generateOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("products.productId");

    const pdfBuffer = await generateInvoicePDF(order);

    // Set headers for the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    res.status(200).end(pdfBuffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Clearing all orders only for testing
const clearOrder = async (req, res) => {
  try {
    const data = await Order.deleteMany({});

    res.status(200).json({ status: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getOrders,
  clearOrder,
  updateOrderStatus,
  getOrder,
  generateOrderInvoice,
};
