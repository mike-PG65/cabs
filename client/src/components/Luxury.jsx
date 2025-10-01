// Luxury.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCars } from "../redux/carSlice";
import AddToCart from "./AddToCart";
import View from "./View";
import { AiOutlineClose } from "react-icons/ai";

const Luxury = ({ category }) => {
  const [message, setMessage] = useState({ text: "", type: "" });
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
    <div className="p-6 bg-gray-50 h-full flex flex-col rounded-xl">
      {/* Section Title */}


      {/* ✅ Success & Error Message */}
      {message.text && (
        <div
          className={`relative p-4 rounded-lg shadow-md mb-6 flex items-center justify-between
          ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span className="font-medium">{message.text}</span>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            className="ml-4 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
      )}

      {/* Car Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-white border border-gray-100 rounded-2xl shadow hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden"
            >
              {/* Image */}
              {car.imageUrls?.length > 0 ? (
                <img
                  src={car.imageUrls[0]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-gray-500">{car.year}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {car.transmission} • {car.fuelType}
                </p>

                {/* 🚦 Availability */}
                <span
                  className={`inline-block w-max px-3 py-1 rounded-full text-xs font-medium mb-4
                    ${
                      car.availabilityStatus === "Available"
                        ? "bg-green-100 text-green-700"
                        : car.availabilityStatus === "Booked"
                        ? "bg-yellow-100 text-yellow-700"
                        : car.availabilityStatus === "In Service"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {car.availabilityStatus}
                </span>

                {/* Price */}
                <div className="mt-auto mb-4">
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
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCars.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No cars available in this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default Luxury;
