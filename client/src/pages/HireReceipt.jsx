import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import PrintableReceipt from "../components/printableReceipt"; // make sure path is correct

export default function HireReceipt() {
  const { hireId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [hire, setHire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Print the separate printable receipt
  const handlePrint = () => {
    const printContent = document.getElementById("printable-receipt");
    if (!printContent) return;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head>
          <title>Car Hire Receipt</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  if (loading)
    return <p className="text-gray-600 text-center">Loading hire receipt...</p>;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div>
      {/* Your original receipt content */}
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
                <p className="text-xl font-semibold">✅ Mpesa Payment Successful</p>
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

      {/* Hidden separate printable receipt */}
      <div id="printable-receipt" style={{ display: "none" }}>
        <PrintableReceipt hire={hire} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 mt-8 no-print">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700"
        >
          🖨 Print
        </button>
      </div>
    </div>
  );
}
