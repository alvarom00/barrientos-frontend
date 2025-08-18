import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LightboxModal } from "./LightboxModal";
import { getAssetUrl } from "../utils/getAssetUrl";

export type MediaItem =
  | { type: "image"; url: string }
  | { type: "video-file"; url: string }
  | { type: "video-embed"; embedSrc: string };

interface Props {
  images: string[];
  videos: string[]; // URLs (YouTube/Vimeo/MP4)
}

// Helpers — YouTube/Vimeo a embed
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
      if (id) return { embedSrc: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` };
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

export function PropertyGallery({ images, videos }: Props) {
  const media: MediaItem[] = useMemo(() => {
    const imgs = (images || []).map((url) => ({ type: "image", url }) as const);
    const vids = (videos || []).map((url) => {
      const yt = parseYouTube(url);
      if (yt) return { type: "video-embed", embedSrc: yt.embedSrc } as const;
      const vi = parseVimeo(url);
      if (vi) return { type: "video-embed", embedSrc: vi.embedSrc } as const;
      return { type: "video-file", url } as const;
    });
    return [...imgs, ...vids];
  }, [images, videos]);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Miniaturas: autoscroll a la activa
  const thumbsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = thumbsRef.current;
    if (!c) return;
    const el = c.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [index]);

  if (!media.length) return null;

  const go = (dir: number) => {
    setIndex((i) => {
      const next = (i + dir + media.length) % media.length;
      setDirection(dir);
      return next;
    });
  };

  // --- SWIPE SOLO MOBILE (sin drag continuo) ---
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);
  const SWIPE_TRIGGER_PX = 56;
  const ANGLE_TOLERANCE = 1.2; // |dx| al menos 1.2 * |dy|

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    swiping.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * ANGLE_TOLERANCE) {
      // gesto claramente horizontal → evitamos que el body se “mueva”
      swiping.current = true;
      e.preventDefault();
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;

    if (swiping.current && Math.abs(dx) > Math.abs(dy) * ANGLE_TOLERANCE && Math.abs(dx) > SWIPE_TRIGGER_PX) {
      if (dx < 0) go(1);
      else go(-1);
    }
    swiping.current = false;
  };

  // Variants: dos slides superpuestos (sin empujar layout)
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 280 : -280,
      opacity: 0,
      scale: 0.98,
      position: "absolute" as const,
      inset: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      position: "absolute" as const,
      inset: 0,
      zIndex: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -280 : 280,
      opacity: 0,
      scale: 0.98,
      position: "absolute" as const,
      inset: 0,
      zIndex: 0,
    }),
  };

  const current = media[index];

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Vista principal: flechas sólo desktop; swipe solo mobile */}
      <div className="relative w-full flex justify-center items-center">
        {/* Flecha izquierda (desktop) */}
        <button
          type="button"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/70 rounded-full p-2"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Anterior"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Flecha derecha (desktop) */}
        <button
          type="button"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/70 rounded-full p-2"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Siguiente"
        >
          <ChevronRight size={28} />
        </button>

        {/* Contenedor de animación: fijo en tamaño y sin reflow */}
        <div
          className="relative w-full cursor-zoom-in select-none overflow-hidden rounded-lg shadow-lg bg-black"
          style={{
            maxHeight: 420,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            willChange: "transform",
            touchAction: "pan-y", // permite scroll vertical de la página cuando NO estamos en swipe horizontal
          }}
          onClick={() => setLightboxOpen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="w-full h-full flex items-center justify-center"
            >
              {current.type === "image" && (
                <img
                  src={getAssetUrl((current as any).url)}
                  alt={`Vista ${index + 1}`}
                  className="max-w-full max-h-[420px] object-contain"
                />
              )}

              {current.type === "video-file" && (
                <video
                  src={getAssetUrl((current as any).url)}
                  controls
                  preload="metadata"
                  className="max-w-full max-h-[420px] object-contain md:pointer-events-auto pointer-events-none"
                />
              )}

              {current.type === "video-embed" && (
                <div
                  className="w-full md:pointer-events-auto pointer-events-none"
                  style={{ aspectRatio: "16 / 9", maxHeight: 420 }}
                >
                  <iframe
                    className="w-full h-full"
                    src={(current as any).embedSrc}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Miniaturas (igual que antes) */}
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
              onClick={() => setIndex(i)}
              aria-label={`Seleccionar vista ${i + 1}`}
              className={`shrink-0 snap-start border-2 rounded-lg p-1 ${
                isActive ? "border-primary" : "border-transparent"
              } bg-white/80 dark:bg-black/60`}
              tabIndex={0}
              type="button"
            >
              {m.type === "image" && (
                <img
                  src={getAssetUrl((m as any).url)}
                  alt={`Miniatura ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              {m.type === "video-file" && (
                <video
                  src={getAssetUrl((m as any).url)}
                  className="w-16 h-16 object-cover rounded-md bg-black"
                  preload="metadata"
                />
              )}
              {m.type === "video-embed" && (
                <div className="relative w-16 h-16 bg-black rounded-md overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                  <span className="relative text-white text-sm">▶</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox (sin cambios salvo flechas ocultas en mobile en su componente) */}
      {lightboxOpen && (
        <LightboxModal
          media={media}
          initialIndex={index}
          currentIndex={index}
          setCurrentIndex={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
