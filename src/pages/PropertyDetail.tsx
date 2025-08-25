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
  bedrooms: number;
  bathrooms: number;
  condition: string;
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
  const API = import.meta.env.VITE_API_URL;

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
    fetch(`${API}/properties/${id}`)
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
      const res = await fetch(`${API}/contact-property`, {
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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8">
      <div className="bg-crema rounded-2xl shadow-xl p-4 sm:p-8 space-y-10 animate-fade-in border border-[#ebdbb9]">
        {/* HEADER */}
        <section className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-primary/20 pb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold break-words whitespace-normal hyphens-none drop-shadow mb-2">
              {property.title}
            </h1>
            <p className="mt-1 truncate md:whitespace-normal !text-[#514737]">
              <span className="font-semibold">REF:</span> {property.ref}
            </p>
          </div>
          <div className="flex flex-col items-end min-w-[180px] md:min-w-[240px]">
            <span className="text-2xl md:text-3xl text-green-600 font-bold">
              {property.operationType === "Arrendamiento"
                ? "Precio a acordar"
                : property.price
                ? `U$S ${property.price.toLocaleString()}`
                : "Sin precio"}
            </span>
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold mt-2">
              {property.operationType}
            </span>
          </div>
        </section>

        {/* GALERÍA */}
        <section className="w-full flex flex-col items-center">
          <div className="w-full max-w-2xl mx-auto bg-crema-strong rounded-xl shadow p-2">
            <PropertyGallery
              images={property.imageUrls}
              videos={property.videoUrls}
            />
          </div>
        </section>

        {/* UBICACIÓN Y HECTÁREAS */}
        <section className="flex flex-col md:flex-row md:justify-center md:items-center md:gap-50 gap-6">
          <div className="text-base font-semibold md:text-lg">
            <span className="font-bold">Ubicación:</span>{" "}
            <span>{property.location}</span>
          </div>
          <div className="text-base font-semibold md:text-lg">
            <span className="font-bold">Hectáreas:</span>{" "}
            <span className="text-primary font-bold">
              {property.measure?.toLocaleString()} ha
            </span>
          </div>
        </section>

        {/* MAPA */}
        {property.lat != null && property.lng != null && (
          <section>
            <div className="w-full flex justify-center">
              <div className="h-72 w-full max-w-2xl rounded-xl overflow-hidden shadow-lg bg-card-strong">
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

        {/* DESCRIPCIÓN, SERVICIOS, EXTRAS, VIVIENDA */}
        <section
          className={
            property.extras?.includes("Vivienda")
              ? "grid gap-6 md:grid-cols-2"
              : "grid gap-6"
          }
        >
          {/* DESCRIPCIÓN: SIEMPRE UNA SOLA COLUMNA, TODA LA FILA */}
          {property.description && (
            <div className="w-full bg-crema-strong rounded-xl p-5 font-normal shadow md:col-span-2">
              <h2 className="text-xl font-bold mb-2">Descripción</h2>
              <p className="whitespace-pre-line break-words">
                {property.description}
              </p>
            </div>
          )}

          {/* Detalles vivienda y ambientes */}
          {property.extras?.includes("Vivienda") && (
            <>
              <div className="w-full bg-crema-strong rounded-xl p-5 font-normal shadow">
                <h2 className="text-xl font-bold mb-2">
                  Detalles de la vivienda
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
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
                </div>
              </div>
            </>
          )}

          {/* Servicios */}
          {property.services?.length > 0 && property.services.some(Boolean) && (
            <div className="w-full bg-crema-strong rounded-xl p-5 font-normal shadow">
              <h2 className="text-xl font-bold mb-2">Servicios</h2>
              <ul className="flex flex-wrap gap-2">
                {property.services.filter(Boolean).map((serv, i) => (
                  <li
                    key={i}
                    className="flex items-center bg-blue-800/10 rounded px-2 py-1"
                  >
                    <Check className="w-4 h-4 text-blue-500 mr-1" />
                    {serv}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Extras */}
          {property.extras?.length > 0 && property.extras.some(Boolean) && (
            <div className="w-full bg-crema-strong rounded-xl p-5 font-normal shadow">
              <h2 className="text-xl font-bold mb-2">Extras</h2>
              <ul className="flex flex-wrap gap-2">
                {property.extras.filter(Boolean).map((ext, i) => (
                  <li
                    key={i}
                    className="flex items-center bg-yellow-800/10 rounded px-2 py-1"
                  >
                    <Check className="w-4 h-4 text-red-700 mr-1" />
                    {ext}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* CONTACTO */}
        <section className="max-w-lg mx-auto mt-12 bg-crema-strong rounded-xl p-6 shadow border border-primary/30">
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
                className="w-full p-2 rounded bg-crema border border-primary/30 placeholder:text-[#bba975]"
                disabled={propertyLoading}
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>
            <div>
              <input
                {...register("email")}
                placeholder="Tu email"
                className="w-full p-2 rounded bg-crema border border-primary/30 placeholder:text-[#bba975]"
                disabled={propertyLoading}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <input
                {...register("telefono")}
                placeholder="Teléfono / WhatsApp"
                className="w-full p-2 rounded bg-crema border border-primary/30 placeholder:text-[#bba975]"
                disabled={propertyLoading}
                onInput={(e) => {
                  // @ts-ignore
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
              />
              {errors.telefono && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>
            <div>
              <textarea
                {...register("mensaje")}
                rows={5}
                className="w-full p-2 rounded bg-crema border border-primary/30 placeholder:text-[#bba975]"
                disabled={propertyLoading}
                placeholder="Escribe tu mensaje"
              />
              {errors.mensaje && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.mensaje.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold shadow bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all duration-200 active:scale-95"
              disabled={formLoading}
            >
              {formLoading ? "Enviando..." : "Enviar"}
            </button>

            {msg && (
              <div
                className={`mt-3 text-center font-semibold ${
                  msg.includes("correctamente")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {msg}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
