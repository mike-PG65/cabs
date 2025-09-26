import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer"; // ✅ new footer file

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("http://localhost:4051/api/cars/list");
        const availableCars = res.data.filter(
          (car) => car.availabilityStatus?.toLowerCase() === "available"
        );
        setCars(availableCars);
      } catch (err) {
        setError("⚠ Failed to load cars. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // 🔎 Filter cars based on search
  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white py-24 px-6 text-center">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            Find Your Perfect Ride 🚗
          </h1>
          <p className="text-lg md:text-2xl mb-8">
            Affordable, reliable, and just a click away.
          </p>
          {/* Search Bar */}
          <div className="max-w-xl mx-auto flex bg-white rounded-lg shadow overflow-hidden">
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-700 focus:outline-none"
            />
            <button
              onClick={() => {}}
              className="px-6 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {["SUV", "Sedan", "Luxury", "Economy"].map((cat) => (
            <div
              key={cat}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer transition transform hover:scale-105"
              onClick={() => navigate(`/cars?category=${cat.toLowerCase()}`)}
            >
              <h3 className="text-xl font-semibold text-blue-600">{cat}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured/Search Results */}
      <section className="max-w-6xl mx-auto py-16 px-6 flex-1">
        <h2 className="text-3xl font-bold text-center mb-10">
          {search ? "Search Results" : "Featured Cars"}
        </h2>

        {loading && <p className="text-center">Loading cars...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && filteredCars.length === 0 && (
          <p className="text-center text-gray-500">
            {search ? "No cars match your search." : "No cars available right now."}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredCars.slice(0, 6).map((car) => (
            <div
              key={car._id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={car.imageUrls?.[0] || "/placeholder-car.jpg"}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-48 object-cover hover:scale-105 transition-transform"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold">
                  {car.brand} {car.model}
                </h3>
                <p className="text-gray-600">{car.year}</p>
                <p className="text-blue-600 font-bold mt-2">
                  KES {car.pricePerDay} / day
                </p>
                <button
                  onClick={() => navigate(`/cars/${car._id}`)}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length > 6 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/cars")}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
            >
              View All Cars
            </button>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              title: "🚀 Easy Booking",
              desc: "Book your car in just a few clicks with our seamless system.",
            },
            {
              title: "💰 Affordable Rates",
              desc: "Get the best deals without compromising quality.",
            },
            {
              title: "📞 24/7 Support",
              desc: "We’re here anytime you need help or roadside assistance.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to book your next adventure?</h2>
        <p className="mb-6 text-lg">
          Choose from our wide selection of cars and hit the road today.
        </p>
        <button
          onClick={() => navigate("/cars")}
          className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
