import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

type LoginForm = {
  email: string;
  password: string;
};

const API = import.meta.env.VITE_API_URL;

const schema = yup.object({
  email: yup
    .string()
    .email("Ingresá un correo válido")
    .required("El email es obligatorio"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
});

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.message || "Email o contraseña incorrectos.");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch {
      setServerError(
        "No se pudo conectar con el servidor. Intentá nuevamente."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="bg-crema rounded-xl shadow-lg max-w-md w-full px-6 py-8 animate-fade-in border border-[#ebdbb9]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[#594317]">
          Admin Login
        </h2>

        {/* Email */}
        <label className="block font-semibold mb-1 text-[#594317]">Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="ejemplo@correo.com"
          className="w-full p-2 rounded"
        />
        {errors.email?.message && (
          <div className="error text-sm mt-1">{errors.email.message}</div>
        )}

        {/* Password */}
        <label className="block font-semibold mb-3 mt-4 text-[#594317]">
          Contraseña
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full p-2 rounded"
        />
        {errors.password?.message && (
          <div className="error text-sm mt-1">{errors.password.message}</div>
        )}

        {/* Error del servidor (si ocurre) */}
        {serverError && (
          <div className="error text-center mt-4 font-semibold">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded font-bold transition mt-6"
        >
          {isSubmitting ? "Entrando..." : "Login"}
        </button>

        <Link
          to="/forgot-password"
          className="block mt-3 text-center hover:underline"
          style={{ color: "#6B5432" }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </div>
  );
}
