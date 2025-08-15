import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { propertySchema } from "../schema/propertySchema";
import { useNavigate, useParams } from "react-router-dom";
import {
  DynamicList,
  FeatureCheckboxGroup,
  SERVICES,
  EXTRAS,
} from "../components/CustomInputs";
import { useEffect, useState } from "react";
import L from "leaflet";
import { useMapEvents, Marker, MapContainer, TileLayer } from "react-leaflet";
import { api, abortable } from "../api";

const OPERATION_TYPES = ["Venta", "Arrendamiento"];

export default function PropertyFormRH() {
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const API_URL = import.meta.env.VITE_API_URL; // Solo para preview de assets existentes

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(propertySchema),
    context: {
      existingImages,
      // ya no usamos existingVideos
    },
    mode: "onChange",
    defaultValues: {
      imageFiles: [],
      // 👇 nuevo: lista de URLs de video
      videoUrls: [""],
    },
  });

  function LocationPicker({
    value,
    onChange,
  }: {
    value: { lat: number; lng: number } | null;
    onChange: (coords: { lat: number; lng: number }) => void;
  }) {
    useMapEvents({
      click(e) {
        onChange(e.latlng);
      },
    });

    return value ? (
      <Marker
        position={value}
        icon={L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  }

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const operationType = watch("operationType");
  const extras = watch("extras") ?? [];
  const lat = watch("lat");
  const lng = watch("lng");

  const hasVivienda = extras.includes("Vivienda");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    setValue("imageFiles", [...imageFiles, ...files], { shouldValidate: true });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    clearErrors("imageFiles");
  };

  // Validar imágenes cuando cambia la lista existente
  useEffect(() => {
    trigger(["imageFiles"]);
  }, [existingImages, trigger]);

  // Cargar datos al editar
  useEffect(() => {
    if (!id) return;
    const { signal, abort } = abortable();

    api
      .get<any>(`/properties/${id}`, { signal })
      .then((data) => {
        setExistingImages(data.imageUrls || []);
        reset({
          ...data,
          price: data.price?.toString() ?? undefined,
          measure: data.measure?.toString() ?? undefined,
          environments:
            data.extras?.includes("Vivienda") && data.environments != null
              ? data.environments.toString()
              : undefined,
          bedrooms:
            data.extras?.includes("Vivienda") && data.bedrooms != null
              ? data.bedrooms.toString()
              : undefined,
          bathrooms:
            data.extras?.includes("Vivienda") && data.bathrooms != null
              ? data.bathrooms.toString()
              : undefined,
          lat: data.lat?.toString() ?? undefined,
          lng: data.lng?.toString() ?? undefined,
          imageUrls:
            Array.isArray(data.imageUrls) && data.imageUrls.length
              ? data.imageUrls
              : [""],
          // 👇 ahora `videoUrls` viene del backend y se edita como lista
          videoUrls:
            Array.isArray(data.videoUrls) && data.videoUrls.length
              ? data.videoUrls
              : [""],
          houseMeasures:
            data.extras?.includes("Vivienda") && data.houseMeasures != null
              ? data.houseMeasures
              : undefined,
          environmentsList:
            data.extras?.includes("Vivienda") &&
            Array.isArray(data.environmentsList) &&
            data.environmentsList.length
              ? data.environmentsList
              : undefined,
          services: Array.isArray(data.services) ? data.services : [],
          extras: Array.isArray(data.extras) ? data.extras : [],
          condition:
            data.extras?.includes("Vivienda") && data.condition
              ? data.condition
              : undefined,
          age:
            data.extras?.includes("Vivienda") && data.age
              ? data.age
              : undefined,
          operationType: data.operationType ?? "",
          location: data.location ?? "",
          title: data.title ?? "",
          description: data.description ?? "",
          imageFiles: [],
        });
        setTimeout(() => trigger(["imageFiles"]), 0);
      })
      .catch((err) => {
        if ((err as any)?.name !== "AbortError") {
          console.error("Error cargando propiedad:", err);
        }
      });

    return () => abort();
  }, [id, reset, trigger]);

  useEffect(() => {
    if (!hasVivienda) {
      setValue("environments", undefined);
      setValue("environmentsList", undefined);
      setValue("bedrooms", undefined);
      setValue("bathrooms", undefined);
      setValue("condition", undefined);
      setValue("age", undefined);
      setValue("houseMeasures", undefined);
      clearErrors([
        "environments",
        "environmentsList",
        "bedrooms",
        "bathrooms",
        "condition",
        "age",
        "houseMeasures",
      ]);
    } else {
      if (
        !getValues("environmentsList") ||
        getValues("environmentsList")?.length === 0
      ) {
        setValue("environmentsList", [""]);
      }
    }
  }, [hasVivienda, setValue, clearErrors, getValues]);

  const onSubmit = async (data: any) => {
    const formData = new FormData();

    // Campos básicos
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (data.price) formData.append("price", data.price);
    if (data.measure) formData.append("measure", data.measure);
    formData.append("location", data.location);
    if (data.lat) formData.append("lat", data.lat);
    if (data.lng) formData.append("lng", data.lng);
    formData.append("operationType", data.operationType);

    // Arrays
    (data.services || []).forEach((s: string) =>
      formData.append("services[]", s)
    );
    (data.extras || []).forEach((e: string) => formData.append("extras[]", e));

    // Vivienda condicional
    if (data.extras?.includes("Vivienda")) {
      if (data.environments) formData.append("environments", data.environments);
      (data.environmentsList || []).forEach((v: string) =>
        formData.append("environmentsList[]", v)
      );
      if (data.bedrooms) formData.append("bedrooms", data.bedrooms);
      if (data.bathrooms) formData.append("bathrooms", data.bathrooms);
      if (data.condition) formData.append("condition", data.condition);
      if (data.age) formData.append("age", data.age);
      if (data.houseMeasures)
        formData.append("houseMeasures", data.houseMeasures);
    }

    // 🖼️ Imágenes (igual que antes)
    existingImages.forEach((url) => formData.append("keepImages", url));
    imageFiles.forEach((file) => formData.append("images", file));

    // 🎥 Videos por URL (NUEVO)
    (data.videoUrls || [])
      .map((u: string) => (u ?? "").trim())
      .filter(Boolean)
      .forEach((u: string) => formData.append("videoUrls[]", u));

    setTriedSubmit(false);

    const isEdit = Boolean(id);
    const path = isEdit ? `/properties/${id}` : "/properties";
    const method = isEdit ? "PUT" : "POST";

    try {
      await api(path, method, { body: formData });
      navigate("/admin/dashboard");
    } catch (err: any) {
      alert("Error al guardar la propiedad: " + (err.message || err));
    }
  };

  const onError = () => {
    setTriedSubmit(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 bg-transparent">
      <div className="w-full max-w-2xl bg-crema rounded-2xl shadow-xl px-6 sm:px-10 py-8 animate-fade-in border border-[#ebdbb9]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "Editar Propiedad" : "Nueva Propiedad"}
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-6"
          autoComplete="off"
        >
          {/* Título */}
          <div>
            <label htmlFor="title" className="block font-semibold mb-1">
              Título
            </label>
            <input
              {...register("title")}
              placeholder="Título"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message as string}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block font-semibold mb-1">
              Descripción
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Descripción"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] resize-none focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message as string}
              </p>
            )}
          </div>

          {/* Tipo de operación */}
          <div>
            <label className="block font-semibold mb-1">
              Tipo de operación
            </label>
            <select
              {...register("operationType")}
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 focus:outline-primary focus:border-[#ffe8ad] transition"
              defaultValue=""
            >
              <option value="">Tipo de operación</option>
              {OPERATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.operationType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.operationType.message as string}
              </p>
            )}
          </div>

          {/* Precio (solo venta) */}
          {operationType !== "Arrendamiento" && (
            <div>
              <label htmlFor="price" className="block font-semibold mb-1">
                Precio
              </label>
              <input
                {...register("price")}
                type="number"
                placeholder="Precio"
                className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message as string}
                </p>
              )}
            </div>
          )}

          {/* Hectáreas */}
          <div>
            <label htmlFor="measure" className="block font-semibold mb-1">
              Hectáreas
            </label>
            <input
              {...register("measure", { valueAsNumber: true })}
              type="number"
              placeholder="Ej: 150 (en ha)"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.measure && (
              <p className="text-red-500 text-sm mt-1">
                {errors.measure.message as string}
              </p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block font-semibold mb-1">
              Ubicación
            </label>
            <input
              {...register("location")}
              placeholder="Ubicación"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message as string}
              </p>
            )}
          </div>

          {/* Mapa / Lat Lng */}
          <div>
            <label className="block font-semibold mb-1">
              Ubicación en el mapa
            </label>
            <div className="h-64 w-full rounded-xl overflow-hidden mb-2 border border-[#ebdbb9] bg-crema-strong">
              <MapContainer
                center={lat && lng ? [lat, lng] : [-36, -65]}
                zoom={lat && lng ? 13 : 5}
                className="h-full w-full"
                style={{ height: 256 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationPicker
                  value={lat && lng ? { lat, lng } : null}
                  onChange={({ lat, lng }) => {
                    setValue("lat", lat);
                    setValue("lng", lng);
                    trigger(["lat", "lng"]);
                  }}
                />
              </MapContainer>
            </div>
            <div className="flex gap-2">
              <input
                {...register("lat")}
                type="number"
                placeholder="Latitud"
                className="w-1/2 p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468]"
                readOnly
              />
              <input
                {...register("lng")}
                type="number"
                placeholder="Longitud"
                className="w-1/2 p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468]"
                readOnly
              />
            </div>
            <p className="text-red-500 text-sm mt-1">
              {(errors as any).lat?.message || (errors as any).lng?.message}
            </p>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block font-semibold mb-1">Imágenes</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border rounded bg-[#fcf7ea]/90"
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {existingImages.map((url, i) => (
                <div key={`exist-${i}`} className="relative w-24 h-16">
                  <img
                    src={`${API_URL}${url}`}
                    alt={`img-${i}`}
                    className="w-full h-full object-cover rounded border border-[#ebdbb9] loading-lazy"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(i)}
                    className="absolute top-0 right-0 btn-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Borrar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageFiles.map((file, i) => (
                <div key={`new-${i}`} className="relative w-24 h-16">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover rounded border border-[#ebdbb9]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-0 right-0 btn-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Borrar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {(errors as any).imageFiles &&
              typeof (errors as any).imageFiles.message === "string" && (
                <p className="text-red-500 text-sm mt-1">
                  {(errors as any).imageFiles.message}
                </p>
              )}
          </div>

          {/* 🎥 Videos por URL (DynamicList) */}
          <Controller
            name="videoUrls"
            control={control}
            render={({ field }) => {
              const toStrArr = (arr: unknown): string[] =>
                Array.isArray(arr) ? arr.map((v) => (v ?? "") as string) : [""];

              const items = toStrArr(field.value);

              return (
                <div>
                  <DynamicList
                    label="Videos (URLs de YouTube / Vimeo / MP4)"
                    items={items}
                    placeholder="https://www.youtube.com/watch?v=XXXXXXXX"
                    onChange={(i, v) =>
                      field.onChange(
                        items.map((x, ix) => (ix === i ? String(v ?? "") : x))
                      )
                    }
                    onAdd={() => field.onChange([...items, ""])}
                    onRemove={(i) =>
                      field.onChange(items.filter((_, ix) => ix !== i))
                    }
                  />
                  {(errors as any).videoUrls?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {(errors as any).videoUrls.message}
                    </p>
                  )}
                  {Array.isArray((errors as any).videoUrls) &&
                    (errors as any).videoUrls.map(
                      (err: any, i: number) =>
                        err && (
                          <p key={i} className="text-red-500 text-sm">
                            Video {i + 1}: {err?.message}
                          </p>
                        )
                    )}
                </div>
              );
            }}
          />

          {/* Servicios / Extras */}
          <div>
            <label htmlFor="services" className="block font-semibold mb-1">
              Servicios
            </label>
            <Controller
              name="services"
              control={control}
              render={({ field }) => (
                <FeatureCheckboxGroup
                  options={SERVICES}
                  selected={(field.value ?? []).filter(
                    (x): x is string => typeof x === "string"
                  )}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="extras" className="block font-semibold mb-1">
              Extras
            </label>
            <Controller
              name="extras"
              control={control}
              render={({ field }) => (
                <FeatureCheckboxGroup
                  options={EXTRAS}
                  selected={(field.value ?? []).filter(
                    (x): x is string => typeof x === "string"
                  )}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-semibold shadow bg-[#ffe8ad] hover:bg-[#f5e3b8] hover:text-[#ad924a] transition-all duration-200 active:scale-95 border border-[#ebdbb9] cursor-pointer"
          >
            Guardar propiedad
          </button>

          {triedSubmit && !isValid && (
            <p className="mt-2 text-red-600 text-sm text-center font-semibold">
              Complete los campos obligatorios.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
