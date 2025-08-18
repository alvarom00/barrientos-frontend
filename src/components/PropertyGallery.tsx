import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import LightboxModal from "./LightboxModal";
import { getAssetUrl } from "../utils/getAssetUrl";

/** ===== Tipos ===== */
export type MediaItem =
  | { type: "image"; src: string; thumb?: string }
  | { type: "video"; src: string; embedSrc?: string; thumb?: string };

export type PropertyGalleryProps = {
  images: string[];         // URLs absolutas de Cloudinary o relativas (getAssetUrl las resuelve)
  videos?: string[];        // URLs (YouTube/Vimeo/MP4); opcional
  className?: string;
};

/** Convierte URL de YouTube/Vimeo a embed; si no matchea, queda undefined (usaremos <video>) */
function toEmbed(url: string): string | undefined {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    // YouTube
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (host.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return undefined;
}

export default function PropertyGallery({
  images,
  videos = [],
  className,
}: PropertyGalleryProps) {
  // Normalizamos el arreglo de media conservando TU UI
  const media: MediaItem[] = useMemo(() => {
    const imgs: MediaItem[] = (images || []).map((u) => ({
      type: "image",
      src: getAssetUrl(u),
      thumb: getAssetUrl(u),
    }));
    const vids: MediaItem[] = (videos || []).map((u) => {
      const embed = toEmbed(u);
      return embed
        ? { type: "video", src: u, embedSrc: embed }
        : { type: "video", src: u };
    });
    return [...imgs, ...vids];
  }, [images, videos]);

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1); // para animación izquierda/derecha
  const [open, setOpen] = useState(false);

  // Swipe en mobile sin romper layout
  const touch = useRef<{ x: number; y: number; lock?: "h" | "v" } | null>(null);

  const go = (delta: number) => {
    if (!media.length) return;
    setDir(delta > 0 ? 1 : -1);
    setIndex((i) => (i + delta + media.length) % media.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!touch.current) return;
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;

    // bloqueamos el scroll vertical SOLO cuando detectamos gesto horizontal claro
    if (!touch.current.lock) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) + 6) {
        touch.current.lock = "h";
      } else if (Math.abs(dy) > 10) {
        touch.current.lock = "v";
      }
    }
    if (touch.current.lock === "h") {
      // evita que el navegador “arrastre” el viewport o dispare back-swipe
      e.preventDefault();
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    const wasHorizontal = Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy);

    if (wasHorizontal) {
      if (dx < 0) go(+1); // swipe left → siguiente
      else go(-1);        // swipe right → anterior
    }
    touch.current = null;
  };

  // Previene que el reproductor “tape” las flechas: las flechas van arriba (z) y el contenedor del media no captura
  // eventos fuera de sus controles.
  const arrows =
    media.length > 1 ? (
      <>
        {/* Flechas SOLO desktop */}
        <button
          onClick={() => go(-1)}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-black/60 transition z-20"
          aria-label="Anterior"
        >
          <ChevronLeft className="text-white" />
        </button>
        <button
          onClick={() => go(+1)}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-black/60 transition z-20"
          aria-label="Siguiente"
        >
          <ChevronRight className="text-white" />
        </button>
      </>
    ) : null;

  // para que el swipe no “mueva” el fondo ni afecte navbar/whatsapp:
  // - overscroll contain corta el efecto rebote
  // - touch-action pan-y deja el scroll vertical natural
  const swipeProps = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };

  return (
    <div className={clsx("w-full", className)}>
      {/* Preview principal */}
      <div
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-[#ebdbb9] select-none"
        style={{
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
      >
        {/* capa de interacción (z-index) */}
        {arrows}

        {/* Slide con animación, mismo look */}
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={index}
            custom={dir}
            initial={{ x: dir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -dir * 60, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="absolute inset-0"
          >
            {/* Contenido clickeable → abre Lightbox */}
            <button
              className="absolute inset-0"
              onClick={() => setOpen(true)}
              aria-label="Abrir galería"
              // NO bloquea los controles del video (los ponemos por encima)
              style={{ pointerEvents: "auto" }}
              {...swipeProps}
            />

            {media[index].type === "image" ? (
              <img
                src={media[index].src}
                alt={`Imagen ${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
            ) : media[index].embedSrc ? (
              <div className="absolute inset-0 flex">
                {/* El iframe maneja sus propios eventos; las flechas están por encima (z-20) */}
                <iframe
                  className="w-full h-full"
                  src={media[index].embedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${index + 1}`}
                />
              </div>
            ) : (
              <video
                className="absolute inset-0 w-full h-full object-contain bg-black"
                src={media[index].src}
                controls
                playsInline
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tiras de miniaturas (exactamente como antes) */}
      {!!media.length && (
        <div className="mt-3 grid grid-cols-5 sm:grid-cols-8 gap-2">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={clsx(
                "relative aspect-video rounded overflow-hidden border",
                i === index ? "border-[#c7ae79]" : "border-[#ebdbb9]"
              )}
              aria-label={`Miniatura ${i + 1}`}
            >
              {m.type === "image" ? (
                <img
                  src={m.thumb || m.src}
                  className="w-full h-full object-cover"
                  alt={`Miniatura ${i + 1}`}
                  loading="lazy"
                />
              ) : m.embedSrc ? (
                <div className="w-full h-full bg-black/70 grid place-items-center">
                  <Play className="text-white" />
                </div>
              ) : (
                <div className="w-full h-full bg-black/70 grid place-items-center">
                  <Play className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox (misma estética que tenías) */}
      <AnimatePresence>
        {open && (
          <LightboxModal
            media={media}
            initialIndex={index}
            onClose={() => setOpen(false)}
            currentIndex={index}
            setCurrentIndex={(i) => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
