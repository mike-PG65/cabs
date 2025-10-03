const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // you can also use host/port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password (not normal Gmail password)
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
    console.error("❌ Email send error:", err);
    throw err;
  }
}

module.exports = { sendEmail };
