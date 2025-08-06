// PropertyGallery.tsx

import { useState } from "react";
import { LightboxModal } from "./LightboxModal";
import { getAssetUrl } from "../utils/getAssetUrl";

interface Props {
  images: string[];
  videos: string[];
}

export function PropertyGallery({ images, videos }: Props) {
  // Construir lista de media combinada: [{type: "image", url}, ...]
  const media = [
    ...images.map((url) => ({ type: "image" as const, url })),
    ...videos.map((url) => ({ type: "video" as const, url })),
  ];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (media.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Preview principal */}
      <div
        className="w-full flex justify-center items-center cursor-zoom-in group"
        onClick={() => setLightboxOpen(true)}
        tabIndex={0}
        aria-label="Abrir galería"
      >
        {media[lightboxIndex].type === "image" ? (
          <img
            src={getAssetUrl(media[lightboxIndex].url)}
            alt={`Vista ${lightboxIndex + 1}`}
            className="rounded-lg shadow-lg max-w-full max-h-[420px] object-contain group-hover:opacity-90 transition"
          />
        ) : (
          <video
            src={getAssetUrl(media[lightboxIndex].url)}
            controls
            className="rounded-lg shadow-lg max-w-full max-h-[420px] object-contain group-hover:opacity-90 transition bg-black"
          />
        )}
      </div>
      {/* Miniaturas */}
      <div className="flex gap-2 overflow-x-auto w-full justify-center">
        {media.map((m, i) => (
          <button
            key={i}
            className={`border-2 rounded-lg p-1 ${
              i === lightboxIndex ? "border-primary" : "border-transparent"
            } bg-white/80 dark:bg-black/60`}
            onClick={() => setLightboxIndex(i)}
            aria-label={`Seleccionar vista ${i + 1}`}
            tabIndex={0}
          >
            {m.type === "image" ? (
              <img
                src={getAssetUrl(m.url)}
                alt={`Miniatura ${i + 1}`}
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <video
                src={getAssetUrl(m.url)}
                className="w-16 h-16 object-cover rounded-md bg-black"
              />
            )}
          </button>
        ))}
      </div>
      {/* Modal Lightbox */}
      {lightboxOpen && (
        <LightboxModal
          media={media}
          initialIndex={lightboxIndex}
          currentIndex={lightboxIndex}
          setCurrentIndex={setLightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
