import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface IProperty {
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
  propertyType: string;
  operationType: string;
  environments: number;
  bedrooms: number;
  bathrooms: number;
  condition: string;
  age: string;
  houseMeasures: string[];
  environmentsList: string[];
  services: string[];
  extras: string[];
}

function getAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

export default function PropertyCard({ property }: { property: IProperty }) {
  const firstImage = property.imageUrls?.find(Boolean);

  return (
    <Link
      to={`/properties/${property._id}`}
      className="block group rounded-xl overflow-hidden bg-white dark:bg-[#232347] shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 card-hover"
      tabIndex={0}
    >
      {firstImage ? (
        <img
          src={getAssetUrl(firstImage)}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-4xl">
          Sin imagen
        </div>
      )}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-1 group-hover:text-primary">
          {property.title}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm">
          {property.location}
        </p>
        <p className="text-green-600 font-semibold mt-2">
          {property.operationType === "Arrendamiento"
            ? "Precio a acordar"
            : property.price
            ? `$${property.price.toLocaleString()}`
            : "Sin precio"}
        </p>
      </div>
    </Link>
  );
}
