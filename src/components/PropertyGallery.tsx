import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { useState } from "react";

interface PropertyGalleryProps {
  images: string[];
  videos: string[];
}

export function PropertyGallery({ images = [], videos = [] }: PropertyGalleryProps) {
  // Juntamos ambos (imágenes y videos)
  const media = [
    ...images.map((src) => ({ type: "image" as const, src })),
    ...videos.map((src) => ({ type: "video" as const, src })),
  ];
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  if (media.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      {/* GALERÍA PRINCIPAL */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        className="rounded-xl shadow-lg gallery-main"
        style={{ "--swiper-navigation-color": "#fff" } as any}
      >
        {media.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full aspect-video bg-gray-100 dark:bg-[#292945] flex items-center justify-center rounded-xl overflow-hidden">
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={`Imagen ${idx + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <video
                  src={item.src}
                  controls
                  className="w-full h-full object-cover bg-black"
                  style={{ background: "#111" }}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* MINIATURAS */}
      {media.length > 1 && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView={Math.min(media.length, 5)}
          spaceBetween={8}
          watchSlidesProgress
          className="mt-4 gallery-thumbs"
        >
          {media.map((item, i) => (
            <SwiperSlide key={i} className="!w-auto">
              <div
                className="rounded-lg border border-gray-200 dark:border-[#393964] aspect-video overflow-hidden"
                style={{ width: 70, height: 50, minWidth: 70, minHeight: 50, background: "#111" }}
              >
                {item.type === "image" ? (
                  <img src={item.src} alt="" className="object-cover w-full h-full" draggable={false} />
                ) : (
                  <video
                    src={item.src}
                    className="object-cover w-full h-full"
                    muted
                    preload="metadata"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
