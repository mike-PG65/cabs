import React from "react";

export default function PrintableReceipt({ hire }) {
  if (!hire) return <p>Loading receipt...</p>;

  console.log(hire)
  console.log(hire.userId?.name)

  return (
    <div className="p-12 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 space-y-8 font-sans">
      {/* Company Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">Jeffika Cabs</h1>
          <p className="text-sm text-gray-500">Receipt</p>
          <p className="text-sm text-gray-500">Date: {new Date(hire.createdAt).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Hire ID: {hire._id}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
              hire.status === "confirmed"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
            }`}
          >
            {hire.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Customer / Hire Details */}
      <div className="space-y-2 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Customer & Hire Details</h2>
        <p className="text-sm">Name: {hire.userId?.name || "N/A"}</p>
        <p className="text-sm">Email: {hire.userId?.email || "N/A"}</p>
        <p className="text-sm">Phone: {hire.userId?.phoneNumber || "N/A"}</p>
      </div>

      {/* Car Details Table */}
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Car Details</h2>
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-3 text-left">Car Info</th>
              <th className="border p-3 text-center">Pickup Location</th>
              <th className="border p-3 text-center">Dropoff Location</th>
              <th className="border p-3 text-right">Price (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            {hire.items.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="border p-3">
                  <div className="font-semibold">
                    {item.carId.brand} {item.carId.model} ({item.carId.year})
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Reg: {item.carId.registrationNumber} | {item.carId.transmission}, {item.carId.fuelType} | {item.carId.color}, {item.carId.seats} Seats
                  </div>
                </td>
                <td className="border p-3 text-center">{item.carId.pickupLocation}</td>
                <td className="border p-3 text-center">{item.carId.dropoffOptions?.[0] || "Not specified"}</td>
                <td className="border p-3 text-right font-medium text-gray-800">{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex justify-between items-center">
        <span className="text-lg font-semibold">Total Amount</span>
        <span className="text-2xl font-bold text-gray-900">Ksh {hire.totalAmount.toLocaleString()}</span>
      </div>

      {/* Payment Method / Status */}
      <div>
        {hire.payment.method === "cash" ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <p className="font-semibold text-lg">💵 Cash Payment</p>
            {hire.payment.status === "completed" ? (
              <p className="text-sm">Cash payment has been confirmed.</p>
            ) : (
              <p className="text-sm">Please pay in cash at the pickup location.</p>
            )}
          </div>
        ) : hire.payment.method === "mpesa" ? (
          hire.payment.status === "completed" ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <p className="font-semibold text-lg">✅ Mpesa Payment Successful</p>
              <p className="text-sm">
                Transaction ID: <span className="font-mono font-bold">{hire.payment.transactionId}</span>
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <p className="font-semibold text-lg">⚠ Mpesa Payment Pending</p>
              <p className="text-sm">Awaiting confirmation from M-Pesa.</p>
            </div>
          )
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
            <p className="text-sm">Unknown payment method.</p>
          </div>
        )}
      </div>

      {/* Footer / Company Info */}
      <div className="pt-6 text-center text-gray-500 text-sm border-t space-y-1">
        <p>Thank you for choosing Jeffika Cabs.</p>
        <p>For inquiries, contact <span className="font-medium text-gray-700">support@jeffika.com</span></p>
        <p className="text-xs text-gray-400">This is a computer-generated receipt and does not require a signature.</p>
      </div>
    </div>
  );
}
