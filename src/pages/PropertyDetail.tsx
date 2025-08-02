import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Check } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { PropertyGallery } from "../components/PropertyGallery";

interface IProperty {
  _id: string;
  ref: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
  videoUrls: string[];
  operationType: string;
  propertyType: string;
  environments: number;
  environmentsList: string[];
  bedrooms: number;
  bathrooms: number;
  condition: string;
  age: string;
  measuresList: string[];
  services: string[];
  extras: string[];
  floor?: string;
  apartmentNumber?: string;
  pricePerDay?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<IProperty | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/properties/${id}`)
      .then((r) => r.json())
      .then(setProperty)
      .catch(console.error);
  }, [id]);

  if (!property) {
    return <p className="p-8">Cargando propiedad…</p>;
  }

  const pos: [number, number] = [property.lat ?? 0, property.lng ?? 0];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-fade-in">
      {/* Galería con swipe y miniaturas */}
      <PropertyGallery images={property.imageUrls} videos={property.videoUrls} />

      {/* HEADER: Título, Ref, Precio, Tipo de operación */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-gray-600">REF. {property.ref}</p>
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold mt-2">
            {property.operationType}
          </span>
        </div>
        <div className="text-3xl text-green-600 font-bold mt-4 md:mt-0">
          ${property.price?.toLocaleString()}
        </div>
      </div>

      {/* UBICACIÓN */}
      <div className="text-gray-700 text-lg">{property.location}</div>

      {/* RESUMEN DE CARACTERÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm border rounded-xl bg-gray-50 dark:bg-[#22223b] p-4">
        <div><strong>Tipo:</strong> {property.propertyType}</div>
        {property.environments ? (
          <div><strong>Ambientes:</strong> {property.environments}</div>
        ) : null}
        {property.bedrooms ? (
          <div><strong>Dormitorios:</strong> {property.bedrooms}</div>
        ) : null}
        {property.bathrooms ? (
          <div><strong>Baños:</strong> {property.bathrooms}</div>
        ) : null}
        <div><strong>Condición:</strong> {property.condition}</div>
        <div><strong>Antigüedad:</strong> {property.age}</div>
        {/* Departamento extra info */}
        {property.propertyType === "Departamento" && property.floor && (
          <div><strong>Piso:</strong> {property.floor}</div>
        )}
        {property.propertyType === "Departamento" && property.apartmentNumber && (
          <div><strong>Depto.:</strong> {property.apartmentNumber}</div>
        )}
        {/* Alquiler temporal precios */}
        {property.operationType === "Alquiler temporal" && property.pricePerDay && (
          <div><strong>Precio por día:</strong> ${property.pricePerDay}</div>
        )}
        {property.operationType === "Alquiler temporal" && property.pricePerWeek && (
          <div><strong>Precio por semana:</strong> ${property.pricePerWeek}</div>
        )}
        {property.operationType === "Alquiler temporal" && property.pricePerMonth && (
          <div><strong>Precio por mes:</strong> ${property.pricePerMonth}</div>
        )}
      </div>

      {/* SUPERFICIES Y MEDIDAS */}
      {property.measuresList?.length > 0 && property.measuresList.some(Boolean) && (
        <div>
          <h2 className="text-xl font-bold mb-2">Superficies y Medidas</h2>
          <ul className="list-disc list-inside">
            {property.measuresList.filter(Boolean).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AMBIENTES DETALLADOS */}
      {property.environmentsList?.length > 0 && property.environmentsList.some(Boolean) && (
        <div>
          <h2 className="text-xl font-bold mb-2">Ambientes</h2>
          <ul className="flex flex-wrap gap-2">
            {property.environmentsList.filter(Boolean).map((amb, i) => (
              <li key={i} className="flex items-center bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
                <Check className="w-4 h-4 text-green-600 mr-1" />
                {amb}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SERVICIOS */}
      {property.services?.length > 0 && property.services.some(Boolean) && (
        <div>
          <h2 className="text-xl font-bold mb-2">Servicios</h2>
          <ul className="flex flex-wrap gap-2">
            {property.services.filter(Boolean).map((serv, i) => (
              <li key={i} className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
                <Check className="w-4 h-4 text-blue-600 mr-1" />
                {serv}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* EXTRAS */}
      {property.extras?.length > 0 && property.extras.some(Boolean) && (
        <div>
          <h2 className="text-xl font-bold mb-2">Extras</h2>
          <ul className="flex flex-wrap gap-2">
            {property.extras.filter(Boolean).map((ext, i) => (
              <li key={i} className="flex items-center bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
                <Check className="w-4 h-4 text-purple-600 mr-1" />
                {ext}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DESCRIPCIÓN */}
      {property.description && (
        <div>
          <h2 className="text-xl font-bold mb-2">Descripción</h2>
          <p className="text-gray-800 dark:text-gray-200">{property.description}</p>
        </div>
      )}

      {/* MAPA */}
      {property.lat != null && property.lng != null && (
        <div>
          <h2 className="text-xl font-bold mb-2">Ubicación</h2>
          <div className="h-80 w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow">
            <MapContainer center={pos} zoom={16} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker
                position={pos}
                icon={L.icon({
                  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>{property.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* CONTACTO */}
      <div className="max-w-xl mx-auto mt-12 bg-gray-100 dark:bg-[#2e2e48] rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Contacto</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Tu email"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            rows={5}
            required
            className="w-full p-2 border rounded"
            defaultValue={`REF. ${property.ref} - ${property.title}`}
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-white py-2 rounded font-semibold transition"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
