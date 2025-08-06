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
    } catch (err) {
      setMessage("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Recuperar contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Email:
          <input
            className="w-full p-2 border rounded mt-1"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          type="submit"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
      {message && (
        <div className="mt-4 text-center text-green-700 font-semibold">
          {message}
        </div>
      )}
    </div>
  );
}
