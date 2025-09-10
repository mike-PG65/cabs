import { ShoppingCart, User, Search } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">ShopEase</span>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Right: Nav + Icons */}
          <div className="flex items-center space-x-6">
            <a href="/" className="hidden sm:inline text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="/shop" className="hidden sm:inline text-gray-700 hover:text-blue-600">
              Shop
            </a>
            <a href="/categories" className="hidden sm:inline text-gray-700 hover:text-blue-600">
              Categories
            </a>

            {/* Cart */}
            <div className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                3
              </span>
            </div>

            {/* User */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
              <User className="w-6 h-6" />
              <span className="hidden sm:inline">Login</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
