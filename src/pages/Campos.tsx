import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import type { IProperty } from "../components/PropertyCard";
import { motion } from "framer-motion";

interface CamposProps {
  operationType?: string;
}

const stagger = 0.1;

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
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Campos({ operationType }: CamposProps) {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setCurrentPage(1); }, [operationType]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("pageSize", PAGE_SIZE.toString());
    if (operationType) params.append("operationType", operationType);

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
  }, [currentPage, operationType]);

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        {operationType === "Venta"
          ? "Campos en venta"
          : operationType === "Arrendamiento"
          ? "Campos en arrendamiento"
          : "Todos los campos"}
      </h1>

      <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">
        {total > 0
          ? `Mostrando ${start}–${end} de ${total} campos`
          : loading ? "Cargando..." : "No se encontraron campos"}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="animate-pulse text-lg text-primary">Cargando...</span>
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
}