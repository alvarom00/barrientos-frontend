import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, abortable } from "../api";

interface Property {
  _id: string;
  title: string;
  price?: number;
  operationType: string;
  location: string;
}

const PAGE_SIZE = 8;

const AdminDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const navigate = useNavigate();

  useEffect(() => {
    const { signal, abort } = abortable();
    setLoading(true);

    const query = {
      page: currentPage,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
    };

    api
      .get<{ properties: Property[]; total: number }>("/properties", {
        query,
        signal,
      })
      .then((data) => {
        setProperties(data.properties ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        // Si abortaste, ignorás el error
        if ((err as any)?.name !== "AbortError") {
          console.error("Error fetching properties:", err);
          setProperties([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));

    return () => abort();
  }, [currentPage, search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de borrar esta propiedad? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    try {
      await api.del(`/properties/${id}`);
      // Actualizar lista tras borrar (si quedaba 1 en la página, retroceder)
      setProperties((prev) => prev.filter((p) => p._id !== id));
      setTotal((prev) => prev - 1);
      if (properties.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error: any) {
      alert(
        "Error al borrar la propiedad: " + (error?.message ?? "desconocido")
      );
    }
  };

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8">
      <div
        className="w-full max-w-full bg-crema rounded-2xl shadow-xl p-4 sm:p-8
                 border border-[#ebdbb9] animate-fade-in
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

        {/* TABLA */}
        <div className="relative w-full overflow-x-auto touch-pan-x overscroll-x-contain pr-3">
          <table className="min-w-[720px] table-fixed text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f7edd0]">
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
