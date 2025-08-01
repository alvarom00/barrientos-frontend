import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DynamicList,
  EXTRAS,
  FeatureCheckboxGroup,
  SERVICES,
} from "../components/CustomInputs";

interface FormData {
  title: string;
  description: string;
  price: string;
  location: string;
  lat: string;
  lng: string;
  imageUrls: string[];
  videoUrls: string[];
  propertyType: string;
  environments: string;
  environmentsList: string[];
  bedrooms: string;
  bathrooms: string;
  condition: string;
  age: string;
  services: string[];
  extras: string[];
  measuresList: string[];
}

const PROPERTY_TYPES = [
  "Departamento",
  "Local",
  "Campo",
  "Finca",
  "Cochera",
  "Casa",
  "Terreno",
  "Galpón",
  "Quinta",
];

const initialFormData: FormData = {
  title: "",
  description: "",
  price: "",
  location: "",
  lat: "",
  lng: "",
  imageUrls: [""],
  videoUrls: [""],
  propertyType: "",
  environments: "",
  environmentsList: [""],
  bedrooms: "",
  bathrooms: "",
  condition: "",
  age: "",
  services: [],
  extras: [],
  measuresList: [""],
};

export default function PropertyForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Generic list manager
  const updateList = <K extends keyof FormData>(
    field: K,
    action: "add" | "update" | "remove",
    index?: number,
    value?: string
  ) => {
    setFormData((prev) => {
      const list = [...(prev[field] as string[])];
      if (action === "add") list.push("");
      else if (action === "remove" && typeof index === "number")
        list.splice(index, 1);
      else if (
        action === "update" &&
        typeof index === "number" &&
        value !== undefined
      )
        list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  // Handle input/select change or list update when index provided
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (typeof index === "number") {
      updateList(name as keyof FormData, "update", index, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Load existing data if editing
  useEffect(() => {
    if (!isEdit) return;
    fetch(`http://localhost:3000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data: any) => {
        setFormData({
          title: data.title,
          description: data.description || "",
          price: String(data.price),
          location: data.location,
          lat: data.lat?.toString() || "",
          lng: data.lng?.toString() || "",
          imageUrls: data.imageUrls.length ? data.imageUrls : [""],
          videoUrls: data.videoUrls.length ? data.videoUrls : [""],
          propertyType: data.propertyType,
          environments: String(data.environments),
          environmentsList: data.environmentsList.length
            ? data.environmentsList
            : [""],
          bedrooms: String(data.bedrooms),
          bathrooms: String(data.bathrooms),
          condition: data.condition,
          age: data.age,
          services: data.features,
          extras: data.extras,
          measuresList: data.measuresList.length ? data.measuresList : [""],
        });
      })
      .catch(() => alert("Error loading property"));
  }, [id, isEdit]);

  // Submit handler: POST for create, PUT for edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = formData;
    const body = {
      title: p.title,
      description: p.description,
      price: Number(p.price),
      location: p.location,
      lat: p.lat ? Number(p.lat) : undefined,
      lng: p.lng ? Number(p.lng) : undefined,
      imageUrls: p.imageUrls.filter(Boolean),
      videoUrls: p.videoUrls.filter(Boolean),
      propertyType: p.propertyType,
      environments: Number(p.environments),
      environmentsList: p.environmentsList.filter(Boolean),
      bedrooms: Number(p.bedrooms),
      bathrooms: Number(p.bathrooms),
      condition: p.condition,
      age: p.age,
      services: p.services,
      extras: p.extras,
      measuresList: p.measuresList.filter(Boolean),
    };

    try {
      await fetch(
        isEdit
          ? `http://localhost:3000/api/properties/${id}`
          : "http://localhost:3000/api/properties",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      navigate("/admin/dashboard");
    } catch {
      alert(isEdit ? "Error updating property" : "Error creating property");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Property" : "Create New Property"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Type */}
        <div>
          <label className="font-medium block mb-1">Property Type</label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select Type
            </option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Title & Description */}
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Price & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="lat"
            type="number"
            placeholder="Latitude"
            value={formData.lat}
            onChange={handleChange}
            step="any"
            min={-90}
            max={90}
            className="p-2 border rounded"
          />
          <input
            name="lng"
            type="number"
            placeholder="Longitude"
            value={formData.lng}
            onChange={handleChange}
            step="any"
            min={-180}
            max={180}
            className="p-2 border rounded"
          />
        </div>

        {/* Superficies y Medidas */}
        <div>
          <p className="font-medium mb-2">Superficies y medidas</p>
          <DynamicList
            label="Medidas"
            items={formData.measuresList}
            onChange={(idx, val) =>
              updateList("measuresList", "update", idx, val)
            }
            onAdd={() => updateList("measuresList", "add")}
            onRemove={(idx) => updateList("measuresList", "remove", idx)}
            placeholder="Medida"
          />
        </div>

        {/* Número de Ambientes */}
        <div>
          <label className="font-medium block mb-1">Ambientes (cantidad)</label>
          <input
            type="number"
            name="environments"
            placeholder="Ej: 3"
            value={formData.environments}
            onChange={handleChange}
            required
            className="w-24 p-2 border rounded"
            min={0}
          />
        </div>

        {/* Ambientes */}
        <div>
          <DynamicList
            label="Ambientes"
            items={formData.environmentsList}
            onChange={(idx, val) =>
              updateList("environmentsList", "update", idx, val)
            }
            onAdd={() => updateList("environmentsList", "add")}
            onRemove={(idx) => updateList("environmentsList", "remove", idx)}
            placeholder="Ambiente"
          />
        </div>

        {/* Dormitorios, Baños, Antigüedad y Condición */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="bedrooms"
            type="number"
            placeholder="Dormitorios"
            value={formData.bedrooms}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            name="bathrooms"
            type="number"
            placeholder="Baños"
            value={formData.bathrooms}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            name="age"
            placeholder="Antigüedad (e.g. A Estrenar)"
            value={formData.age}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            name="condition"
            placeholder="Condición (e.g. Nuevo)"
            value={formData.condition}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        {/* Servicios */}
        <div>
          <p className="font-medium mb-2">Servicios</p>
            <FeatureCheckboxGroup
              options={SERVICES}
              selected={formData.services}
              onChange={(selected) =>
                setFormData((f) => ({ ...f, services: selected }))
              }
            />
        </div>

        {/* Extras */}
        <div>
          <p className="font-medium mb-2">Extras</p>
            <FeatureCheckboxGroup
              options={EXTRAS}
              selected={formData.extras}
              onChange={(selected) =>
                setFormData((f) => ({ ...f, extras: selected }))
              }
            />
        </div>

        {/* URLs de Imágenes */}
        <div>
          <p className="font-medium mb-2">Image URLs</p>
          {formData.imageUrls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                name="imageUrls"
                placeholder={`Image URL ${idx + 1}`}
                value={url}
                onChange={(e) =>
                  updateList("imageUrls", "update", idx, e.target.value)
                }
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => updateList("imageUrls", "remove", idx)}
                className="px-3 bg-red-500 text-white rounded"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateList("imageUrls", "add")}
            className="text-sm text-blue-600 underline"
          >
            + Agregar imagen
          </button>
        </div>

        {/* URLs de Vídeos */}
        <div>
          <p className="font-medium mb-2">Video URLs</p>
          {formData.videoUrls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                name="videoUrls"
                placeholder={`Video URL ${idx + 1}`}
                value={url}
                onChange={(e) =>
                  updateList("videoUrls", "update", idx, e.target.value)
                }
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => updateList("videoUrls", "remove", idx)}
                className="px-3 bg-red-500 text-white rounded"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateList("videoUrls", "add")}
            className="text-sm text-blue-600 underline"
          >
            + Agregar vídeo
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {isEdit ? "Update Property" : "Create Property"}
        </button>
      </form>
    </div>
  );
}
