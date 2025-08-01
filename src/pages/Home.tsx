import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  imageUrls: string[];
}

const Home = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Available Properties</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link
            to={`/properties/${property._id}`}
            key={property._id}
            className="border rounded shadow hover:shadow-lg transition p-4 block"
          >
            <img
              src={property.imageUrls[0] || "https://via.placeholder.com/400"}
              alt={property.title}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <h2 className="text-xl font-semibold">{property.title}</h2>
            <p className="text-gray-600">{property.location}</p>
            <p className="text-green-600 font-bold">${property.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
