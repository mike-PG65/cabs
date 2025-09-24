const express = require("express");
const Cart = require("../models/Cart");
const Hire = require("../models/Hire");
const authMiddleware = require("../middleware/auth");
const { stkPush } = require("../services/mpesa");

const router = express.Router();

// 🚗 Create hire
router.post("", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalAmount, payment, phone } = req.body;

    console.log("📦 Incoming hire request:", req.body);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No cars found for hire" });
    }

    if (!payment?.method) {
      return res.status(400).json({ error: "Payment method is required!" });
    }

    // Create new hire
    let newHire = new Hire({
      userId,
      items,
      totalAmount,
      status: "pending",
      payment: {
        transactionId: null,
        method: payment.method,
        status: "pending",
        amount: totalAmount,
      },
    });

    try {
      await newHire.save();
      console.log("✅ Hire saved in DB:", newHire._id);
    } catch (saveErr) {
      console.error("❌ Hire save failed:", saveErr.message);
      return res.status(400).json({ error: saveErr.message });
    }

    // Clear the user's cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // 🚨 If payment method is M-Pesa, trigger STK push
    if (payment.method === "mpesa") {
      const phoneNumber = req.user.phone || phone;
      if (!phoneNumber) {
        return res
          .status(400)
          .json({ error: "Phone number is required for M-Pesa payment" });
      }

      console.log("📲 Triggering STK push for hire:", newHire._id);
      const mpesaRes = await stkPush(totalAmount, phoneNumber, newHire._id);

      // ✅ Handle Safaricom response safely
      const checkoutId =
        mpesaRes?.CheckoutRequestID ||
        mpesaRes?.data?.CheckoutRequestID ||
        null;

      if (checkoutId) {
        newHire.payment.transactionId = checkoutId;
        await newHire.save();

        console.log("✅ Hire updated with CheckoutRequestID:", checkoutId);
        console.log("📝 Hire after update:", newHire);
      } else {
        console.warn("⚠ No CheckoutRequestID returned by stkPush:", mpesaRes);
      }

      return res.status(200).json({
        message: "Hire created. Awaiting M-Pesa payment confirmation.",
        hire: newHire,
        mpesa: mpesaRes,
      });
    }

    // 💵 Cash payment
    return res.status(200).json({
      message: "Hire created successfully",
      hire: newHire,
    });
  } catch (err) {
    console.error("🔥 Hire route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 📄 Get hire details
router.get("/:hireId", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const userId = req.user.id;

    // console.log("🔍 Fetching hire:", hireId, "for user:", userId);

    const hire = await Hire.findOne({ _id: hireId, userId }).populate(
      "items.carId"
    );

    if (!hire) {
      console.warn("⚠ Hire not found:", hireId);
      return res.status(404).json({ error: "Hire not found" });
    }

    // console.log("📄 Hire details:", hire);

    res.status(200).json({ hire });
  } catch (err) {
    console.error("Get hire error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
