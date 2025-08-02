import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import type { IProperty } from "../components/PropertyCard";

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  imageUrls: string[];
}

const toFullProperty = (p: any): IProperty => ({
  _id: p._id,
  ref: p.ref ?? "",
  title: p.title ?? "",
  description: p.description ?? "",
  price: p.price ?? 0,
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
  measuresList: p.measuresList ?? [],
  environmentsList: p.environmentsList ?? [],
  services: p.services ?? [],
  extras: p.extras ?? [],
  floor: p.floor,
  apartmentNumber: p.apartmentNumber,
  pricePerDay: p.pricePerDay,
  pricePerWeek: p.pricePerWeek,
  pricePerMonth: p.pricePerMonth,
});

const Home = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Available Properties</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p) => (
          <PropertyCard key={p._id} property={toFullProperty(p)} />
        ))}
      </div>
    </div>
  );
};

export default Home;
