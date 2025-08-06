import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Check } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { PropertyGallery } from "../components/PropertyGallery";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface IProperty {
  _id: string;
  ref: string;
  title: string;
  description?: string;
  price?: number;
  measure: number;
  location: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
  videoUrls: string[];
  operationType: string;
  environments: number;
  environmentsList: string[];
  bedrooms: number;
  bathrooms: number;
  condition: string;
  age: string;
  houseMeasures: string[];
  services: string[];
  extras: string[];
}

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Email inválido")
    .required("El email es obligatorio"),
  telefono: yup
    .string()
    .matches(/^\d{6,}$/, "Ingrese un número de teléfono válido")
    .required("El teléfono es obligatorio"),
  mensaje: yup.string().required("El mensaje es obligatorio"),
});

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<IProperty | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      mensaje: "",
    },
  });

  useEffect(() => {
    if (property) {
      reset({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: `Me interesa este campo y quiero obtener más información.\n\nREF: ${property.ref} - ${property.title}`,
      });
    }
  }, [property, reset]);

  useEffect(() => {
    setPropertyLoading(true);
    if (!id) return;
    fetch(`http://localhost:3000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProperty(data);
        setPropertyLoading(false);
      })
      .catch(() => setPropertyLoading(false));
  }, [id]);

  if (propertyLoading) {
    return <p className="p-8">Cargando propiedad…</p>;
  }

  if (!property) {
    return <p className="p-8 text-red-600">No se encontró la propiedad.</p>;
  }

  async function onSubmit(data: any) {
    setMsg(null);
    setFormLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/contact-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ref: property?.ref,
          titulo: property?.title,
          url: window.location.href,
        }),
      });
      if (res.ok) {
        setMsg("¡Consulta enviada correctamente! Pronto nos contactaremos.");
        reset({
          nombre: "",
          email: "",
          telefono: "",
          mensaje: `Me interesa este campo y quiero obtener más información.\n\nREF: ${property?.ref} - ${property?.title}`,
        });
      } else {
        setMsg("Ocurrió un error. Intente de nuevo.");
      }
    } catch (err) {
      setMsg("Ocurrió un error al enviar la consulta.");
    } finally {
      setFormLoading(false);
    }
  }

  if (!property) {
    return <p className="p-8">Cargando propiedad…</p>;
  }

  const pos: [number, number] = [property.lat ?? 0, property.lng ?? 0];

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-8 space-y-10 animate-fade-in">
      {/* HEADER: Título, Ref, Precio, Tipo de operación */}
      <section className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b pb-4">
        {/* Título y referencia */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl md:text-3xl font-bold break-words truncate md:whitespace-normal"
            title={property.title}
          >
            {property.title}
          </h1>
          <p className="text-gray-600 mt-1 truncate md:whitespace-normal">
            <span className="font-semibold">REF:</span> {property.ref}
          </p>
        </div>
        {/* Precio y operación */}
        <div className="flex flex-col items-end md:items-end min-w-[180px] md:min-w-[240px]">
          <span className="text-2xl md:text-3xl text-green-600 font-bold">
            {property.operationType === "Arrendamiento"
              ? "Precio a acordar"
              : property.price
              ? `$${property.price.toLocaleString()}`
              : "Sin precio"}
          </span>
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold mt-2">
            {property.operationType}
          </span>
        </div>
      </section>

      {/* Galería */}
      <section className="w-full flex flex-col items-center">
        <div className="w-full max-w-2xl mx-auto">
          <PropertyGallery
            images={property.imageUrls}
            videos={property.videoUrls}
          />
        </div>
      </section>

      {/* Ubicación y hectáreas */}
      <section className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="text-base font-semibold text-left md:text-lg">
          <span className="font-bold">Ubicación:</span>{" "}
          <span className="text-gray-700">{property.location}</span>
        </div>
        <div className="text-base font-semibold text-left md:text-lg">
          <span className="font-bold">Hectáreas:</span>{" "}
          <span className="text-primary font-bold">
            {property.measure?.toLocaleString()} ha
          </span>
        </div>
      </section>

      {/* Mapa */}
      {property.lat != null && property.lng != null && (
        <section>
          <div className="w-full flex justify-center">
            <div className="h-72 w-full max-w-2xl rounded-xl overflow-hidden shadow">
              <MapContainer center={pos} zoom={16} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker
                  position={pos}
                  icon={L.icon({
                    iconUrl:
                      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                    iconAnchor: [12, 41],
                  })}
                >
                  <Popup>{property.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </section>
      )}

      {/* Descripción, servicios y extras */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Descripción */}
          {property.description && (
            <div>
              <h2 className="text-xl font-bold mb-2">Descripción</h2>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line break-words">
                {property.description}
              </p>
            </div>
          )}

          {/* Servicios */}
          {property.services?.length > 0 && property.services.some(Boolean) && (
            <div>
              <h2 className="text-xl font-bold mb-2">Servicios</h2>
              <ul className="flex flex-wrap gap-2">
                {property.services.filter(Boolean).map((serv, i) => (
                  <li
                    key={i}
                    className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1"
                  >
                    <Check className="w-4 h-4 text-blue-600 mr-1" />
                    {serv}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Extras */}
          {property.extras?.length > 0 && property.extras.some(Boolean) && (
            <div>
              <h2 className="text-xl font-bold mb-2">Extras</h2>
              <ul className="flex flex-wrap gap-2">
                {property.extras.filter(Boolean).map((ext, i) => (
                  <li
                    key={i}
                    className="flex items-center bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1"
                  >
                    <Check className="w-4 h-4 text-purple-600 mr-1" />
                    {ext}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Vivienda/adicionales y ambientes */}
        {property.extras?.includes("Vivienda") && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Detalles de la vivienda</h2>
            <div className="grid grid-cols-2 gap-2 text-sm border rounded-xl bg-gray-50 dark:bg-[#22223b] p-4">
              {property.houseMeasures && (
                <div>
                  <strong>Superficie:</strong> {property.houseMeasures}m²
                </div>
              )}
              {property.environments ? (
                <div>
                  <strong>Ambientes:</strong> {property.environments}
                </div>
              ) : null}
              {property.bedrooms ? (
                <div>
                  <strong>Dormitorios:</strong> {property.bedrooms}
                </div>
              ) : null}
              {property.bathrooms ? (
                <div>
                  <strong>Baños:</strong> {property.bathrooms}
                </div>
              ) : null}
              {property.condition && (
                <div>
                  <strong>Condición:</strong> {property.condition}
                </div>
              )}
              {property.age && (
                <div>
                  <strong>Antigüedad:</strong> {property.age}
                </div>
              )}
            </div>
            {/* Ambientes detallados */}
            {property.environmentsList?.length > 0 &&
              property.environmentsList.some(Boolean) && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Ambientes</h2>
                  <ul className="flex flex-wrap gap-2">
                    {property.environmentsList.filter(Boolean).map((amb, i) => (
                      <li
                        key={i}
                        className="flex items-center bg-green-50 dark:bg-green-900/20 rounded px-2 py-1"
                      >
                        <Check className="w-4 h-4 text-green-600 mr-1" />
                        {amb}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </section>

      {/* CONTACTO */}
      <section className="max-w-lg mx-auto mt-12 bg-gray-100 dark:bg-[#2e2e48] rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Contacto</h2>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div>
            <input
              {...register("nombre")}
              placeholder="Tu nombre"
              className="w-full p-2 border rounded"
              disabled={propertyLoading}
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...register("email")}
              placeholder="Tu email"
              className="w-full p-2 border rounded"
              disabled={propertyLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...register("telefono")}
              placeholder="Teléfono / WhatsApp"
              className="w-full p-2 border rounded"
              disabled={propertyLoading}
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
          <div>
            <textarea
              {...register("mensaje")}
              rows={5}
              className="w-full p-2 border rounded"
              disabled={propertyLoading}
              placeholder="Escribe tu mensaje"
            />
            {errors.mensaje && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mensaje.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="
              w-full py-2 rounded-lg font-semibold shadow bg-gradient-to-r
              from-blue-600 via-indigo-600 to-purple-600 text-white
              hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600
              transition-all duration-200 active:scale-95
            "
            disabled={formLoading}
          >
            {formLoading ? "Enviando..." : "Enviar"}
          </button>

          {msg && (
            <div
              className={`mt-3 text-center font-semibold ${
                msg.includes("correctamente")
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {msg}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
