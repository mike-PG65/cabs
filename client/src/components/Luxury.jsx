// Luxury.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCars } from "../redux/carSlice";
import AddToCart from "./AddToCart";
import View from "./View";
import { AiOutlineClose } from "react-icons/ai";

const Luxury = ({ category }) => {
  const [message, setMessage] = React.useState({ text: "", type: "" });

  const dispatch = useDispatch();
  const { list: cars = [], error, loading } = useSelector(
    (state) => state.cars || {}
  );

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  const filteredCars = cars.filter((car) => car.category === category);

  if (loading) return <div className="p-6">Loading cars...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {category} Cars 🚗
      </h2>

      {/* ✅ Success & Error Message */}
      {message.text && (
  <div
    className={`relative p-4 border rounded flex items-center justify-between ${
      message.type === "success"
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

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition p-4 flex flex-col"
            >
              {/* Image */}
              {car.imageUrls?.length > 0 ? (
                <img
                  src={car.imageUrls[0]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {/* Info */}
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-gray-500">{car.year}</p>
              <p className="text-sm text-gray-500 mb-2">
                {car.transmission} • {car.fuelType}
              </p>

              {/* 🚦 Availability */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3
                  ${
                    car.availabilityStatus === "Available"
                      ? "bg-green-100 text-green-700"
                      : car.availabilityStatus === "Booked"
                      ? "bg-yellow-100 text-yellow-700"
                      : car.availabilityStatus === "In Service"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
              >
                {car.availabilityStatus}
              </span>

              {/* Price */}
              <div className="mt-auto mb-3">
                <p className="text-green-600 font-bold text-lg">
                  KES {car.pricePerDay} / day
                </p>
                <p className="text-xs text-gray-400">
                  Pickup: {car.pickupLocation}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <View car={car} />
                <AddToCart car={car} onMessage={setMessage} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Luxury;
