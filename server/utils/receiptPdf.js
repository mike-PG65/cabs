const PDFDocument = require("pdfkit");

async function buildHireReceiptPDF(hire) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // PDF Content
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
        doc.text(`Reg: ${item.carId.registrationNumber} | ${item.carId.transmission}, ${item.carId.fuelType}`);
        doc.text(`${item.carId.color}, ${item.carId.seats} Seats`);
        doc.text(`Pickup: ${item.carId.pickupLocation} | Dropoff: ${item.carId.dropoffOptions?.[0] || "Not specified"}`);
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

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { buildHireReceiptPDF };
