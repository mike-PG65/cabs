const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Add optional attachments parameter
async function sendEmail(to, subject, html, attachments = []) {
  const mailOptions = {
    from: `"My Cars" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments, // <-- support attachments
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
