const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password, not your Google login
  },
});

async function sendEmail(to, subject, html, attachments = []) {
  const mailOptions = {
    from: `"My Cars" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw err;
  }
}

module.exports = { sendEmail };
