import { useState, useRef, useEffect } from "react";
import { LightboxModal } from "./LightboxModal";
import { getAssetUrl } from "../utils/getAssetUrl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Exportado para que LightboxModal pueda importar el tipo
export type MediaItem =
  | { type: "image"; url: string }
  | { type: "video-file"; url: string }
  | { type: "video-embed"; embedSrc: string };

interface Props {
  images: string[];
  videos: string[]; // URLs (YouTube/Vimeo/MP4)
}

// Helpers — YouTube/Vimeo
function parseYouTube(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let id = "";
      if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      else
        id =
          u.searchParams.get("v") ||
          (u.pathname.startsWith("/embed/")
            ? u.pathname.split("/embed/")[1]
            : "");
      if (id)
        return {
          embedSrc: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        };
    }
  } catch {}
  return null;
}
function parseVimeo(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return { embedSrc: `https://player.vimeo.com/video/${id}` };
    }
  } catch {}
  return null;
}

// Animación tipo Lightbox
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }),
};

export function PropertyGallery({ images, videos }: Props) {
  const imageItems: MediaItem[] = (images || []).map((url) => ({
    type: "image",
    url,
  }));
  const videoItems: MediaItem[] = (videos || []).map((url) => {
    const yt = parseYouTube(url);
    if (yt) return { type: "video-embed", embedSrc: yt.embedSrc };
    const vi = parseVimeo(url);
    if (vi) return { type: "video-embed", embedSrc: vi.embedSrc };
    return { type: "video-file", url };
  });
  const media: MediaItem[] = [...imageItems, ...videoItems];

  // estado (índice + dirección) para animación
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ----- carrusel de miniaturas -----
  const thumbsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (thumbsRef.current) thumbsRef.current.scrollLeft = 0;
  }, []);
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const el = container.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [index]);

  if (media.length === 0) return null;
  const current = media[index];

  // ---- Navegación (desktop arrows + mobile swipe) ----
  const paginate = (dir: number) =>
    setPage([(index + dir + media.length) % media.length, dir]);

  const startX = useRef(0);
  const swiped = useRef(false);
  const SWIPE_THRESHOLD = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    swiped.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      swiped.current = true;
      paginate(dx < 0 ? 1 : -1);
    }
  };
  const onMainClick = () => {
    if (swiped.current) return; // si hubo swipe, no abrir
    setLightboxOpen(true);
  };

  // z-index: flechas arriba del media (video/iframe)
  const arrowBtnClass =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition z-40";

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Vista principal (tap abre lightbox; md: flechas; sm: swipe). 
          Para videos en mobile, mostramos placeholder con ▶ y abrimos lightbox para reproducir. */}
      <div
        className="relative w-full flex justify-center items-center group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        aria-label="Abrir galería"
      >
        {/* Arrows solo desktop (por encima con z-40) */}
        <button
          className={`${arrowBtnClass} left-3`}
          onClick={(e) => {
            e.stopPropagation();
            paginate(-1);
          }}
          aria-label="Anterior"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          className={`${arrowBtnClass} right-3`}
          onClick={(e) => {
            e.stopPropagation();
            paginate(1);
          }}
          aria-label="Siguiente"
        >
          <ChevronRight size={28} />
        </button>

        {/* Contenedor animado (como Lightbox) */}
        <div
          className="relative z-10 cursor-zoom-in"
          onClick={onMainClick}
          style={{ width: "100%" }}
        >
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
              className="w-full flex items-center justify-center"
              style={{ touchAction: "pan-y" }}
            >
              {/* IMAGEN (desktop+mobile) */}
              {current.type === "image" && (
                <img
                  src={getAssetUrl((current as any).url)}
                  alt={`Vista ${index + 1}`}
                  className="rounded-lg shadow-lg max-w-full max-h-[420px] object-contain group-hover:opacity-90 transition bg-black"
                />
              )}

              {/* VIDEO FILE */}
              {current.type === "video-file" && (
                <>
                  {/* Mobile: placeholder con ▶ para permitir swipe y tap->lightbox */}
                  <div className="md:hidden relative w-full">
                    <div
                      className="rounded-lg shadow-lg w-full bg-black flex items-center justify-center"
                      style={{ aspectRatio: "16 / 9", maxHeight: 420 }}
                    >
                      <span className="text-white text-4xl">▶</span>
                    </div>
                  </div>

                  {/* Desktop: video real debajo de flechas */}
                  <div className="hidden md:block relative w-full">
                    <video
                      src={getAssetUrl((current as any).url)}
                      controls
                      preload="metadata"
                      className="rounded-lg shadow-lg max-w-full max-h-[420px] object-contain bg-black z-10"
                    />
                  </div>
                </>
              )}

              {/* VIDEO EMBED (YouTube/Vimeo) */}
              {current.type === "video-embed" && (
                <>
                  {/* Mobile: placeholder con ▶ */}
                  <div className="md:hidden relative w-full">
                    <div
                      className="rounded-lg shadow-lg w-full bg-black flex items-center justify-center"
                      style={{ aspectRatio: "16 / 9", maxHeight: 420 }}
                    >
                      <span className="text-white text-4xl">▶</span>
                    </div>
                  </div>

                  {/* Desktop: iframe real */}
                  <div className="hidden md:block relative w-full">
                    <div
                      className="rounded-lg shadow-lg bg-black w-full z-10"
                      style={{ aspectRatio: "16 / 9", maxHeight: 420 }}
                    >
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={(current as any).embedSrc}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video"
                      />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Miniaturas */}
      <div
        ref={thumbsRef}
        className="flex gap-2 overflow-x-auto w-full justify-start px-3 py-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarGutter: "stable" }}
      >
        {media.map((m, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              onClick={() => setPage([i, i > index ? 1 : -1])}
              aria-label={`Seleccionar vista ${i + 1}`}
              tabIndex={0}
              className={`shrink-0 snap-start border-2 rounded-lg p-1 ${
                isActive ? "border-primary" : "border-transparent"
              } bg-white/80 dark:bg-black/60`}
            >
              {m.type === "image" && (
                <img
                  src={getAssetUrl((m as any).url)}
                  alt={`Miniatura ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              {m.type === "video-file" && (
                <div
                  className="w-16 h-16 object-cover rounded-md bg-black flex items-center justify-center"
                  aria-label="Miniatura video"
                >
                  <span className="text-white text-xs">▶</span>
                </div>
              )}
              {m.type === "video-embed" && (
                <div className="relative w-16 h-16 bg-black rounded-md overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                  <span className="relative text-white text-xs">▶</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <LightboxModal
          media={media}
          initialIndex={index}
          currentIndex={index}
          setCurrentIndex={(i) => setPage([i, i > index ? 1 : -1])}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
