import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error de autenticación");
      } else {
        // Guardá el token
        localStorage.setItem("token", data.token);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border mb-4"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Login"}
        </button>
        <Link
          to="/forgot-password"
          className="text-primary hover:underline block mt-2"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        {error && (
          <div className="text-red-600 font-semibold mt-2 text-center">{error}</div>
        )}
      </form>
    </div>
  );
}
