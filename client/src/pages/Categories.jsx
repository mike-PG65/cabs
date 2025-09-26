import Luxury from "../components/Luxury";

const Categories = () => {
  const categories = ["SUV", "Sedan", "Luxury", "Van", "Electric"];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {categories.map((cat) => (
          <section
            key={cat}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 p-6"
          >
            {/* Category Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
              {cat} Cars
            </h2>

            {/* Car List */}
            <Luxury category={cat} />
          </section>
        ))}
      </div>
    </div>
  );
};

export default Categories;