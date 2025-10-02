import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, editCartDates, removeFromCart, clearCart } from "../redux/cartSlice";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector(state => state.cart);

  const [dates, setDates] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleDateChange = (carId, field, value) => {
    setDates(prev => ({
      ...prev,
      [carId]: { ...prev[carId], [field]: value }
    }));
  };

  const handleUpdateDates = async (carId) => {
    const { startDate, endDate } = dates[carId] || {};
    if (!startDate || !endDate) {
      setMessage({ text: "Please select both start and end dates.", type: "error" });
      return;
    }

    try {
      await dispatch(editCartDates({ carId, startDate, endDate })).unwrap();
      setMessage({ text: "Dates updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: err || "Failed to update dates.", type: "error" });
    }
  };

  const handleRemove = async (carId) => {
    try {
      await dispatch(removeFromCart(carId)).unwrap();
      setMessage({ text: "Car removed from cart.", type: "success" });
    } catch (err) {
      setMessage({ text: err.error || "Failed to remove car.", type: "error" });
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      setMessage({ text: "Cart cleared successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: err || "Failed to clear cart.", type: "error" });
    }
  };

  const handleProceed = () => {
    navigate("/hire", { state: { items } });
  };

  if (loading) return <div className="p-6">Loading cart...</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {message.text && (
        <div
          className={`relative p-4 border rounded flex items-center justify-between ${message.type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
            }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            className="ml-4 text-gray-600 hover:text-gray-800"
            aria-label="Close"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="p-4 bg-white rounded shadow text-center">
          Your cart is empty
        </div>
      )}

      {items.map(item => (
        <div
          key={item.carId._id}
          className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow p-4 gap-4"
        >
          {/* Car Image */}
          <img
            src={item.carId.imageUrls?.[0] || "https://via.placeholder.com/150"}
            alt={`${item.carId.brand} ${item.carId.model}`}
            className="w-full md:w-48 h-40 object-cover rounded-lg"
          />

          {/* Car Details */}
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold">
              {item.carId.brand} {item.carId.model}
            </h3>
            <p className="text-gray-500">Price/day: KES {item.pricePerDay}</p>

            {/* Date Inputs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
              <input
                type="date"
                value={dates[item.carId._id]?.startDate || ""}
                onChange={e => handleDateChange(item.carId._id, "startDate", e.target.value)}
                className="border p-2 rounded w-full sm:w-40"
                min={new Date().toISOString().split("T")[0]}
              />
              <input
                type="date"
                value={dates[item.carId._id]?.endDate || ""}
                onChange={e => handleDateChange(item.carId._id, "endDate", e.target.value)}
                className="border p-2 rounded w-full sm:w-40"
                min={new Date().toISOString().split("T")[0]}
              />
              <button
                onClick={() => handleUpdateDates(item.carId._id)}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition w-full sm:w-auto"
              >
                Update Dates
              </button>
            </div>

            <p className="mt-3 font-medium">Total: KES {item.totalPrice || 0}</p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => handleRemove(item.carId._id)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-full md:w-auto"
          >
            Remove
          </button>
        </div>
      ))}

      {items.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleClearCart}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Clear Cart
          </button>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Proceed to Hire
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
