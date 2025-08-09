import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSearchParams, useNavigate } from "react-router-dom";

interface FormValues {
  password: string;
  confirm: string;
}

const schema = yup.object({
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

export default function ResetPassword() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const API = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    if (!token) {
      setServerError("Enlace inválido o expirado. Solicitá uno nuevo.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Error al cambiar la contraseña");
      }

      setSuccess(true);
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err: any) {
      setServerError(err.message || "Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10">
      <div className="bg-crema rounded-xl shadow-lg max-w-md w-full px-6 py-8 animate-fade-in border border-[#ebdbb9]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#594317]">
          Restablecer contraseña
        </h1>

        {success ? (
          <div className="text-center font-semibold bg-green-100 text-green-800 border border-green-300 rounded px-4 py-3">
            ¡Contraseña cambiada correctamente!
            <br />
            Redirigiendo al login...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            autoComplete="off"
          >
            {!token && (
              <div className="text-center font-medium bg-red-100 text-red-700 border border-red-300 rounded px-4 py-2">
                Enlace inválido o expirado. Solicitá uno nuevo.
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1 text-[#594317]">
                Nueva contraseña
              </label>
              <input
                {...register("password")}
                className="w-full p-2 rounded"
                type="password"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#594317]">
                Confirmar contraseña
              </label>
              <input
                {...register("confirm")}
                className="w-full p-2 rounded"
                type="password"
                placeholder="••••••••"
              />
              {errors.confirm && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirm.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="text-center font-medium bg-red-100 text-red-700 border border-red-300 rounded px-4 py-2">
                {serverError}
              </div>
            )}

            <button
              className="w-full py-2 rounded font-bold transition"
              type="submit"
              disabled={loading || !token}
            >
              {loading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
