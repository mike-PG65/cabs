import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

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

    // 🔎 Filter cars
    const filteredCars = cars.filter(
        (car) =>
            car.brand.toLowerCase().includes(search.toLowerCase()) ||
            car.model.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 text-white py-32 px-6 text-center">
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 max-w-5xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
                        Drive Your Dream Car 🚘
                    </h1>
                    <p className="text-lg md:text-2xl mb-10 text-gray-200">
                        Premium rentals, affordable prices, unforgettable experiences.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto flex bg-white rounded-lg shadow-lg overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search by brand or model..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 px-4 py-3 text-gray-700 focus:outline-none"
                        />
                        <button
                            className="px-6 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories */}

            <section className="max-w-7xl mx-auto py-20 px-6">
                <h2 className="text-4xl font-extrabold text-center mb-14 text-gray-800">
                    Browse by Category
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { name: "SUV", img: "/images/suv.jpg", desc: "Spacious & powerful", icon: "🚙" },
                        { name: "Sedan", img: "/images/sedan.jpg", desc: "Comfort & style", icon: "🚗" },
                        { name: "Luxury", img: "/images/luxury.jpg", desc: "Drive in elegance", icon: "✨" },
                        { name: "Electric", img: "/images/electric.jpg", desc: "Eco-friendly ride", icon: "⚡" },
                    ].map((cat) => (
                        <div
                            key={cat.name}
                            onClick={() => navigate(`/cars?category=${cat.name.toLowerCase()}`)}
                             className="min-w-[280px] cursor-pointer group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300"
                             >
                            {/* Background Image */}
                            <img
                                src={cat.img}
                                alt={cat.name}
                                className="w-full h-56 object-cover transform group-hover:scale-110 transition duration-500"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5">
                                <h3 className="text-white text-2xl font-bold mb-1 flex items-center gap-2">
                                    <span>{cat.icon}</span> {cat.name}
                                </h3>
                                <p className="text-gray-300 text-sm">{cat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>




            {/* Featured/Search Results */}
            <section className="max-w-7xl mx-auto py-16 px-6 flex-1">
                <h2 className="text-3xl font-bold text-center mb-12">
                    {search ? "Search Results" : "Featured Cars"}
                </h2>

                {loading && <p className="text-center">Loading cars...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && filteredCars.length === 0 && (
                    <p className="text-center text-gray-500">
                        {search ? "No cars match your search." : "No cars available right now."}
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCars.slice(0, 6).map((car) => (
                        <div
                            key={car._id}
                            className="bg-white rounded-xl shadow hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden flex flex-col"
                        >
                            <img
                                src={car.imageUrls?.[0] || "/placeholder-car.jpg"}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                    {car.brand} {car.model}
                                </h3>
                                <p className="text-gray-500 mb-2">{car.year}</p>

                                <p className="text-blue-600 font-extrabold text-xl mb-4">
                                    KES {car.pricePerDay} / day
                                </p>

                                {/* Quick Specs */}
                                <div className="grid grid-cols-3 gap-3 text-center text-sm mb-4">
                                    <div className="bg-gray-100 p-2 rounded">
                                        <p className="font-semibold">⚙️</p>
                                        <p>{car.transmission}</p>
                                    </div>
                                    <div className="bg-gray-100 p-2 rounded">
                                        <p className="font-semibold">⛽</p>
                                        <p>{car.fuelType}</p>
                                    </div>
                                    <div className="bg-gray-100 p-2 rounded">
                                        <p className="font-semibold">💺</p>
                                        <p>{car.seats || "N/A"}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/cardetails/${car._id}`)}
                                    className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCars.length > 6 && (
                    <div className="text-center mt-10">
                        <button
                            onClick={() => navigate("/cars")}
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            View All Cars
                        </button>
                    </div>
                )}
            </section>

            {/* Why Choose Us */}
            <section className="bg-gray-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-10 text-center">
                    {[
                        {
                            title: "🚀 Easy Booking",
                            desc: "Book your car in just a few clicks with our seamless system.",
                        },
                        {
                            title: "💰 Affordable Rates",
                            desc: "Get the best deals without compromising on quality.",
                        },
                        {
                            title: "📞 24/7 Support",
                            desc: "We’re here anytime you need help or roadside assistance.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition"
                        >
                            <h3 className="text-2xl font-bold text-blue-600 mb-3">
                                {item.title}
                            </h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-blue-600 text-white py-20 text-center">
                <h2 className="text-4xl font-bold mb-4">Ready to hit the road?</h2>
                <p className="mb-8 text-lg">
                    Choose from our wide selection of cars and start your journey today.
                </p>
                <button
                    onClick={() => navigate("/cars")}
                    className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
                >
                    Get Started
                </button>
            </section>
        </div>
    );
}
