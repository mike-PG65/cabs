const express = require("express");
const Cart = require("../models/Cart");
const Hire = require("../models/Hire");
const Car = require("../models/Cars");
const authMiddleware = require("../middleware/auth");
const { stkPush } = require("../services/mpesa");
const { sendEmail } = require("../utils/sendEmail");
const User = require("../models/User");
const { buildHireReceiptPDF } = require("../utils/receiptPdf"); // ✅ helper
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const router = express.Router();

// 🚗 Create hire
router.post("", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalAmount, payment, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No cars found for hire" });
    }
    if (!payment?.method) {
      return res.status(400).json({ error: "Payment method is required!" });
    }

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

    await newHire.save();
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // 🔑 Mark cars as hired
    for (let item of items) {
      await Car.findByIdAndUpdate(item.carId, {
        availabilityStatus: "Booked",
      });
    }

    if (payment.method === "mpesa") {
      const phoneNumber = req.user.phone || phone;
      if (!phoneNumber) {
        return res
          .status(400)
          .json({ error: "Phone number is required for M-Pesa payment" });
      }

      const mpesaRes = await stkPush(totalAmount, phoneNumber, newHire._id);
      const checkoutId =
        mpesaRes?.CheckoutRequestID ||
        mpesaRes?.data?.CheckoutRequestID ||
        null;

      if (checkoutId) {
        newHire.payment.transactionId = checkoutId;
        await newHire.save();
      }

      return res.status(200).json({
        message: "Hire created. Awaiting M-Pesa payment confirmation.",
        hire: newHire,
        mpesa: mpesaRes,
      });
    }

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

    const hire = await Hire.findOne({ _id: hireId, userId }).populate(
      "items.carId"
    );

    if (!hire) {
      return res.status(404).json({ error: "Hire not found" });
    }

    res.status(200).json({ hire });
  } catch (err) {
    console.error("Get hire error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Complete hire & free cars
router.post("/:hireId/complete", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const hire = await Hire.findById(hireId);

    if (!hire) return res.status(404).json({ error: "Hire not found" });

    hire.status = "completed";
    await hire.save();

    res.json({ message: "Hire completed and cars freed", hire });
  } catch (err) {
    console.error("Complete hire error:", err);
    res.status(500).json({ error: "Failed to complete hire" });
  }
});


// 📄 Download receipt PDF directly
// 📄 Download or preview receipt PDF
router.get("/:hireId/receipt-pdf", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const userId = req.user.id;

    const hire = await Hire.findOne({ _id: hireId, userId }).populate("items.carId");
    if (!hire) return res.status(404).json({ error: "Hire not found" });

    const pdfBuffer = await buildHireReceiptPDF(hire);

    // If frontend requests JSON (for preview)
    if (req.query.format === "json") {
      return res.json({
        message: "✅ Receipt generated",
        filename: `receipt-${hire._id}.pdf`,
        pdf: pdfBuffer.toString("base64"), // frontend can decode & preview
      });
    }

    // Default: send as downloadable file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${hire._id}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Receipt PDF error:", err);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
});


// 📧 Send receipt via email (Resend)
// 📧 Send receipt via email (Gmail + Nodemailer)
// 📧 Send receipt via email (User + Admin)
router.post("/:hireId/send-receipt", authMiddleware, async (req, res) => {
  try {
    console.log("📨 /send-receipt endpoint hit"); // confirm route is running

    const { hireId } = req.params;
    const userId = req.user.id;

    console.log("🔍 hireId:", hireId, "userId:", userId);

    // 🔎 Fetch hire
    const hire = await Hire.findOne({ _id: hireId, userId }).populate("items.carId");
    if (!hire) {
      console.error("❌ Hire not found for:", hireId);
      return res.status(404).json({ error: "Hire not found" });
    }

    // 🔎 Fetch user
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.error("❌ No email found for user:", userId);
      return res.status(400).json({ error: "User email not found" });
    }

    console.log("📧 Sending receipt to:", user.email);

    // 📄 Build PDF buffer
    const pdfBuffer = await buildHireReceiptPDF(hire);

    // --- 1. Send email to user ---
    await sendEmail(
      user.email,
      "Your Car Hire Receipt",
      `<p>Hi ${user.name || "Customer"},</p>
       <p>Thank you for hiring with <b>Jeffika Cabs</b>! Your receipt is attached.</p>`,
      [{ filename: `receipt-${hire._id}.pdf`, content: pdfBuffer }]
    );

    console.log("✅ Receipt sent to user:", user.email);

    // --- 2. Send admin copy ---
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        `📑 New Hire Receipt (Hire ID: ${hire._id})`,
        `<p>A new hire receipt was generated for <b>${user.email}</b>. The receipt is attached.</p>`,
        [{ filename: `receipt-${hire._id}.pdf`, content: pdfBuffer }]
      );
      console.log("✅ Admin copy sent:", process.env.ADMIN_EMAIL);
    } else {
      console.warn("⚠️ ADMIN_EMAIL not set in environment");
    }

    res.json({
      message: "📧 Receipt sent to user and admin",
      filename: `receipt-${hire._id}.pdf`,
    });

  } catch (err) {
    console.error("🔥 Send receipt error:", err);
    res.status(500).json({ error: err.message || "Failed to send receipt" });
  }
});



module.exports = router;
