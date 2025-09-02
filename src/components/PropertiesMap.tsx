import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "../api";
import PropertyPopupCard from "./PropertyPopupCard";

type Property = {
  _id: string;
  title: string;
  location?: string;
  lat?: number | null;
  lng?: number | null;
};

function FitToMarkers({ markers }: { markers: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [markers, map]);
  return null;
}

export default function PropertiesMap() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Trae varias; ajustá límite si es necesario
        const data = await api<any>("/properties", "GET", {
          auth: false,
          query: { limit: 500, page: 1 },
        });

        // Normalizamos la forma de la respuesta:
        // puede venir como { items, total } o { properties, total }
        const list: Property[] =
          (Array.isArray(data?.items) && data.items) ||
          (Array.isArray(data?.properties) && data.properties) ||
          [];

        setProperties(list);
        // (Opcional) debug:
        // console.log("Fetched properties:", list.length, list);
      } catch (e) {
        console.error("Error fetching properties:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markers = useMemo<[number, number][]>(() => {
    return properties
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
      .map((p) => [p.lat as number, p.lng as number]);
  }, [properties]);

  // Centro por defecto: Provincia de Buenos Aires
  const defaultCenter: [number, number] = [-36.5, -60.0];
  const defaultZoom = 6;

  if (loading) {
    return (
      <div className="w-full h-[420px] rounded-lg border flex items-center justify-center">
        Cargando mapa…
      </div>
    );
  }

  return (
    <div className="w-full h-[420px] rounded-lg overflow-hidden border">
      <MapContainer
        center={markers[0] ?? defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        <FitToMarkers markers={markers} />

        {properties.map((p) => {
          if (typeof p.lat !== "number" || typeof p.lng !== "number")
            return null;
          return (
            <Marker key={p._id} position={[p.lat, p.lng]}>
              <Popup className="p-0">
                <PropertyPopupCard property={p as any} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
