const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html, pdfBuffer = null) {
  try {
    const emailData = {
      from: "My Cars <noreply@mycars.com>", // must match a verified Resend domain
      to,
      subject,
      html, // use HTML instead of plain text for better formatting
    };

    // Only add attachment if a PDF buffer is provided
    if (pdfBuffer) {
      emailData.attachments = [
        {
          filename: "receipt.pdf",
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
        },
      ];
    }

    const response = await resend.emails.send(emailData);
    console.log("✅ Email sent:", response.id || response);
    return response;
  } catch (err) {
    console.error("❌ Resend error:", err.message);
    throw err;
  }
}

module.exports = { sendEmail };
