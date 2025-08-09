import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre y apellido es obligatorio"),
  email: yup
    .string()
    .email("Ingrese un correo electrónico válido")
    .required("El email es obligatorio"),
  eres: yup
    .string()
    .oneOf(["Propietario", "Inmobiliaria", "Vendedor"], "Seleccione una opción")
    .required("Este campo es obligatorio"),
  queres: yup
    .string()
    .oneOf(["Vender", "Arrendar", "Ambas"], "Seleccione una opción")
    .required("Este campo es obligatorio"),
  ubicacion: yup.string().required("La ubicación es obligatoria"),
  superficie: yup
    .number()
    .typeError("Ingrese solo números")
    .positive("La superficie debe ser mayor a 0")
    .required("La superficie es obligatoria"),
  tipoCampo: yup
    .string()
    .oneOf(
      ["Agricola", "Ganadero", "Mixto", "Turistico / Recreativo", "Otro"],
      "Seleccione un tipo de campo"
    )
    .required("Este campo es obligatorio"),
  precio: yup
    .number()
    .typeError("Ingrese solo números")
    .min(0, "El precio no puede ser negativo")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  caracteristicas: yup.string(),
  documentacion: yup
    .string()
    .oneOf(["Si", "En tramite", "No"], "Seleccione una opción")
    .required("Este campo es obligatorio"),
  fotosVideos: yup
    .string()
    .oneOf(
      [
        "Si, ya tengo",
        "No, necesito ayuda para crearlos",
        "Tengo, pero quiero mejorarlos",
      ],
      "Seleccione una opción"
    )
    .required("Este campo es obligatorio"),
  publicarRedes: yup
    .string()
    .oneOf(
      [
        "Si, con ubicacion aproximada",
        "Si, con detalles completos",
        "No, solo para contactos privados",
      ],
      "Seleccione una opción"
    )
    .required("Este campo es obligatorio"),
  telefono: yup
    .string()
    .matches(/^\d{6,}$/, "Ingrese un número de teléfono válido")
    .required("El teléfono es obligatorio"),
  comentarios: yup.string(),
});

export default function Publicar() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const [triedSubmit, setTriedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setTriedSubmit(false);
    setSuccess(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("No se pudo enviar el formulario");
      setSuccess(
        "¡Formulario enviado correctamente! Pronto nos pondremos en contacto."
      );
      reset();
    } catch (e) {
      setError("Ocurrió un error al enviar el formulario. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const onError = () => setTriedSubmit(true);

  return (
  <div className="min-h-screen flex items-center justify-center py-10 bg-transparent">
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="bg-crema rounded-xl shadow-lg max-w-md w-full px-6 py-8 space-y-6 animate-fade-in border border-[#ebdbb9]"
      autoComplete="off"
    >
      <h1 className="text-2xl font-bold mb-4 text-center text-[#594317]">
        Publicar mi campo
      </h1>

      {triedSubmit && !isValid && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-center font-medium mb-2">
          Por favor, complete todos los campos obligatorios.
        </div>
      )}

      {/* Nombre y Apellido */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Nombre y Apellido <span className="text-red-500">*</span>
        </label>
        <input
          {...register("nombre")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="Nombre y Apellido"
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="ejemplo@correo.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Sos */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Sos <span className="text-red-500">*</span>
        </label>
        <select
          {...register("eres")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
          defaultValue=""
        >
          <option value="">Seleccione una opción</option>
          <option value="Propietario">Propietario</option>
          <option value="Inmobiliaria">Inmobiliaria</option>
          <option value="Vendedor">Vendedor</option>
        </select>
        {errors.eres && (
          <p className="text-red-500 text-sm mt-1">{errors.eres.message}</p>
        )}
      </div>

      {/* Queres */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Querés <span className="text-red-500">*</span>
        </label>
        <select
          {...register("queres")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
          defaultValue=""
        >
          <option value="">Seleccione una opción</option>
          <option value="Vender">Vender</option>
          <option value="Arrendar">Arrendar</option>
          <option value="Ambas">Ambas</option>
        </select>
        {errors.queres && (
          <p className="text-red-500 text-sm mt-1">{errors.queres.message}</p>
        )}
      </div>

      {/* Ubicación del campo */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Ubicación del campo <span className="text-red-500">*</span>
        </label>
        <input
          {...register("ubicacion")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="Ej: Partido de..."
        />
        {errors.ubicacion && (
          <p className="text-red-500 text-sm mt-1">
            {errors.ubicacion.message}
          </p>
        )}
      </div>

      {/* Superficie total */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Superficie total (en hectáreas) <span className="text-red-500">*</span>
        </label>
        <input
          {...register("superficie")}
          type="number"
          min={1}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="Ej: 150"
        />
        {errors.superficie && (
          <p className="text-red-500 text-sm mt-1">
            {errors.superficie.message}
          </p>
        )}
      </div>

      {/* Tipo de campo */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Tipo de campo <span className="text-red-500">*</span>
        </label>
        <select
          {...register("tipoCampo")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
          defaultValue=""
        >
          <option value="">Seleccione una opción</option>
          <option value="Agricola">Agricola</option>
          <option value="Ganadero">Ganadero</option>
          <option value="Mixto">Mixto</option>
          <option value="Turistico / Recreativo">
            Turístico / Recreativo
          </option>
          <option value="Otro">Otro</option>
        </select>
        {errors.tipoCampo && (
          <p className="text-red-500 text-sm mt-1">
            {errors.tipoCampo.message}
          </p>
        )}
      </div>

      {/* Precio estimado por hectárea */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Precio estimado por hectárea (en USD)
        </label>
        <input
          {...register("precio")}
          type="number"
          min={0}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="Ej: 2500"
        />
        {errors.precio && (
          <p className="text-red-500 text-sm mt-1">{errors.precio.message}</p>
        )}
      </div>

      {/* ¿Qué características querés destacar? */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          ¿Qué características querés destacar?
        </label>
        <input
          {...register("caracteristicas")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="Ej: Acceso asfaltado, casa principal, galpón, etc."
        />
        {errors.caracteristicas && (
          <p className="text-red-500 text-sm mt-1">
            {errors.caracteristicas.message}
          </p>
        )}
      </div>

      {/* ¿Tenés escritura o documentación lista? */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          ¿Tenés escritura o documentación lista? <span className="text-red-500">*</span>
        </label>
        <select
          {...register("documentacion")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
          defaultValue=""
        >
          <option value="">Seleccione una opción</option>
          <option value="Si">Sí</option>
          <option value="En tramite">En trámite</option>
          <option value="No">No</option>
        </select>
        {errors.documentacion && (
          <p className="text-red-500 text-sm mt-1">
            {errors.documentacion.message}
          </p>
        )}
      </div>

      {/* ¿Tenés fotos o videos del campo? */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          ¿Tenés fotos o videos del campo? <span className="text-red-500">*</span>
        </label>
        <select
          {...register("fotosVideos")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
          defaultValue=""
        >
          <option value="">Seleccione una opción</option>
          <option value="Si, ya tengo">Sí, ya tengo</option>
          <option value="No, necesito ayuda para crearlos">
            No, necesito ayuda para crearlos
          </option>
          <option value="Tengo, pero quiero mejorarlos">
            Tengo, pero quiero mejorarlos
          </option>
        </select>
        {errors.fotosVideos && (
          <p className="text-red-500 text-sm mt-1">
            {errors.fotosVideos.message}
          </p>
        )}
      </div>

      {/* ¿Estás dispuesto a que se publique el campo en redes sociales? */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          ¿Estás dispuesto a que se publique el campo en redes sociales? <span className="text-red-500">*</span>
        </label>
        <select
          {...register("publicarRedes")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
          defaultValue=""
        >
          <option value="">Seleccione una opción</option>
          <option value="Si, con ubicacion aproximada">
            Sí, con ubicación aproximada
          </option>
          <option value="Si, con detalles completos">
            Sí, con detalles completos
          </option>
          <option value="No, solo para contactos privados">
            No, solo para contactos privados
          </option>
        </select>
        {errors.publicarRedes && (
          <p className="text-red-500 text-sm mt-1">
            {errors.publicarRedes.message}
          </p>
        )}
      </div>

      {/* Teléfono / WhatsApp */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Teléfono / WhatsApp <span className="text-red-500">*</span>
        </label>
        <input
          {...register("telefono")}
          type="tel"
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
          placeholder="Ej: 11 2345 6789"
          onInput={(e) => {
            // @ts-ignore
            e.target.value = e.target.value.replace(/\D/g, "");
          }}
        />
        {errors.telefono && (
          <p className="text-red-500 text-sm mt-1">
            {errors.telefono.message}
          </p>
        )}
      </div>

      {/* Comentarios */}
      <div>
        <label className="block font-semibold mb-1 text-[#594317]">
          Comentarios o algo que quieras agregar
        </label>
        <textarea
          {...register("comentarios")}
          className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] resize-none"
          rows={3}
          placeholder="Opcional"
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        className="
          w-full py-2 rounded-lg font-semibold shadow
          bg-[#ffe8ad] text-[#594317]
          hover:bg-[#f5e3b8] hover:text-[#ad924a]
          transition-all duration-200 active:scale-95 border border-[#ebdbb9]
        "
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar consulta"}
      </button>

      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-center font-medium mb-2">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-center font-medium mb-2">
          {error}
        </div>
      )}
    </form>
  </div>
);
}
