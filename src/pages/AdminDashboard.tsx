import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Property {
  _id: string;
  title: string;
  price?: number;
  operationType: string;
  location: string;
}

const PAGE_SIZE = 8; // O el número que prefieras
const API = import.meta.env.VITE_API_URL;

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

    fetch(`${API}/properties?${params}`)
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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this property?"
    );
    if (!confirm) return;

    try {
      await fetch(`${API}/properties/${id}`, {
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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8">
      <div
        className="w-full max-w-full bg-crema rounded-2xl shadow-xl p-4 sm:p-8
                 border border-[#ebdbb9] text-[#514737] animate-fade-in
                 text-sm sm:text-base"
      >
        {/* Título + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-lg sm:text-2xl font-bold">
            Panel de administrador
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/create"
              className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition text-sm"
            >
              + Crear propiedad
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded btn-red text-white hover:scale-[1.02] active:scale-95 transition text-sm"
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por referencia, título o ubicación..."
            className="w-full sm:w-96 px-3 py-2 rounded bg-[#fcf7ea]/90 text-[#594317] border border-[#ebdbb9] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition text-sm"
          />
        </div>

        {/* Info paginado */}
        <div className="mb-3 text-sm text-[#6b5432]">
          {total > 0
            ? `Mostrando ${start}–${end} de ${total} propiedades`
            : loading
            ? "Cargando..."
            : "No se encontraron propiedades"}
        </div>

        {/* TABLA — SOLO esto scrollea en X */}
        <div className="relative w-full overflow-x-auto touch-pan-x overscroll-x-contain pr-3">
          <table className="min-w-[720px] table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f7edd0] text-[#594317]">
                {/* suma exacta 100% para no empujar el card */}
                <th className="px-3 py-2 text-left font-semibold border border-[#ebdbb9] w-2/5">
                  Título
                </th>
                <th className="px-3 py-2 text-left font-semibold border border-[#ebdbb9] w-1/6">
                  Precio
                </th>
                <th className="px-3 py-2 text-left font-semibold border border-[#ebdbb9] w-1/4">
                  Ubicación
                </th>
                <th className="px-3 py-2 text-left font-semibold border border-[#ebdbb9] w-1/6">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p._id} className="bg-[#fcf7ea]/70 align-top">
                  <td
                    className="border border-[#ebdbb9] p-2 truncate max-w-[12rem] overflow-hidden whitespace-nowrap"
                    title={p.title}
                  >
                    {p.title}
                  </td>
                  <td className="border border-[#ebdbb9] p-2">
                    {p.operationType === "Arrendamiento"
                      ? "A acordar"
                      : p.price
                      ? `$${p.price.toLocaleString()}`
                      : "Sin precio"}
                  </td>
                  <td
                    className="border border-[#ebdbb9] p-2 truncate max-w-[10rem] overflow-hidden whitespace-nowrap"
                    title={p.location}
                  >
                    {p.location}
                  </td>
                  <td className="border border-[#ebdbb9] p-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/edit/${p._id}`}
                        className="px-2 py-1 rounded bg-[#4da6ff] text-white hover:bg-[#3399ff] transition"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-2 py-1 rounded text-white transition btn-red"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginado */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2 flex-wrap">
            <button
              className="px-3 py-1 rounded bg-[#ffe8ad] text-[#594317] font-bold disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              const isActive = currentPage === i + 1;
              return (
                <button
                  key={i}
                  disabled={isActive}
                  className={`px-3 py-1 rounded font-bold transition ${
                    isActive
                      ? "bg-primary text-[#6B5432] opacity-60"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                  onClick={() => !isActive && setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              );
            })}
            <button
              className="px-3 py-1 rounded bg-[#ffe8ad] text-[#594317] font-bold disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
