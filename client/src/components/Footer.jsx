import React from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">CarHire</h3>
          <p>Affordable and reliable car hire services in Kenya.</p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Quick Links</h3>
          <ul>
            <li>
              <button onClick={() => navigate("/")} className="hover:text-white">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/cars")} className="hover:text-white">
                Cars
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/contact")} className="hover:text-white">
                Contact
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Contact Us</h3>
          <p>Email: support@carhire.com</p>
          <p>Phone: +254 700 123 456</p>
        </div>
      </div>
      <div className="text-center mt-6 text-gray-500">
        © {new Date().getFullYear()} CarHire. All rights reserved.
      </div>
    </footer>
  );
}
