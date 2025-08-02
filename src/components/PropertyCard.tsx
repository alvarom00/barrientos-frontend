import { Link } from "react-router-dom";

export interface IProperty {
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
  propertyType: string;
  operationType: string;
  environments: number;
  bedrooms: number;
  bathrooms: number;
  condition: string;
  age: string;
  measuresList: string[];
  environmentsList: string[];
  services: string[];
  extras: string[];
  floor?: string;
  apartmentNumber?: string;
  pricePerDay?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
}

export default function PropertyCard({ property }: { property: IProperty }) {
  return (
    <Link
      to={`/properties/${property._id}`}
      className="block group rounded-xl overflow-hidden bg-white dark:bg-[#232347] shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 card-hover"
      tabIndex={0}
    >
      <img
        src={property.imageUrls[0]}
        alt={property.title}
        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold mb-1 group-hover:text-primary">
          {property.title}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm">
          {property.location}
        </p>
        <p className="text-green-600 font-semibold mt-2">
          ${property.price?.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
