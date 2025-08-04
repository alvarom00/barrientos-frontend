import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import type { IProperty } from "../components/PropertyCard";
import PropertySearchBar from "../components/PropertySearchBar";

export type SearchFilters = {
  operationType?: string;
  propertyType?: string;
  query?: string;
};

const toFullProperty = (p: any): IProperty => ({
  _id: p._id,
  ref: p.ref ?? "",
  title: p.title ?? "",
  description: p.description ?? "",
  price: p.price ?? 0,
  measure: p.measure ?? "",
  location: p.location ?? "",
  lat: p.lat,
  lng: p.lng,
  imageUrls: p.imageUrls ?? [],
  videoUrls: p.videoUrls ?? [],
  propertyType: p.propertyType ?? "",
  operationType: p.operationType ?? "",
  environments: p.environments ?? 0,
  bedrooms: p.bedrooms ?? 0,
  bathrooms: p.bathrooms ?? 0,
  condition: p.condition ?? "",
  age: p.age ?? "",
  houseMeasures: p.houseMeasures ?? "",
  environmentsList: p.environmentsList ?? [],
  services: p.services ?? [],
  extras: p.extras ?? [],
});

const Home = () => {
  const [filteredProperties, setFilteredProperties] = useState<
    IProperty[] | null
  >(null);

  const handleSearch = async ({ operationType, propertyType, query }: SearchFilters) => {
    // Armá los params dinámicos
    const params = new URLSearchParams();
    if (operationType) params.append("operationType", operationType);
    if (propertyType) params.append("propertyType", propertyType);
    if (query) params.append("query", query);

    const res = await fetch(`http://localhost:3000/api/properties?${params}`);
    const data = await res.json();
    setFilteredProperties(data);
  };

  // Al principio (cuando no hay filtro, mostrá todo):
  useEffect(() => {
    fetch("http://localhost:3000/api/properties")
      .then((res) => res.json())
      .then((data) => setFilteredProperties(data))
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  return (
    <div className="p-8">
      <PropertySearchBar onSearch={handleSearch} />
      <h1 className="text-3xl font-bold mb-6">Available Properties</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredProperties ?? []).map((p) => (
          <PropertyCard key={p._id} property={toFullProperty(p)} />
        ))}
      </div>
    </div>
  );
};

export default Home;
