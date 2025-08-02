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
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#232347] dark:to-[#1a1a30]">
      <div className="text-center p-8 bg-white dark:bg-[#232347] rounded-xl shadow-xl animate-fade-in">
        <h1 className="text-7xl font-black text-primary mb-2">{code}</h1>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6">{message}</p>
        {showHome && (
          <Link
            to="/"
            className="inline-block bg-primary text-white rounded-full px-6 py-2 mt-4 shadow hover:scale-105 hover:bg-primary/90 transition"
          >
            Volver al inicio
          </Link>
        )}
      </div>
    </div>
  );
}
