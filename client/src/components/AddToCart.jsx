import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

const AddToCart = ({ car, onMessage }) => {

  const dispatch = useDispatch();

const handleAdd = async () => {
    try {
      await dispatch(addToCart({ carId: car._id })).unwrap();
      onMessage?.({ text: `${car.brand} ${car.model} added to cart!`, type: "success" });
    } catch (err) {
      onMessage?.({ text: err, type: "error" });
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={car.availabilityStatus !== "Available"}
      className={`flex-1 py-2 px-3 rounded-lg text-sm transition 
        ${car.availabilityStatus === "Available"
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
    >
      Add to Cart
    </button>
  );
};

export default AddToCart;
