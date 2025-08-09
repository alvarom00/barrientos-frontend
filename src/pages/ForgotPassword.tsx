import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Siempre mostrar el mismo mensaje por seguridad
      setMessage(
        "Si el email existe, se envió un enlace para recuperar la contraseña."
      );
    } catch {
      setMessage("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-crema rounded-xl shadow-lg max-w-md w-full px-6 py-8 space-y-6 animate-fade-in border border-[#ebdbb9]"
        autoComplete="off"
      >
        <h1 className="text-2xl font-bold text-center text-[#594317]">
          Recuperar contraseña
        </h1>

        <label className="block font-semibold mb-1 text-[#594317]">
          Email
          <input
            className="mt-1 w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            type="email"
            value={email}
            required
            placeholder="tuemail@ejemplo.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <button
          className="
            w-full py-2 rounded-lg font-semibold shadow
            bg-[#ffe8ad] text-[#594317]
            hover:bg-[#f5e3b8] hover:text-[#ad924a]
            transition-all duration-200 active:scale-95 border border-[#ebdbb9]
          "
          type="submit"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>

        {message && (
          <div className="mt-2 text-center text-[#217844] font-semibold">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
