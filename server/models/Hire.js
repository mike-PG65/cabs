const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["mpesa", "cash"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const hireSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
 
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  payment: paymentSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },

   items: [
    {
      carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      pricePerDay: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Hire = mongoose.model("Hire", hireSchema);
module.exports = Hire;
