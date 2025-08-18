import { useState, useRef, useEffect } from "react";
import { LightboxModal } from "./LightboxModal";
import { getAssetUrl } from "../utils/getAssetUrl";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ----- carrusel de miniaturas -----
  const thumbsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (thumbsRef.current) thumbsRef.current.scrollLeft = 0;
  }, []);
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const el = container.children[lightboxIndex] as HTMLElement | undefined;
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [lightboxIndex]);

  if (media.length === 0) return null;
  const current = media[lightboxIndex];

  // ---- Navegación local (desktop arrows + mobile swipe) ----
  const go = (dir: number) =>
    setLightboxIndex((i) => (i + dir + media.length) % media.length);

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
      if (dx < 0) go(1);
      else go(-1);
    }
  };
  const onMainClick = () => {
    // si hubo swipe, ignoramos el tap para que no abra el lightbox
    if (swiped.current) return;
    setLightboxOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Vista principal (tap abre lightbox; md: flechas; sm: swipe) */}
      <div
        className="relative w-full flex justify-center items-center cursor-zoom-in group"
        onClick={onMainClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        aria-label="Abrir galería"
      >
        {/* Arrows solo desktop */}
        <button
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Anterior"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Siguiente"
        >
          <ChevronRight size={28} />
        </button>

        {current.type === "image" && (
          <img
            src={getAssetUrl((current as any).url)}
            alt={`Vista ${lightboxIndex + 1}`}
            className="rounded-lg shadow-lg max-w-full max-h-[420px] object-contain group-hover:opacity-90 transition bg-black"
          />
        )}
        {current.type === "video-file" && (
          <video
            src={getAssetUrl((current as any).url)}
            controls
            preload="metadata"
            className="rounded-lg shadow-lg max-w-full max-h-[420px] object-contain group-hover:opacity-90 transition bg-black"
          />
        )}
        {current.type === "video-embed" && (
          <div
            className="rounded-lg shadow-lg bg-black group-hover:opacity-90 transition w-full"
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
        )}
      </div>

      {/* Miniaturas */}
      <div
        ref={thumbsRef}
        className="flex gap-2 overflow-x-auto w-full justify-start px-3 py-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarGutter: "stable" }}
      >
        {media.map((m, i) => {
          const isActive = i === lightboxIndex;
          return (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
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

      {/* Lightbox */}
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
