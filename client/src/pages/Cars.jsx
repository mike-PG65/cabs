// CarPage.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCars } from "../redux/carSlice";
import AddToCart from "../components/AddToCart";
import View from "../components/View";

const CarPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { list: cars, loading, error } = useSelector((state) => state.cars);

  useEffect(() => {
    if (!cars || cars.length === 0) {
      dispatch(fetchCars());
    }
  }, [dispatch, cars]);

  const car = cars.find((c) => c._id === id);

  if (loading) return <div className="p-10 text-center">Loading car...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!car) return <div className="p-10 text-center text-gray-600">Car not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Image */}
      <div className="bg-white shadow-md">
        <img
          src={car.imageUrls?.[0] || "/placeholder-car.jpg"}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-96 object-cover rounded-b-2xl"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Car Info */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {car.brand} {car.model}
          </h1>
          <p className="text-gray-500 text-lg mb-4">{car.year}</p>

          {/* Availability */}
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-6 ${
              car.availabilityStatus === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {car.availabilityStatus}
          </span>

          {/* Price */}
          <p className="text-3xl font-extrabold text-blue-600 mb-6">
            KES {car.pricePerDay} / day
          </p>

          {/* Car Specs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="font-semibold">Transmission</p>
              <p className="text-gray-600">{car.transmission}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="font-semibold">Fuel</p>
              <p className="text-gray-600">{car.fuelType}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="font-semibold">Seats</p>
              <p className="text-gray-600">{car.seats || "N/A"}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">
            {car.description ||
              "This car is perfect for both city rides and long trips. Enjoy comfort, safety, and style with every drive."}
          </p>
        </div>

        {/* Booking Sidebar */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Book This Car</h2>
          <AddToCart car={car} />
          <View car={car} />
          <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Book Now
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Pickup at: {car.pickupLocation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarPage;
