import { Link } from "react-router-dom";

type PropertyPopupCardProps = {
  property: {
    _id: string;
    title: string;
    location?: string;
    price?: number;
    imageUrls?: string[];
  };
};

export default function PropertyPopupCard({ property }: PropertyPopupCardProps) {
  const imageUrl = property.imageUrls?.[0];

  return (
    <div className="p-2 w-56">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={property.title}
          className="h-24 w-full object-cover rounded-md"
        />
      )}
      <div className="font-semibold text-sm mt-1">{property.title}</div>
      {property.location && (
        <div className="text-xs opacity-70">{property.location}</div>
      )}
      {property.price && (
        <div className="text-green-600 font-bold text-sm">
          ${property.price.toLocaleString()}
        </div>
      )}

      {/* Botón estilo Home */}
      <Link
        to={`/properties/${property._id}`}
        className="mt-2 block w-full py-2 rounded-lg font-semibold text-black text-sm shadow bg-[#fbe2a7]
        hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
        active:scale-95 text-center"
      >
        Ver detalle
      </Link>
    </div>
  );
}
