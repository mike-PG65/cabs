import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 🔹 Redux cart count
  const cartItems = useSelector((state) => state.cart?.items ?? []);
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("http://localhost:4051/api/cars/list");
        setCars(res.data);
      } catch (err) {
        console.error("Failed to fetch cars:", err.message);
      }
    };
    fetchCars();
  }, []);

  // 🔍 Filter cars
  useEffect(() => {
    if (query.trim()) {
      const results = cars.filter(
        (car) =>
          car.brand.toLowerCase().includes(query.toLowerCase()) ||
          car.model.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [query, cars]);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              SwiftRide 🚗
            </Link>
          </div>

          {/* Center: Search (hidden on small) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search cars by brand or model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* 🔽 Dropdown search results */}
            {showResults && (
              <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {filtered.length > 0 ? (
                  filtered.map((car) => (
                    <div
                      key={car._id}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate(`/cardetails/${car._id}`);
                        setQuery("");
                        setShowResults(false);
                      }}
                    >
                      <img
                        src={car.imageUrls[0] || "https://via.placeholder.com/60"}
                        alt={`${car.brand} ${car.model}`}
                        className="w-14 h-10 object-cover rounded mr-3"
                      />
                      <div>
                        <p className="font-medium">
                          {car.brand} {car.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {car.year} • KES {car.pricePerDay}/day
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-2 text-gray-500">No cars found</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Nav + Icons */}
          <div className="flex items-center space-x-6">
            {/* Large screen links */}
            <div className="hidden sm:flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link to="/cars" className="text-gray-700 hover:text-blue-600">
                Cars
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-blue-600">
                Categories
              </Link>
            </div>

            {/* Cart */}
            <Link to="/cart">
              <div className="relative cursor-pointer">
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
                {cartCount >= 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-6 h-6 text-blue-600" />
                <span className="hidden sm:inline font-medium">
                  Hi, {user.fullName}
                </span>
              </div>
            ) : (
              <Link to="/login">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <User className="w-6 h-6" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              </Link>
            )}


            {/* Mobile menu icon */}
            <button
              className="sm:hidden text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200 p-4 space-y-2">
            <Link
              to="/"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/cars"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Cars
            </Link>
            <Link
              to="/categories"
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              Categories
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
