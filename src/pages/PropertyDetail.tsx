import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Check } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface IProperty {
  ref: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
  videoUrls: string[];
  propertyType: string;
  environments: number;
  environmentsList: string[];
  bedrooms: number;
  bathrooms: number;
  condition: string;
  age: string;
  measuresList: string[];
  services: string[];
  extrasList: string[];
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<IProperty | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:3000/api/properties/${id}`)
      .then(r => r.json())
      .then(setProperty)
      .catch(console.error);
  }, [id]);

  if (!property) {
    return <p className="p-8">Loading property…</p>;
  }

  const pos: [number, number] = [property.lat ?? 0, property.lng ?? 0];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold">{property.title}</h1>
      <p className="text-gray-600">REF. {property.ref}</p>
      <p className="text-xl text-green-600 font-semibold">
        ${property.price.toLocaleString()}
      </p>
      <p className="text-gray-600">{property.location}</p>
      {property.description && <p>{property.description}</p>}

      {/* Basic info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div><strong>Tipo:</strong> {property.propertyType}</div>
        <div><strong>Ambientes:</strong> {property.environments}</div>
        <div><strong>Dormitorios:</strong> {property.bedrooms}</div>
        <div><strong>Baños:</strong> {property.bathrooms}</div>
        <div><strong>Condición:</strong> {property.condition}</div>
        <div><strong>Antigüedad:</strong> {property.age}</div>
      </div>

      {/* Superficies y medidas */}
      {property.measuresList.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Superficies y Medidas</h2>
          <ul className="list-disc list-inside">
            {property.measuresList.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ambientes detallados */}
      {property.environmentsList.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-2">Ambientes</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 list-none">
            {property.environmentsList.map((amb, i) => (
              <li key={i} className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                {amb}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Servicios */}
      {property.services.length > 0 && (
        <div>
          <strong>Servicios:</strong> {property.services.join(", ")}
        </div>
      )}

      {/* Extras */}
      {property.extrasList.length > 0 && (
        <div>
          <strong>Extras:</strong> {property.extrasList.join(", ")}
        </div>
      )}

      {/* Galería de imágenes */}
      {property.imageUrls.length > 0 && (
        <div className="relative max-w-2xl mx-auto">
          <img
            src={property.imageUrls[imgIdx]}
            alt={`Image ${imgIdx + 1}`}
            className="w-full h-80 object-cover rounded"
          />
          {property.imageUrls.length > 1 && (
            <>
              <button
                onClick={() =>
                  setImgIdx(i => (i - 1 + property.imageUrls.length) % property.imageUrls.length)
                }
                className="absolute left-0 top-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
              >‹</button>
              <button
                onClick={() => setImgIdx(i => (i + 1) % property.imageUrls.length)}
                className="absolute right-0 top-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
              >›</button>
            </>
          )}
        </div>
      )}

      {/* Vídeos */}
      {property.videoUrls.map((url, i) => (
        <video key={i} controls className="w-full max-w-3xl mx-auto rounded my-4">
          <source src={url} type="video/mp4" />
        </video>
      ))}

      {/* Mapa */}
      {property.lat != null && (
        <div className="h-96 w-full max-w-4xl mx-auto">
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
      )}

      {/* Formulario de contacto */}
      <div className="max-w-xl mx-auto mt-12">
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
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
