import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // for close icon
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const AuthForm = ({mode}) => {
  const [isLogin, setIsLogin] = useState(mode === "login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
   const navigate = useNavigate();

   const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // ✅ Frontend validation
    if (!email || !password || (!isLogin && (!fullName || !confirmPassword))) {
      setError("⚠️ Please fill in all required fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    try {
      const endpoint = isLogin
        ? `${API_BASE_URL}/api/auth/login`
        : `${API_BASE_URL}/api/auth/register`;

      const payload = isLogin
        ? { email, password }
        : { fullName, email, password, confirmPassword, phoneNumber };


      const res = await axios.post(endpoint, payload);

      dispatch(
      setCredentials({
        token: res.data.token,
        userId: res.data.user.id, // backend sends this
      })
    );

      setSuccess(`${isLogin ? "Login" : "Registration"} successful ✅`);
      navigate('/categories')
      console.log(res.data);
    } catch (err) {
      console.error("Error:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Something went wrong ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 px-4 relative">
      {/* ✅ Toast container */}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between"
            >
              <span>{success}</span>
              <button onClick={() => setSuccess("")} className="ml-3">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError("")} className="ml-3">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          {isLogin ? "Welcome Back 👋" : "Create an Account 📝"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"

              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"

          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"

          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"

            />
          )}

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition duration-300"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);

              setFullName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setPhoneNumber("");

            }

            }
            className="text-teal-600 font-semibold hover:underline"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
