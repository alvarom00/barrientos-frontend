// List input
export interface DynamicListProps {
  label: string;
  items: string[];
  onChange: (idx: number, val: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  placeholder?: string;
  errors?: (string | undefined)[]; // <-- NUEVO
}

export function DynamicList({
  label,
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder,
  errors = [],
}: DynamicListProps) {
  return (
    <div>
      <p className="font-medium mb-2">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={
                placeholder ? `${placeholder} ${i + 1}` : `${label} ${i + 1}`
              }
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="px-3 bg-red-500 text-white rounded"
            >
              ×
            </button>
          </div>
          {/* Mostrar error de ese input si existe */}
          {errors[i] && (
            <span className="text-red-500 text-xs">{errors[i]}</span>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-sm text-blue-600 underline"
      >
        + Agregar {label.toLowerCase()}
      </button>
    </div>
  );
}

// Checkbox group for features
export interface FeatureCheckboxGroupProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const EXTRAS = [
  "Aire Acondicionado individual",
  "Alarma",
  "Amoblado",
  "Calefacción",
  "Centro de deportes",
  "Gimnasio",
  "Hidromasaje",
  "Parrilla",
  "Quincho",
  "Solarium",
  "SUM",
  "Apto profesional",
  "Pileta",
  "Calefacción central",
  "Caldera",
  "Preinstalación de aire acondicionado",
  "Cochera subterránea",
  "En construcción",
  "Luminoso",
  "Laundry",
  "Wifi",
  "Calefacción individual",
  "Calefacción por aire",
  "Calefacción por radiadores",
  "Deck",
  "Apto crédito",
  "Ascensor",
  "Termotanque Individual",
  "Apto comercial",
];

export const SERVICES = [
  "Agua Corriente",
  "Cloaca",
  "Gas Natural",
  "Internet",
  "Electricidad",
  "Pavimento",
  "Teléfono",
  "Cable",
];

export function FeatureCheckboxGroup({
  options,
  selected = [],
  onChange,
}: FeatureCheckboxGroupProps) {
  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((f) => f !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => handleToggle(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
