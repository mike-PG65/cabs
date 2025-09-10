// CarDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddToCart from "./AddToCart";
import HireNow from "./HireNow";

const CarDetails = () => {
  const { id } = useParams(); // get car id from URL
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`http://localhost:4051/api/cars/${id}`); 
        setCar(res.data);
      } catch (err) {
        setError("Failed to fetch car details");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (loading) return <div className="p-6">Loading car details...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!car) return <div className="p-6">Car not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Car Title */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        {car.brand} {car.model} ({car.year})
      </h2>

      {/* Car Image */}
      <div className="w-full max-w-3xl mb-6">
        {car.imageUrls?.length > 0 ? (
          <img
            src={car.imageUrls[0]}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-80 object-cover rounded-lg shadow"
          />
        ) : (
          <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg">
            No Image
          </div>
        )}
      </div>

      {/* Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Specifications</h3>
          <ul className="text-gray-600 space-y-1">
            <li>Fuel: {car.fuelType}</li>
            <li>Transmission: {car.transmission}</li>
            <li>Engine Capacity: {car.engineCapacity || "N/A"}</li>
            <li>Mileage: {car.mileage} km</li>
            <li>Seats: {car.seats}</li>
            <li>Doors: {car.doors}</li>
            <li>Color: {car.color}</li>
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Rental Info</h3>
          <ul className="text-gray-600 space-y-1">
            <li>Price per Day: <span className="font-bold text-green-600">KES {car.pricePerDay}</span></li>
            <li>Deposit Required: KES {car.depositRequired}</li>
            <li>Status: 
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium 
                ${car.availabilityStatus === "Available"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"}`}>
                {car.availabilityStatus}
              </span>
            </li>
            <li>Pickup Location: {car.pickupLocation}</li>
          </ul>
        </div>
      </div>

      {/* Features */}
     <div className="bg-white shadow rounded-lg p-4 mb-8">
  <h3 className="font-semibold text-lg mb-2">Features</h3>
  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600">
    <li>{car.features?.gps ? "✅ GPS" : "❌ GPS"}</li>
    <li>{car.features?.bluetooth ? "✅ Bluetooth" : "❌ Bluetooth"}</li>
    <li>{car.features?.usbSupport ? "✅ USB Support" : "❌ USB Support"}</li>
    <li>{car.features?.childSeatAvailable ? "✅ Child Seat" : "❌ Child Seat"}</li>
    <li>{car.features?.insuranceIncluded ? "✅ Insurance Included" : "❌ Insurance Included"}</li>

    {/* Extras (show all, even if none are available) */}
    {car.features?.extras?.length > 0 ? (
      car.features.extras.map((extra, idx) => (
        <li key={idx}>✅ {extra}</li>
      ))
    ) : (
      <li>❌ No Extras</li>
    )}
  </ul>
</div>

      {/* Actions */}
      <div className="flex gap-4">
        <AddToCart car={car} />
        <HireNow />
        
      </div>
    </div>
  );
};

export default CarDetails;
