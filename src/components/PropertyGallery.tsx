import { useMemo, useRef, useState, useCallback } from "react";

type MediaItem =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

export interface PropertyGalleryProps {
  images?: string[];
  videos?: string[];
}

const API_URL = import.meta.env.VITE_API_URL as string;

const buildImgUrl = (u: string) =>
  /^https?:\/\//i.test(u)
    ? u
    : `${API_URL?.replace(/\/$/, "")}/${u.replace(/^\//, "")}`;

const toMedia = (images: string[] = [], videos: string[] = []): MediaItem[] => [
  ...images.filter(Boolean).map((src) => ({ kind: "image" as const, src })),
  ...videos.filter(Boolean).map((src) => ({ kind: "video" as const, src })),
];

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void
): {
  handlers: {
    onTouchStart: React.TouchEventHandler;
    onTouchMove: React.TouchEventHandler;
    onTouchEnd: React.TouchEventHandler;
  };
  dragX: number;
  setDragX: (x: number) => void;
} {
  const startX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  const onTouchStart: React.TouchEventHandler = (e) => {
    const t = e.changedTouches[0];
    startX.current = t.clientX;
  };

  const onTouchMove: React.TouchEventHandler = (e) => {
    const t = e.changedTouches[0];
    if (startX.current == null) return;
    const dx = t.clientX - startX.current;
    setDragX(dx);
  };

  const onTouchEnd: React.TouchEventHandler = () => {
    if (startX.current == null) return;
    const dx = dragX;
    startX.current = null;
    setDragX(0);
    const TH = 48; // umbral
    if (dx <= -TH) onSwipeLeft();
    else if (dx >= TH) onSwipeRight();
  };

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    dragX,
    setDragX,
  };
}

function MediaView({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    return (
      <img
        src={buildImgUrl(item.src)}
        alt=""
        className="w-full h-full object-cover rounded-lg"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-full">
      <video
        src={buildImgUrl(item.src)}
        controls
        playsInline
        className="w-full h-full object-cover rounded-lg bg-black"
      />
    </div>
  );
}

export default function PropertyGallery({
  images = [],
  videos = [],
}: PropertyGalleryProps) {
  const media = useMemo(() => toMedia(images, videos), [images, videos]);
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState<"idle" | "left" | "right">("idle");
  const [incoming, setIncoming] = useState<number | null>(null);

  const next = useCallback(() => {
    if (media.length <= 1 || anim !== "idle") return;
    const to = (index + 1) % media.length;
    setIncoming(to);
    setAnim("left");
  }, [anim, index, media.length]);

  const prev = useCallback(() => {
    if (media.length <= 1 || anim !== "idle") return;
    const to = (index - 1 + media.length) % media.length;
    setIncoming(to);
    setAnim("right");
  }, [anim, index, media.length]);

  const { handlers, dragX } = useSwipe(next, prev);

  const onTransitionEnd = () => {
    if (anim === "idle" || incoming == null) return;
    setIndex(incoming);
    setIncoming(null);
    setAnim("idle");
  };

  // Evita scroll horizontal del documento al swippear (sólo esta caja)
  const touchActionStyle: React.CSSProperties = { touchAction: "pan-y" };

  const hasThumbs = media.length > 1;

  return (
    <div className="w-full">
      {/* VISOR PRINCIPAL */}
      <div
        className="relative w-full overflow-hidden rounded-xl select-none"
        style={touchActionStyle}
        {...handlers}
      >
        <div className="relative aspect-[4/3] bg-black/30">
          {/* Capa actual */}
          <div
            className={`absolute inset-0 will-change-transform transition-transform duration-300 ${
              anim === "left"
                ? "-translate-x-full"
                : anim === "right"
                ? "translate-x-full"
                : "translate-x-0"
            }`}
            onTransitionEnd={onTransitionEnd}
            style={
              anim === "idle" && dragX
                ? { transform: `translateX(${clamp(dragX, -120, 120)}px)` }
                : undefined
            }
          >
            <MediaView item={media[index]} />
          </div>

          {/* Capa entrante sólo durante animación */}
          {incoming != null && anim !== "idle" && (
            <div
              className={`absolute inset-0 will-change-transform transition-transform duration-300 ${
                anim === "left" ? "translate-x-0" : ""
              } ${anim === "right" ? "translate-x-0" : ""}`}
              style={{
                transform:
                  anim === "left"
                    ? "translateX(100%)"
                    : anim === "right"
                    ? "translateX(-100%)"
                    : "translateX(0)",
              }}
            >
              <MediaView item={media[incoming]} />
            </div>
          )}

          {/* Flechas: sólo en desktop */}
          {media.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={prev}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur pointer-events-auto"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={next}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur pointer-events-auto"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>

      {/* MINIATURAS */}
      {hasThumbs && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {media.map((m, i) => {
            const isActive = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (anim !== "idle" || i === index) return;
                  // determinamos dirección "más corta"
                  const forward = (i - index + media.length) % media.length;
                  const backward = (index - i + media.length) % media.length;
                  const dir: "left" | "right" =
                    forward <= backward ? "left" : "right";
                  setIncoming(i);
                  setAnim(dir);
                }}
                className={`relative w-16 h-12 rounded border ${
                  isActive ? "border-yellow-500" : "border-[#ebdbb9]"
                } overflow-hidden bg-black/10`}
                aria-label={`Ver ${m.kind === "image" ? "imagen" : "video"} ${
                  i + 1
                }`}
              >
                {m.kind === "image" ? (
                  <img
                    src={buildImgUrl(m.src)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full grid place-content-center bg-black/70 text-white">
                    ▶
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Soporta import con o sin llaves
export { PropertyGallery };
