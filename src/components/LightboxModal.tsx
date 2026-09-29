import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { getAssetUrl } from "../utils/getAssetUrl";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem } from "./PropertyGallery";

interface LightboxModalProps {
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }),
};

const swipeConfidenceThreshold = 60;
const MAX_ZOOM = 3;
const DRAG_THRESHOLD = 5;

export function LightboxModal({
  media,
  currentIndex,
  setCurrentIndex,
  onClose,
}: LightboxModalProps) {
  const [[index, direction], setIndex] = useState<[number, number]>([
    currentIndex,
    0,
  ]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoomOrigin, setZoomOrigin] = useState({
    x: 50,
    y: 50,
  });

  // --------------------------------------------------
  // Mouse / desktop drag
  // --------------------------------------------------

  const isDragging = useRef(false);

  const hasDragged = useRef(false);

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const dragStartPan = useRef({
    x: 0,
    y: 0,
  });

  // --------------------------------------------------
  // Touch / pinch
  // --------------------------------------------------

  const xRef = useRef(0);

  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);

  const pinchStartPan = useRef({
    x: 0,
    y: 0,
  });

  const pinchStartCenter = useRef({
    x: 0,
    y: 0,
  });

  // --------------------------------------------------
  // Touch swipe
  // --------------------------------------------------

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      xRef.current = e.touches[0].clientX;
    }

    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);

      pinchStartDistance.current = distance;
      pinchStartZoom.current = zoom;

      const center = getTouchCenter(e.touches);

      pinchStartCenter.current = center;

      pinchStartPan.current = {
        x: pan.x,
        y: pan.y,
      };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2) return;

    e.preventDefault();

    const distance = getTouchDistance(e.touches);

    if (!pinchStartDistance.current) return;

    const scale =
      distance / pinchStartDistance.current;

    const newZoom = Math.max(
      1,
      Math.min(
        MAX_ZOOM,
        pinchStartZoom.current * scale
      )
    );

    const center = getTouchCenter(e.touches);

    const dx =
      center.x - pinchStartCenter.current.x;

    const dy =
      center.y - pinchStartCenter.current.y;

    setZoom(newZoom);

    setPan({
      x: pinchStartPan.current.x + dx,
      y: pinchStartPan.current.y + dy,
    });
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length === 0) {
      pinchStartDistance.current = null;
    }

    if (e.changedTouches.length !== 1) return;

    // Si estamos haciendo zoom/pan, no hacemos swipe
    if (zoom > 1) return;

    const dx =
      e.changedTouches[0].clientX - xRef.current;

    if (Math.abs(dx) > swipeConfidenceThreshold) {
      if (dx < 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
  }

  function getTouchDistance(
    touches: React.TouchList
  ): number {
    const dx =
      touches[0].clientX - touches[1].clientX;

    const dy =
      touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  function getTouchCenter(
    touches: React.TouchList
  ) {
    return {
      x:
        (touches[0].clientX +
          touches[1].clientX) /
        2,

      y:
        (touches[0].clientY +
          touches[1].clientY) /
        2,
    };
  }

  // --------------------------------------------------
  // Body scroll lock
  // --------------------------------------------------

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // --------------------------------------------------
  // Reset zoom when changing image
  // --------------------------------------------------

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setZoomOrigin({
      x: 50,
      y: 50,
    });
  }, [index]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const paginate = (newDirection: number) => {
    const next =
      (index + newDirection + media.length) %
      media.length;

    setIndex([next, newDirection]);
    setCurrentIndex(next);
  };

  // --------------------------------------------------
  // Keyboard
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        paginate(-1);
      }

      if (e.key === "ArrowRight") {
        paginate(1);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    // eslint-disable-next-line
  }, [index, media.length]);

  // --------------------------------------------------
  // Desktop click-to-zoom
  // --------------------------------------------------

  const handleImageClick = (
    e: React.MouseEvent<HTMLImageElement>
  ) => {
    // IMPORTANT:
    // If the mouse moved enough to be considered a drag,
    // ignore the click generated when releasing the mouse.
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width) *
      100;

    const y =
      ((e.clientY - rect.top) / rect.height) *
      100;

    if (zoom === 1) {
      setZoomOrigin({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });

      setZoom(2);

      setPan({
        x: 0,
        y: 0,
      });
    } else {
      setZoom(1);

      setPan({
        x: 0,
        y: 0,
      });

      setZoomOrigin({
        x: 50,
        y: 50,
      });
    }
  };

  // --------------------------------------------------
  // Desktop drag start
  // --------------------------------------------------

  const handleMouseDown = (
    e: React.MouseEvent
  ) => {
    if (zoom === 1) return;

    isDragging.current = true;

    hasDragged.current = false;

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
    };

    dragStartPan.current = {
      x: pan.x,
      y: pan.y,
    };
  };

  // --------------------------------------------------
  // Desktop drag move
  // --------------------------------------------------

  const handleMouseMove = (
    e: React.MouseEvent
  ) => {
    if (!isDragging.current) return;

    const dx =
      e.clientX - dragStart.current.x;

    const dy =
      e.clientY - dragStart.current.y;

    // Only consider it a real drag after moving
    // more than a few pixels.
    if (
      Math.abs(dx) > DRAG_THRESHOLD ||
      Math.abs(dy) > DRAG_THRESHOLD
    ) {
      hasDragged.current = true;
    }

    setPan({
      x: dragStartPan.current.x + dx,
      y: dragStartPan.current.y + dy,
    });
  };

  // --------------------------------------------------
  // Desktop drag end
  // --------------------------------------------------

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
    }
  };

  // --------------------------------------------------
  // Container
  // --------------------------------------------------

  const containerStyle: React.CSSProperties = {
    width: "min(92vw, 1100px)",
    maxWidth: "1100px",
    maxHeight: "80vh",
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return createPortal(
    <div
      className="fixed inset-0 z-1500 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClose}
    >
      {/* CLOSE */}

      <button
        className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition z-2000"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        <X size={32} />
      </button>

      {/* PREVIOUS */}

      <button
        className={clsx(
          "hidden md:flex absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition z-20",
          media.length < 2 &&
            "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation();
          paginate(-1);
        }}
        tabIndex={0}
        aria-label="Anterior"
      >
        <ChevronLeft size={32} />
      </button>

      {/* NEXT */}

      <button
        className={clsx(
          "hidden md:flex absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition z-20",
          media.length < 2 &&
            "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation();
          paginate(1);
        }}
        tabIndex={0}
        aria-label="Siguiente"
      >
        <ChevronRight size={32} />
      </button>

      {/* IMAGE / VIDEO CONTAINER */}

      <div
        className="flex items-center justify-center relative select-none overflow-hidden"
        style={containerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence
          custom={direction}
          initial={false}
        >
          <motion.div
            key={index}
            className="w-full h-full flex items-center justify-center"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.3,
              type: "tween",
              ease: "easeInOut",
            }}
            drag={zoom === 1 ? "x" : false}
            dragConstraints={{
              left: 0,
              right: 0,
            }}
            dragElastic={0.9}
            onDragEnd={(_, { offset }) => {
              if (zoom !== 1) return;

              const swipe =
                Math.abs(offset.x) >
                swipeConfidenceThreshold;

              if (swipe) {
                if (offset.x < 0) {
                  paginate(1);
                } else {
                  paginate(-1);
                }
              }
            }}
            style={{
              touchAction:
                zoom > 1 ? "none" : "pan-y",
            }}
          >
            {/* IMAGE */}

            {media[index].type === "image" && (
              <motion.img
                src={getAssetUrl(
                  media[index].url
                )}
                alt={`Vista ${index + 1}`}
                className="rounded-lg shadow-xl max-w-full max-h-[80vh] object-contain bg-black"
                draggable={false}
                animate={{
                  scale: zoom,
                  x: pan.x,
                  y: pan.y,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  cursor:
                    zoom === 1
                      ? "zoom-in"
                      : isDragging.current
                        ? "grabbing"
                        : "grab",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
                onClick={handleImageClick}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  handleMouseMove(e);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  handleMouseUp();
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  handleMouseLeave();
                }}
              />
            )}

            {/* VIDEO FILE */}

            {media[index].type ===
              "video-file" && (
              <video
                src={getAssetUrl(
                  media[index].url
                )}
                controls
                preload="metadata"
                className="rounded-lg shadow-xl max-w-full max-h-[80vh] bg-black"
                onClick={(e) =>
                  e.stopPropagation()
                }
              />
            )}

            {/* YOUTUBE / EMBED */}

            {media[index].type ===
              "video-embed" && (
              <div
                className="rounded-lg shadow-xl bg-black w-full"
                style={{
                  aspectRatio: "16 / 9",
                }}
              >
                <iframe
                  className="w-full h-full rounded-lg"
                  src={media[index].embedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${index + 1}`}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}