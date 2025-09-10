import React from 'react'

const AddToCart = ({car}) => {
    return (
        <button
            // onClick={() => handleAddToCart(car)}
            disabled={car.availabilityStatus !== "Available"}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition 
                    ${car.availabilityStatus === "Available"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
        >
            Add to Cart
        </button>
    )
}

export default AddToCart