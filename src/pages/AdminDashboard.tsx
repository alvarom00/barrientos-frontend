import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this property?"
    );
    if (!confirm) return;

    try {
      await fetch(`http://localhost:3000/api/properties/${id}`, {
        method: "DELETE",
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert("Error deleting property");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Link
        to="/admin/create"
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        + Create New Property
      </Link>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-[#202040]">
              <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                Title
              </th>
              <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                Price
              </th>
              <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                Location
              </th>
              <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property._id}>
                <td className="border p-2">{property.title}</td>
                <td className="border p-2">${property.price}</td>
                <td className="border p-2">{property.location}</td>
                <td className="border p-2 flex gap-2">
                  <Link
                    to={`/admin/edit/${property._id}`}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(property._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
