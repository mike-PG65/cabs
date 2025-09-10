import { useNavigate } from "react-router-dom"

const View = ({car}) => {
    const navigate = useNavigate()
    const handleView = (car) => {
    navigate(`/cardetails/${car._id}`)
  }
    return (
        <button
            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition"
            onClick={() => handleView(car)}
        >
            View
        </button>
    )
}

export default View