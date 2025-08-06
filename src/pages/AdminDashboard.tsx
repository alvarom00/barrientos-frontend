import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Property {
  _id: string;
  title: string;
  price?: number;
  operationType: string;
  location: string;
}

const PAGE_SIZE = 8; // O el número que prefieras

const AdminDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const [search, setSearch] = useState("");

  // Fetch paginated properties
  useEffect(() => {
  setLoading(true);
  const params = new URLSearchParams();
  params.append("page", currentPage.toString());
  params.append("pageSize", PAGE_SIZE.toString());
  if (search) params.append("search", search);

  fetch(`http://localhost:3000/api/properties?${params}`)
    .then((res) => res.json())
    .then((data) => {
      setProperties(data.properties ?? []);
      setTotal(data.total ?? 0);
    })
    .catch((err) => {
      setProperties([]);
      setTotal(0);
      console.error("Error fetching properties:", err);
    })
    .finally(() => setLoading(false));
}, [currentPage, search]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this property?"
    );
    if (!confirm) return;

    try {
      await fetch(`http://localhost:3000/api/properties/${id}`, {
        method: "DELETE",
      });
      // Actualizar la lista, incluso si borra el último elemento de la página actual
      if (properties.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        setProperties((prev) => prev.filter((p) => p._id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (error) {
      alert("Error deleting property");
    }
  };

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de administrador</h1>
      <Link
        to="/admin/create"
        className="inline-block mb-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        + Crear publicación
      </Link>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar por referencia, título o ubicación..."
          className="w-full sm:w-96 px-3 py-2 border rounded focus:outline-none"
        />
      </div>

      {/* Info paginado */}
      <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">
        {total > 0
          ? `Mostrando ${start}–${end} de ${total} propiedades`
          : loading
          ? "Cargando..."
          : "No se encontraron propiedades"}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-24 text-primary">
            Cargando...
          </div>
        ) : (
          <table className="min-w-full w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-[#202040]">
                <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                  Título
                </th>
                <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                  Precio
                </th>
                <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                  Ubicación
                </th>
                <th className="px-4 py-2 text-gray-900 dark:text-white font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property._id}>
                  <td className="border p-2">{property.title}</td>
                  <td className="border p-2">
                    {property.operationType === "Arrendamiento"
                      ? "A acordar"
                      : property.price
                      ? `$${property.price.toLocaleString()}`
                      : "Sin precio"}
                  </td>
                  <td className="border p-2">{property.location}</td>
                  <td className="border p-2 flex gap-2">
                    <Link
                      to={`/admin/edit/${property._id}`}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginado */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            className="px-3 py-1 rounded bg-primary/20 text-primary font-bold disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-primary/20 text-primary font-bold disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
