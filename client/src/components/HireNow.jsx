import { Link } from "react-router-dom"

const HireNow = ({car}) => {
  return (
   <Link>
   <button className={`text-white py-2 px-4 rounded-lg transition
                            ${car.availabilityStatus === "Available"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={car.availabilityStatus !== "Available"}>
          Hire Now
        </button>
   </Link>
  )
}

export default HireNow