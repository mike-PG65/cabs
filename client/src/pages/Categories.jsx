import Luxury from "../components/Luxury";

const Categories = () => {
  const categories = ["SUV", "Sedan", "Luxury", "Van", "Electric"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Car Categories 🚘
      </h1>

      {/* Each category block */}
      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat} className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
              {cat} Cars
            </h2>
            {/* Reuse your Available component */}
            <Luxury category={cat} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
