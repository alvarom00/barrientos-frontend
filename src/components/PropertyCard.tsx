import { Link } from "react-router-dom";
import { getAssetUrl } from "../utils/getAssetUrl";

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

export default function PropertyCard({ property }: { property: IProperty }) {
  const firstImage = property.imageUrls?.find(Boolean);

  return (
    <Link
      to={`/properties/${property._id}`}
      className="block group rounded-2xl overflow-hidden bg-crema-strong shadow-lg hover:scale-[1.03] transition-transform duration-300 border border-[#f2dbb1]"
      tabIndex={0}
    >
      {firstImage ? (
        <img
          src={getAssetUrl(firstImage)}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-[#f6eed7] text-[#bfa76c] text-lg font-semibold">
          Sin imagen
        </div>
      )}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors text-[#967624]">
          {property.title}
        </h2>
        <p className="text-[#7a6c3f] text-sm">{property.location}</p>
        <p className="text-green-700 font-semibold mt-2">
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
