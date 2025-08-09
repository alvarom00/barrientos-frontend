import { Link } from "react-router-dom";

interface ErrorPageProps {
  code?: number | string;
  title?: string;
  message?: string;
  showHome?: boolean;
}

export default function ErrorPage({
  code = "404",
  title = "Página no encontrada",
  message = "La página que buscas no existe.",
  showHome = true,
}: ErrorPageProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent py-10">
      <div className="text-center p-8 bg-crema rounded-xl shadow-lg animate-fade-in border border-[#ebdbb9] max-w-lg w-full">
        <h1 className="text-7xl font-black text-[#b2914a] mb-2">{code}</h1>
        <h2 className="text-2xl font-bold text-[#594317] mb-3">{title}</h2>
        <p className="text-[#7a6b48] mb-6">{message}</p>
        {showHome && (
          <Link
            to="/"
            className="
              inline-block px-6 py-2 mt-4 rounded-lg font-semibold shadow
              bg-[#ffe8ad] text-[#594317]
              hover:bg-[#f5e3b8] hover:text-[#ad924a]
              transition-all duration-200 active:scale-95 border border-[#ebdbb9]
            "
          >
            Volver al inicio
          </Link>
        )}
      </div>
    </div>
  );
}
