import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import type { IProperty } from "../components/PropertyCard";
import { motion } from "framer-motion";

interface CamposProps {
  operationType?: string;
}

const stagger = 0.1;
const API = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 6;

const gridVariants = {
  animate: {
    transition: {
      staggerChildren: stagger,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Campos({ operationType }: CamposProps) {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [operationType]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("pageSize", PAGE_SIZE.toString());
    if (operationType) params.append("operationType", operationType);

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
  }, [currentPage, operationType]);

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8">
      <div className="bg-crema rounded-2xl shadow-xl p-4 sm:p-8 animate-fade-in !text-[#514737] !important border border-[#ebdbb9]">
        <h1 className="text-3xl font-bold mb-6 drop-shadow">
          {operationType === "Venta"
            ? "Campos en venta"
            : operationType === "Arrendamiento"
            ? "Campos en arrendamiento"
            : "Todos los campos"}
        </h1>

        <div className="mb-2 text-sm drop-shadow-sm">
          {total > 0
            ? `Mostrando ${start}–${end} de ${total} campos`
            : loading
            ? "Cargando..."
            : "No se encontraron campos"}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="animate-pulse text-lg text-primary">
              Cargando...
            </span>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={gridVariants}
            initial="initial"
            animate="animate"
          >
            {properties.map((p) => (
              <motion.div key={p._id} variants={cardVariants}>
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* PAGINADO */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2 flex-wrap">
            <button
              className="px-3 py-1 rounded-lg bg-[#ffeec1] text-[#94783d] font-bold disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              const isCurrent = currentPage === i + 1;
              return (
                <button
                  key={i}
                  disabled={isCurrent}
                  className={`
            px-3 py-1 min-w-[2.25rem] rounded-lg border-2 font-bold transition
            ${
              isCurrent
                ? "bg-[#fbe6b4] text-[#b1a173] border-[#f5d990] opacity-60 cursor-default shadow-inner"
                : "bg-[#ffeec1] text-[#94783d] border-[#f2dbb1] hover:bg-[#ffe8ad] hover:text-[#6e561f] cursor-pointer"
            }
          `}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              );
            })}
            <button
              className="px-3 py-1 rounded-lg bg-[#ffeec1] text-[#94783d] font-bold disabled:opacity-40"
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
}
