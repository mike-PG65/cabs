const express = require("express");
const Cart = require("../models/Cart");
const Hire = require("../models/Hire");
const Car = require("../models/Cars"); // ✅ import Car model
const authMiddleware = require("../middleware/auth");
const { stkPush } = require("../services/mpesa");
const { sendEmail } = require("../utils/sendEmail");
const PDFDocument = require("pdfkit");
const User = require("../models/User");

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

// 🧾 Generate PDF Receipt
router.get("/:hireId/receipt-pdf", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const userId = req.user.id;

    const hire = await Hire.findOne({ _id: hireId, userId }).populate(
      "items.carId"
    );

    if (!hire) {
      return res.status(404).json({ error: "Hire not found" });
    }

    // Build HTML template
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Car Hire Receipt</h1>
          <p><strong>Receipt No:</strong> ${hire._id}</p>
          <p><strong>Date:</strong> ${new Date(hire.createdAt).toLocaleString()}</p>
          <h2>Hired Cars</h2>
          <table>
            <tr><th>Car</th><th>Price</th></tr>
            ${hire.items
              .map(
                (item) =>
                  `<tr>
                     <td>${item.carId.brand} ${item.carId.model} (${item.carId.year})</td>
                     <td>Ksh ${item.totalPrice}</td>
                   </tr>`
              )
              .join("")}
          </table>
          <h2>Total: Ksh ${hire.totalAmount}</h2>
        </body>
      </html>
    `;

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${hire._id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Receipt PDF error:", err);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
});

// 📧 Send receipt to email
router.post("/:hireId/send-receipt", authMiddleware, async (req, res) => {
  try {
    const { hireId } = req.params;
    const userId = req.user.id;

    const hire = await Hire.findOne({ _id: hireId, userId }).populate("items.carId");
    if (!hire) return res.status(404).json({ error: "Hire not found" });

    const user = await User.findById(userId);
    if (!user || !user.email) return res.status(400).json({ error: "User email not found" });

    // 👉 Generate PDF with PDFKit
    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // Send Email to user
      await sendEmail(
        user.email,
        "Your Car Hire Receipt",
        "Please find attached your receipt.",
        [{ filename: `receipt-${hire._id}.pdf`, content: pdfBuffer }]
      );

      // Optional admin copy
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          "New Hire Receipt (Copy)",
          `Receipt for hire ${hire._id}`,
          [{ filename: `receipt-${hire._id}.pdf`, content: pdfBuffer }]
        );
      }

      res.json({ message: "Receipt sent successfully" });
    });

    // 👉 PDF Content
    doc.fontSize(22).text("Car Hire Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt No: ${hire._id}`);
    doc.text(`Date: ${new Date(hire.createdAt).toLocaleString()}`);
    doc.text(`Status: ${hire.status}`);
    doc.moveDown();

    doc.fontSize(16).text("Car Details", { underline: true });
    hire.items.forEach(item => {
      doc.moveDown(0.5);
      doc.fontSize(12).text(`${item.carId.brand} ${item.carId.model} (${item.carId.year})`);
      doc.text(
        `Reg: ${item.carId.registrationNumber} | ${item.carId.transmission}, ${item.carId.fuelType} | ${item.carId.color}, ${item.carId.seats} Seats`
      );
      doc.text(
        `Pickup: ${item.carId.pickupLocation} | Dropoff: ${item.carId.dropoffOptions?.[0] || "Not specified"}`
      );
      doc.text(`Price: Ksh ${item.totalPrice}`, { align: "right" });
    });

    doc.moveDown();
    doc.fontSize(16).text("Payment Summary", { underline: true });
    doc.fontSize(12).text(`Total Amount: Ksh ${hire.totalAmount}`);
    doc.text(`Payment Method: ${hire.payment.method}`);
    doc.text(`Payment Status: ${hire.payment.status}`);

    doc.moveDown(2);
    doc.fontSize(10).text("Thank you for choosing our service.", { align: "center" });
    doc.fontSize(10).text("For inquiries, contact support@mycars.com", { align: "center" });

    doc.end(); // Finalize PDF
  } catch (err) {
    console.error("Send receipt error:", err);
    res.status(500).json({ error: err.message || "Failed to send receipt" });
  }
});

module.exports = router;
