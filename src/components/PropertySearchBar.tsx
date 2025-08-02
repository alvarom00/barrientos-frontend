import { useState } from "react";
import type { SearchFilters } from "../pages/Home";

const OPERATION_TYPES = ["Venta", "Alquiler", "Alquiler temporal"];
const PROPERTY_TYPES = [
  "Departamento",
  "Local",
  "Campo",
  "Finca",
  "Cochera",
  "Casa",
  "Terreno",
  "Galpón",
  "Quinta",
];

interface PropertySearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function PropertySearchBar({ onSearch }: PropertySearchBarProps) {
  const [operationType, setOperationType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ operationType, propertyType, query });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 bg-white/70 dark:bg-[#232347] shadow-lg p-4 rounded-xl mb-8 animate-fade-in"
    >
      <select
        className="p-2 rounded border dark:bg-[#18182a] dark:text-white border-gray-300 dark:border-[#393964] flex-1"
        value={operationType}
        onChange={(e) => setOperationType(e.target.value)}
      >
        <option value="">Tipo de operación</option>
        {OPERATION_TYPES.map((op) => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>

      <select
        className="p-2 rounded border dark:bg-[#18182a] dark:text-white border-gray-300 dark:border-[#393964] flex-1"
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
      >
        <option value="">Tipo de propiedad</option>
        {PROPERTY_TYPES.map((pt) => (
          <option key={pt} value={pt}>{pt}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Ubicación, dirección o calle"
        className="p-2 rounded border dark:bg-[#18182a] dark:text-white border-gray-300 dark:border-[#393964] flex-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-lg transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}
