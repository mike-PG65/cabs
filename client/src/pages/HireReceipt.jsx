import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

export default function HireReceipt() {
  const { hireId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [hire, setHire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" }); // <-- success/error messages

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchHire = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/hire/${hireId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHire(res.data.hire);
      } catch (err) {
        console.error("Fetch hire error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to fetch hire");
      } finally {
        setLoading(false);
      }
    };

    if (hireId && token) fetchHire();
  }, [hireId, token]);

  // Print only the receipt
  const handlePrint = () => {
    window.print();
  };

  // Call backend to send receipt via email
const handleSendEmail = async () => {
  console.log("📨 Send email clicked");
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/hire/${hireId}/send-receipt`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Send email response:", res.data);

    // ✅ Show success message
    setMessage({ type: "success", text: "📧 Receipt sent to your email and admin!" });

    // ✅ Download the PDF locally
    if (res.data.pdf) {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${res.data.pdf}`;
      link.download = res.data.filename || "receipt.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error("❌ Send receipt error:", err.response?.data || err.message);
    setMessage({ type: "error", text: "❌ Failed to send receipt" });
  }

  // Clear message after 5 seconds
  setTimeout(() => setMessage({ type: "", text: "" }), 5000);
};


  if (loading)
    return <p className="text-gray-600 text-center">Loading hire receipt...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div>
      {/* Print-only CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Receipt Content */}
      <div
        id="receipt-content"
        className="p-12 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 space-y-10"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-800">
              Car Hire Receipt
            </h1>
            <p className="text-sm text-gray-500">
              Date: {new Date(hire.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Hire ID: {hire._id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
            <span
              className={`inline-block px-5 py-2 rounded-full text-base font-bold tracking-wide shadow-sm ${
                hire.status === "confirmed"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-300"
              }`}
            >
              {hire.status}
            </span>
          </div>
        </div>

        {/* Cars Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-700">Car Details</h2>
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                <th className="p-4 border">Car Info</th>
                <th className="p-4 border text-right">Price (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              {hire.items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-4 border text-sm leading-relaxed">
                    <div className="font-semibold">
                      {item.carId.brand} {item.carId.model} ({item.carId.year})
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      Reg: {item.carId.registrationNumber} |{" "}
                      {item.carId.transmission}, {item.carId.fuelType} |{" "}
                      {item.carId.color}, {item.carId.seats} Seats
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      Pickup: {item.carId.pickupLocation} | Dropoff:{" "}
                      {item.carId.dropoffOptions?.[0] || "Not specified"}
                    </div>
                  </td>
                  <td className="p-4 border text-right font-medium text-gray-800">
                    {item.totalPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-700">Payment Summary</h2>
          <div className="flex justify-between items-center bg-gray-50 p-6 rounded-lg border">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">
              Ksh {hire.totalAmount}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          {hire.payment.method === "cash" ? (
            <div className="p-6 bg-blue-50 rounded-lg text-blue-800 border border-blue-200 space-y-2">
              <p className="text-xl font-semibold">💵 Cash Payment</p>
              {hire.payment.status === "completed" ? (
                <p className="text-sm">Cash payment has been confirmed.</p>
              ) : (
                <p className="text-sm">Please pay in cash at the pickup location.</p>
              )}
            </div>
          ) : hire.payment.method === "mpesa" ? (
            hire.payment.status === "completed" ? (
              <div className="p-6 bg-green-50 rounded-lg text-green-800 border border-green-200 space-y-2">
                <p className="text-xl font-semibold">
                  ✅ Mpesa Payment Successful
                </p>
                <p className="text-sm">
                  Receipt No:{" "}
                  <span className="font-mono font-bold">
                    {hire.payment.transactionId}
                  </span>
                </p>
              </div>
            ) : (
              <div className="p-6 bg-yellow-50 rounded-lg text-yellow-800 border border-yellow-200 space-y-2">
                <p className="text-xl font-semibold">⚠ Mpesa Payment Pending</p>
                <p className="text-sm">Awaiting confirmation from M-Pesa.</p>
              </div>
            )
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg text-gray-600 border border-gray-200">
              <p className="text-sm">Unknown payment method.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 text-center text-gray-500 text-sm border-t">
          Thank you for choosing our service. For inquiries, contact{" "}
          <span className="font-medium text-gray-700">support@mycars.com</span>
        </div>
      </div>

      {/* Action Buttons (hidden on print) */}
      <div className="flex flex-col items-center gap-4 mt-8 no-print">
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700"
          >
            🖨 Print
          </button>
          <button
            onClick={handleSendEmail}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500"
          >
            📧 Send to Email
          </button>
        </div>

        {/* Success / Error messages */}
        {message.text && (
          <p
            className={`mt-2 text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
