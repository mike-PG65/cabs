const axios = require("axios");
const Hire = require("../models/Hire");

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_SHORTCODE || "174379";
const passkey = process.env.MPESA_PASSKEY;

// ✅ Add this function
async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

async function stkPush(amount, phone, hireId) {
  const token = await getAccessToken(); // now defined

  // Normalize phone number
  let normalizedPhone = phone.toString().trim();
  normalizedPhone = normalizedPhone.replace(/[\s-]/g, ""); // remove spaces/dashes

  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "254" + normalizedPhone.substring(1);
  } else if (normalizedPhone.startsWith("+")) {
    normalizedPhone = normalizedPhone.substring(1);
  }

  console.log("📲 STK Push phone:", normalizedPhone, "amount:", amount);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: normalizedPhone,
    PartyB: shortCode,
    PhoneNumber: normalizedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: hireId.toString(),
    TransactionDesc: "Hire Payment",
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.CheckoutRequestID) {
      await Hire.findByIdAndUpdate(hireId, {
        "payment.transactionId": response.data.CheckoutRequestID,
      });
    }

    return response.data;
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { stkPush };
