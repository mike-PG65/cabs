import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function HirePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Cars passed from cart
  const items = location.state?.items || [];
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Calculate total
  const calculateTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!item.startDate || !item.endDate) return acc;

      const start = new Date(item.startDate);
      const end = new Date(item.endDate);

      if (isNaN(start) || isNaN(end)) return acc;

      const days = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
      return acc + item.pricePerDay * days;
    }, 0);
  }, [items]);

  // ✅ Handle hire request
  const handleHire = async () => {
    if (!items.length) {
      setMessage("Your hire cart is empty!");
      return;
    }

    const hireData = {
      items: items.map((item) => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const days = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));

        return {
          carId: item.carId?._id || item._id,
          startDate: item.startDate,
          endDate: item.endDate,
          pricePerDay: item.pricePerDay,
          totalPrice: item.pricePerDay * days,
        };
      }),
      totalAmount: calculateTotal,
      payment: { method: paymentMethod },
    };

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const res = await axios.post("/api/hire", hireData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message || "Hire created successfully!");
      setTimeout(() => navigate("/my-hires"), 1500);
    } catch (error) {
      console.error("Hire error:", error);
      setMessage("❌ Failed to create hire. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Confirm Your Hire</h2>

      {/* Selected Cars */}
      <div className="space-y-4 mb-6">
        {items.length ? (
          items.map((car, i) => {
            const start = new Date(car.startDate);
            const end = new Date(car.endDate);
            const days =
              !isNaN(start) && !isNaN(end)
                ? Math.max(1, (end - start) / (1000 * 60 * 60 * 24))
                : 0;
            const subtotal = car.pricePerDay * days;

            return (
              <div
                key={i}
                className="flex items-start gap-4 border p-4 rounded-lg shadow-sm"
              >
                {/* Car Image (first image from array) */}
                <img
                  src={car.carId.imageUrls?.[0] || "/placeholder-car.jpg"}
                  alt={`${car.carId.brand} ${car.carId.model}`}
                  className="w-40 h-28 object-cover rounded-lg"
                />

                {/* Car Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {car.carId.brand} {car.carId.model}
                  </h3>
                  <p className="text-gray-600">Ksh {car.pricePerDay} / day</p>

                  {car.startDate && car.endDate ? (
                    <p className="text-sm text-gray-700 mt-1">
                      From <span className="font-medium">{start.toLocaleDateString()}</span> 
                      {" "}to{" "} 
                      <span className="font-medium">{end.toLocaleDateString()}</span>
                      {" "}({days} day{days > 1 ? "s" : ""})
                    </p>
                  ) : (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠ No dates selected for this car
                    </p>
                  )}

                  <p className="mt-2 font-medium">
                    Subtotal:{" "}
                    <span className="text-blue-600">Ksh {subtotal}</span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center">No cars selected</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Payment Method:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="cash">Cash</option>
          <option value="mpesa">Mpesa</option>
        </select>
      </div>

      {/* Total */}
      <div className="mb-6 text-right text-xl font-bold">
        Total Amount:{" "}
        <span className="text-green-600">Ksh {calculateTotal}</span>
      </div>

      {/* Hire Button */}
      <div className="text-center">
        <button
          onClick={handleHire}
          disabled={loading || !items.length}
          className={`px-6 py-3 rounded-lg text-white text-lg font-medium ${
            loading || !items.length
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : "Confirm Hire"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-6 text-center ${
            message.startsWith("❌") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
