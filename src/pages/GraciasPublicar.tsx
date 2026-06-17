import { useEffect } from "react";
import { Link } from "react-router-dom";
import { trackPendingGoogleAdsConversion } from "../utils/googleAds";

export default function GraciasPublicar() {
  useEffect(() => {
    trackPendingGoogleAdsConversion("publicar");
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent py-10">
      <div className="text-center p-8 bg-crema rounded-xl shadow-lg animate-fade-in border border-[#ebdbb9] max-w-lg w-full">
        <h1 className="text-5xl font-black text-[#b2914a] mb-3">
          ¡Gracias!
        </h1>

        <h2 className="text-2xl font-bold text-[#594317] mb-3">
          Recibimos los datos de tu campo
        </h2>

        <p className="text-[#7a6b48] mb-6">
          Nos pondremos en contacto a la brevedad para asesorarte sobre la venta
          o arrendamiento de tu propiedad.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-block px-6 py-2 rounded-lg font-semibold shadow bg-[#ffe8ad] text-[#594317] hover:bg-[#f5e3b8] hover:text-[#ad924a] transition-all duration-200 active:scale-95 border border-[#ebdbb9]"
          >
            Volver al inicio
          </Link>

          <Link
            to="/publicar"
            className="inline-block px-6 py-2 rounded-lg font-semibold shadow bg-[#c7ae79] text-[#1b2328] hover:opacity-90 transition-all duration-200 active:scale-95 border border-[#b2914a]"
          >
            Publicar otro campo
          </Link>
        </div>
      </div>
    </div>
  );
}
