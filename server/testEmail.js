const { sendEmail } = require("./sendEmail");

(async () => {
  try {
    const info = await sendEmail(
      "mikepg001@gmail.com",          // send to yourself
      "Test Email from Node.js",      // subject
      "<h1>Hello!</h1><p>This is a test email.</p>" // html body
    );
    console.log("✅ Test email sent:", info.response);
  } catch (err) {
    console.error("❌ Test email failed:", err);
  }
})();