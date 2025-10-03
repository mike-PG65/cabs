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
router.get("/:hireId/receipt-pdf", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const userId = req.user.id;

    const hire = await Hire.findOne({ _id: hireId, userId }).populate("items.carId");
    if (!hire) return res.status(404).json({ error: "Hire not found" });

    const pdfBuffer = await buildHireReceiptPDF(hire);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${hire._id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Receipt PDF error:", err);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
});

// 📧 Send receipt via email (Resend)
router.post("/:hireId/send-receipt", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const userId = req.user.id;

    const hire = await Hire.findOne({ _id: hireId, userId }).populate("items.carId");
    if (!hire) return res.status(404).json({ error: "Hire not found" });

    const user = await User.findById(userId);
    if (!user || !user.email) return res.status(400).json({ error: "User email not found" });

    // Build PDF as buffer
    const pdfBuffer = await buildHireReceiptPDF(hire);

    // Send email to user
    await resend.emails.send({
      from: "My Cars <noreply@mycars.com>", // ✅ must match a verified domain in Resend
      to: user.email,
      subject: "Your Car Hire Receipt",
      html: "<p>Please find attached your receipt.</p>",
      attachments: [
        {
          filename: `receipt-${hire._id}.pdf`,
          content: pdfBuffer.toString("base64"), // ✅ Resend requires base64
          type: "application/pdf",
        },
      ],
    });

    // Send admin copy (optional)
    if (process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: "My Cars <noreply@mycars.com>",
        to: process.env.ADMIN_EMAIL,
        subject: `New Hire Receipt (Hire ID: ${hire._id})`,
        html: `<p>Receipt for hire <b>${hire._id}</b> attached.</p>`,
        attachments: [
          {
            filename: `receipt-${hire._id}.pdf`,
            content: pdfBuffer.toString("base64"),
            type: "application/pdf",
          },
        ],
      });
    }

    res.json({
      message: "📧 Receipt sent successfully",
      pdf: pdfBuffer.toString("base64"), // frontend can offer download
      filename: `receipt-${hire._id}.pdf`,
    });
  } catch (err) {
    console.error("Send receipt error:", err);
    res.status(500).json({ error: err.message || "Failed to send receipt" });
  }
});

module.exports = router;
