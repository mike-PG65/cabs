const express = require("express");
const Cart = require("../models/Cart");
const Hire = require("../models/Hire");
const Car = require("../models/Cars"); // ✅ import Car model
const authMiddleware = require("../middleware/auth");
const { stkPush } = require("../services/mpesa");
const { sendEmail } = require("../utils/sendEmail");
const puppeteer = require("puppeteer");
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

    // Build styled HTML
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; font-size: 28px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f4f4f4; text-align: left; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 10px; font-weight: bold; }
            .confirmed { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
            .pending { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>Car Hire Receipt</h1>
          <p><b>Date:</b> ${new Date(hire.createdAt).toLocaleString()}</p>
          <p><b>Hire ID:</b> ${hire._id}</p>
          <p><b>Status:</b> 
            <span class="status ${hire.status === 'confirmed' ? 'confirmed' : 'pending'}">
              ${hire.status}
            </span>
          </p>

          <h2>Car Details</h2>
          <table>
            <thead>
              <tr>
                <th>Car Info</th>
                <th>Price (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              ${hire.items.map(item => `
                <tr>
                  <td>
                    <b>${item.carId.brand} ${item.carId.model} (${item.carId.year})</b><br/>
                    Reg: ${item.carId.registrationNumber} | ${item.carId.transmission}, ${item.carId.fuelType} | ${item.carId.color}, ${item.carId.seats} Seats<br/>
                    Pickup: ${item.carId.pickupLocation} | Dropoff: ${item.carId.dropoffOptions?.[0] || 'Not specified'}
                  </td>
                  <td style="text-align:right;">${item.totalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Payment Summary</h2>
          <p><b>Total Amount:</b> Ksh ${hire.totalAmount}</p>
          <p><b>Payment Method:</b> ${hire.payment.method} (${hire.payment.status})</p>

          <div class="footer">
            Thank you for choosing our service.<br/>
            For inquiries, contact support@mycars.com
          </div>
        </body>
      </html>
    `;

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // Send to user
    await sendEmail(
      user.email,
      "Your Car Hire Receipt",
      "Please find attached your receipt.",
      [
        { filename: `receipt-${hire._id}.pdf`, content: pdfBuffer }
      ]
    );

    // Optional admin copy
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        "New Hire Receipt (Copy)",
        `Receipt for hire ${hire._id}`,
        [
          { filename: `receipt-${hire._id}.pdf`, content: pdfBuffer }
        ]
      );
    }

    res.json({ message: "Receipt sent successfully" });

  } catch (err) {
    console.error("Send receipt error:", err.message);
    res.status(500).json({
    error: err.message || "Failed to send receipt",
    details: err.stack || err });
  }
});

module.exports = router;
