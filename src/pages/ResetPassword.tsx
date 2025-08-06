import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token de recuperación inválido.");
      return;
    }
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin/login");
        }, 2500);
      } else {
        const data = await res.json();
        setError(data.message || "Ocurrió un error.");
      }
    } catch {
      setError("Ocurrió un error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Restablecer contraseña</h1>
      {success ? (
        <div className="text-green-700 text-center font-semibold">
          ¡Contraseña cambiada correctamente!<br />
          Redirigiendo al login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            Nueva contraseña:
            <input
              className="w-full p-2 border rounded mt-1"
              type="password"
              value={password}
              required
              minLength={6}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <label className="block">
            Confirmar contraseña:
            <input
              className="w-full p-2 border rounded mt-1"
              type="password"
              value={confirm}
              required
              minLength={6}
              onChange={e => setConfirm(e.target.value)}
            />
          </label>
          <button
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-primary/90"
            type="submit"
            disabled={loading}
          >
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      )}
      {error && (
        <div className="mt-4 text-center text-red-700 font-semibold">{error}</div>
      )}
    </div>
  );
}
