const express = require("express");
const Hire = require("../models/Hire");

const router = express.Router();

router.post("/callback", async (req, res) => {
  try {
    const body = req.body?.Body;
    if (!body || !body.stkCallback) {
      console.warn("⚠ Callback received with no stkCallback:", req.body);
      return res.status(400).json({ error: "Invalid callback payload" });
    }

    const callback = body.stkCallback;
    console.log("📩 Raw M-Pesa Callback:", JSON.stringify(callback, null, 2));

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (!CheckoutRequestID) {
      console.warn("⚠ Missing CheckoutRequestID in callback:", callback);
      return res.status(400).json({ error: "Missing CheckoutRequestID" });
    }

    console.log("🔎 Looking for hire with CheckoutRequestID:", CheckoutRequestID);

    if (ResultCode === 0) {
      // ✅ Payment successful
      const receipt = CallbackMetadata?.Item?.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      const amount = CallbackMetadata?.Item?.find(i => i.Name === "Amount")?.Value;
      const phone = CallbackMetadata?.Item?.find(i => i.Name === "PhoneNumber")?.Value;

      const updatedHire = await Hire.findOneAndUpdate(
        { "payment.transactionId": CheckoutRequestID },
        {
          status: "confirmed",
          "payment.status": "completed",
          "payment.receipt": receipt,
          "payment.amount": amount,
          "payment.phone": phone,
        },
        { new: true }
      );

      if (!updatedHire) {
        console.error("❌ No hire found for CheckoutRequestID:", CheckoutRequestID);

        // Debugging: log all hires in DB with their transactionIds
        const hires = await Hire.find({}, "payment.transactionId status userId totalAmount");
        console.log("📋 Current hires in DB:", hires);
      } else {
        console.log("✅ Hire payment confirmed!");
        console.log("   Hire ID:", updatedHire._id);
        console.log("   CheckoutRequestID:", CheckoutRequestID);
        console.log("   Receipt:", receipt);
      }
    } else {
      // ❌ Payment failed
      const updatedHire = await Hire.findOneAndUpdate(
        { "payment.transactionId": CheckoutRequestID },
        {
          status: "failed",
          "payment.status": "failed",
        },
        { new: true }
      );

      if (!updatedHire) {
        console.error("❌ No hire found for failed CheckoutRequestID:", CheckoutRequestID);
      } else {
        console.log("⚠ Payment failed for hire:", updatedHire._id);
      }
    }

    // ✅ Always ACK to Safaricom to stop retries
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    });
  } catch (err) {
    console.error("❌ M-Pesa Callback error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
