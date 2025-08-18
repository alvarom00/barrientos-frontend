import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Tipo local para evitar dependencias cruzadas
type MediaItem = { type: "image" | "video"; url: string };

type LightboxModalProps = {
  items: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
};

const API_URL = import.meta.env.VITE_API_URL;
const buildUrl = (u: string) =>
  /^https?:\/\//i.test(u) ? u : `${API_URL?.replace(/\/$/, "")}/${u.replace(/^\//, "")}`;

export default function LightboxModal({
  items,
  initialIndex = 0,
  onClose,
}: LightboxModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const [dir, setDir] = useState<1 | -1>(1);

  const total = items.length || 0;

  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  // ESC / ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  const current = useMemo(() => items[index], [items, index]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Contenedor principal (evita cerrar al hacer click dentro) */}
      <div
        className="relative w-full h-full md:h-[90vh] md:w-[90vw] max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-30 rounded-full p-2 bg-black/60 text-white hover:bg-black/70"
        >
          <X />
        </button>

        {/* Flechas: ocultas en mobile, visibles en md+ */}
        <button
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 rounded-full p-2 bg-black/60 text-white hover:bg-black/70"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Siguiente"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 rounded-full p-2 bg-black/60 text-white hover:bg-black/70"
        >
          <ChevronRight />
        </button>

        {/* Lienzo */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={`${index}-${current?.url}`}
              className="absolute inset-0 flex items-center justify-center"
              custom={dir}
              initial={{ x: dir * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -dir * 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              {current?.type === "video" ? (
                <video
                  src={buildUrl(current.url)}
                  controls
                  playsInline
                  className="max-h-full max-w-full rounded-lg bg-black"
                />
              ) : (
                <img
                  src={buildUrl(current?.url ?? "")}
                  alt=""
                  className="max-h-full max-w-full rounded-lg object-contain select-none"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
