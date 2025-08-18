import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

type GalleryItem = { type: "image" | "video"; url: string };

type PropertyGalleryProps = {
  images: string[];
  videoUrls?: string[];
  onOpenLightbox?: (startIndex: number) => void;
};

const API_URL = import.meta.env.VITE_API_URL;
const buildUrl = (u: string) =>
  /^https?:\/\//i.test(u) ? u : `${API_URL?.replace(/\/$/, "")}/${u.replace(/^\//, "")}`;

export default function PropertyGallery({
  images,
  videoUrls = [],
  onOpenLightbox,
}: PropertyGalleryProps) {
  const items: GalleryItem[] = useMemo(
    () => [
      ...images.map((url) => ({ type: "image" as const, url })),
      ...videoUrls.map((url) => ({ type: "video" as const, url })),
    ],
    [images, videoUrls]
  );

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const total = items.length;

  const go = (d: 1 | -1) => {
    if (!total) return;
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  const variants = {
    enter: (direction: 1 | -1) => ({ x: direction * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: 1 | -1) => ({ x: -direction * 40, opacity: 0 }),
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => go(1),
    onSwipedRight: () => go(-1),
    trackTouch: true,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false }, // evita el “sacudón” en mobile al swipe derecha
  });

  const openLightbox = () => {
    if (onOpenLightbox) onOpenLightbox(index);
  };

  const current = items[index];

  return (
    <div className="w-full">
      {/* Vista principal */}
      <div
        {...handlers}
        className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-black/5 touch-pan-y overscroll-contain select-none"
      >
        {/* Flechas: visibles en desktop, ocultas en mobile */}
        <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 text-white hover:bg-black/70"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 text-white hover:bg-black/70"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Capa clickeable para abrir el lightbox (no tapa controles de video) */}
        <button
          type="button"
          onClick={openLightbox}
          className="absolute inset-0 z-10 md:z-0 md:pointer-events-none"
          aria-label="Abrir visor"
        />

        {/* Lienzo con animación (siempre en la misma posición) */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={`${index}-${current?.url}`}
              className="absolute inset-0 flex items-center justify-center"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              {current?.type === "video" ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    src={buildUrl(current.url)}
                    controls
                    playsInline
                    className="max-h-full max-w-full object-contain"
                    style={{ outline: "none" }}
                  />
                  {/* Ícono play de adorno cuando el video no está en reproducción (opcional) */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:hidden">
                    <div className="rounded-full bg-black/40 p-4 text-white">
                      <Play />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={buildUrl(current?.url ?? "")}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thumbnails (sin cambios funcionales) */}
      {total > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {items.map((it, i) => {
            const isActive = i === index;
            return (
              <button
                key={`${i}-${it.url}`}
                type="button"
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`relative h-16 rounded-lg overflow-hidden border ${
                  isActive ? "ring-2 ring-[#c7ae79] border-[#c7ae79]" : "border-[#ebdbb9]"
                }`}
                aria-label={`Vista previa ${i + 1}`}
              >
                {it.type === "video" ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={buildUrl(it.url)}
                      className="h-full w-full object-cover opacity-70"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/50 p-1.5 text-white">
                        <Play size={16} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={buildUrl(it.url)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
