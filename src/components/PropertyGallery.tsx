import { useState, useRef } from "react";

interface PropertyGalleryProps {
  images: string[];
  videos: string[];
}

export function PropertyGallery({ images = [], videos = [] }: PropertyGalleryProps) {
  // Juntamos ambos (manteniendo orden: primero imágenes, luego videos)
  const media = [
    ...images.map((img) => ({ type: "image" as const, src: img })),
    ...videos.map((vid) => ({ type: "video" as const, src: vid })),
  ];
  const [selected, setSelected] = useState(0);

  // Para swipe táctil
  const startX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current != null) {
      const endX = e.changedTouches[0].clientX;
      const delta = endX - startX.current;
      if (delta > 50 && selected > 0) setSelected(selected - 1);
      else if (delta < -50 && selected < media.length - 1) setSelected(selected + 1);
    }
    startX.current = null;
  };

  if (media.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4 mb-8">
      {/* IMAGEN/VIDEO PRINCIPAL */}
      <div
        className="relative w-full aspect-video bg-gray-100 dark:bg-[#292945] rounded-xl overflow-hidden shadow group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {media[selected].type === "image" ? (
          <img
            src={media[selected].src}
            alt=""
            className="object-cover w-full h-full transition-all duration-300"
            draggable={false}
          />
        ) : (
          <video
            src={media[selected].src}
            controls
            className="object-cover w-full h-full"
            style={{ background: "#111" }}
          />
        )}
        {/* FLECHAS SOLO EN DESKTOP */}
        {selected > 0 && (
          <button
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 items-center justify-center hover:bg-black/70 transition"
            onClick={() => setSelected(selected - 1)}
            type="button"
            tabIndex={-1}
          >
            ‹
          </button>
        )}
        {selected < media.length - 1 && (
          <button
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 items-center justify-center hover:bg-black/70 transition"
            onClick={() => setSelected(selected + 1)}
            type="button"
            tabIndex={-1}
          >
            ›
          </button>
        )}
      </div>

      {/* MINIATURAS */}
      <div className="flex gap-2 overflow-x-auto w-full px-2">
        {media.map((item, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`rounded-lg border-2 transition-all duration-150 ${
              selected === i
                ? "border-primary shadow-lg"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
            style={{ width: 64, height: 48, minWidth: 64, minHeight: 48, background: "#111" }}
            aria-label={`Seleccionar ${item.type} ${i + 1}`}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt=""
                className="object-cover w-full h-full rounded"
                draggable={false}
              />
            ) : (
              <video
                src={item.src}
                className="object-cover w-full h-full rounded"
                style={{ pointerEvents: "none" }}
                muted
                preload="metadata"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
