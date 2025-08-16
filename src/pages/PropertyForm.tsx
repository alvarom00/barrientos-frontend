// src/pages/PropertyForm.tsx
import { useEffect, useState } from "react";
import {
  useForm,
  Controller,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { propertySchema } from "../schema/propertySchema";
import { useNavigate, useParams } from "react-router-dom";
import {
  DynamicList,
  FeatureCheckboxGroup,
  SERVICES,
  EXTRAS,
} from "../components/CustomInputs";
import L from "leaflet";
import { useMapEvents, Marker, MapContainer, TileLayer } from "react-leaflet";
import { nanoid } from "nanoid";
import { api, abortable } from "../api";
import clsx from "clsx";

// ------- Tipos del formulario (explícitos para evitar choques Yup/RHF) ------
type OperationType = "Venta" | "Arrendamiento" | "";
type ConditionType =
  | ""
  | "Excelente"
  | "Muy bueno"
  | "Bueno"
  | "Regular"
  | "A refaccionar";

type FormValues = {
  title: string;
  description: string;
  operationType: OperationType;
  propertyType?: string;

  // Venta: price requerido / Arrendamiento: opcional
  price?: number | null;

  location: string;
  lat: number | undefined;
  lng: number | undefined;

  measure: number | undefined;

  // imágenes nuevas (File[]) + existentes (urls) para la validación
  imageFiles?: File[];
  existingImagesUrls: string[];

  // videos
  videoUrls: (string | null)[] | null;

  // toggles
  services: string[];
  extras: string[];

  // “Vivienda” condicional
  environments?: number | null;
  environmentsList?: string[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  condition?: ConditionType;
  age?: number | null;
  houseMeasures?: number | null;
};

const OPERATION_TYPES: OperationType[] = ["Venta", "Arrendamiento", ""];

// -------------------------- Componente --------------------------
export default function PropertyFormRH() {
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // forzar el resolver a nuestro tipo de FormValues
  const resolver = yupResolver(
    propertySchema
  ) as unknown as Resolver<FormValues>;

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
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      operationType: "",
      propertyType: "",
      price: undefined,

      location: "",
      lat: undefined,
      lng: undefined,
      measure: undefined,

      imageFiles: [],
      existingImagesUrls: [],

      videoUrls: [""],
      services: [],
      extras: [],
    },
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const extras = watch("extras") ?? [];
  const lat = watch("lat");
  const lng = watch("lng");
  const hasVivienda = extras.includes("Vivienda");

  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  const buildImgUrl = (u: string) => {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    return `${API_URL}/${u.replace(/^\//, "")}`;
  };

  // ---------- Map picker ----------
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

  // ---------- Sincronizar campo del schema con el estado de previews ----------
  // Cada vez que cambian las existentes -> actualizamos el field existingImagesUrls
  useEffect(() => {
    setValue("existingImagesUrls", existingImages, { shouldValidate: true });
    trigger("imageFiles"); // revalida la regla "al menos 1 imagen"
  }, [existingImages, setValue, trigger]);

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imageFiles]);

  // ---------- Cargar datos al editar ----------
  useEffect(() => {
    if (!id) return;
    const { signal, abort } = abortable();

    api
      .get<any>(`/properties/${id}`, { signal })
      .then((data) => {
        setExistingImages(data.imageUrls || []);

        const hasVivienda =
          Array.isArray(data.extras) && data.extras.includes("Vivienda");

        reset({
          ...data,

          // numéricos (coerción segura)
          price: data.price ?? undefined,
          measure: data.measure ?? undefined,
          lat: data.lat ?? undefined,
          lng: data.lng ?? undefined,

          // ---- CAMPOS DE VIVIENDA (ahora sí seteados/normalizados) ----
          environments: hasVivienda
            ? data.environments ?? undefined
            : undefined,
          bedrooms: hasVivienda ? data.bedrooms ?? undefined : undefined,
          bathrooms: hasVivienda ? data.bathrooms ?? undefined : undefined,
          condition: hasVivienda ? data.condition ?? "" : undefined,

          // 👇 antes no se seteaba
          environmentsList: hasVivienda
            ? Array.isArray(data.environmentsList) &&
              data.environmentsList.length
              ? data.environmentsList.map((s: any) => String(s ?? ""))
              : [""]
            : undefined,

          // 👇 normalizamos a number si viniera como string
          age: hasVivienda
            ? data.age === 0 || data.age
              ? Number(data.age)
              : undefined
            : undefined,

          houseMeasures: hasVivienda
            ? data.houseMeasures === 0 || data.houseMeasures
              ? Number(data.houseMeasures)
              : undefined
            : undefined,
          // -------------------------------------------------------------

          // listas
          videoUrls:
            Array.isArray(data.videoUrls) && data.videoUrls.length
              ? data.videoUrls
              : [""],
          services: Array.isArray(data.services) ? data.services : [],
          extras: Array.isArray(data.extras) ? data.extras : [],

          operationType: data.operationType ?? "",
          imageFiles: [],

          // si lo usás para la validación de imágenes
          existingImagesUrls: Array.isArray(data.imageUrls)
            ? data.imageUrls
            : [],
        });

        // revalidar imágenes después del reset
        setTimeout(() => trigger(["imageFiles"]), 0);
      })
      .catch((err) => {
        if ((err as any)?.name !== "AbortError")
          console.error("Error cargando propiedad:", err);
      });

    return () => abort();
  }, [id, reset, trigger]);

  // ---------- Toggle Vivienda: limpiar / setear defaults ----------
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
      const curr = getValues("environmentsList");
      if (!curr || curr.length === 0) {
        setValue("environmentsList", [""]);
      }
    }
  }, [hasVivienda, setValue, clearErrors, getValues]);

  // ---------- Handlers imágenes ----------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setImageFiles((prev) => {
      const next = [...prev, ...files];
      setValue("imageFiles", next, { shouldValidate: true, shouldDirty: true });
      return next;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setValue("imageFiles", next, { shouldValidate: true, shouldDirty: true });
      return next;
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    // existingImagesUrls se sincroniza en el useEffect de arriba
  };

  // ---------- Submit ----------
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isSubmitting) return;

    const fd = new FormData();
    const appendIf = (k: string, v: any) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
    };

    // Básicos
    fd.append("title", data.title);
    fd.append("description", data.description);
    appendIf("price", data.price);
    appendIf("measure", data.measure);
    fd.append("location", data.location);
    appendIf("lat", data.lat);
    appendIf("lng", data.lng);
    fd.append("operationType", data.operationType);
    if (data.propertyType) fd.append("propertyType", data.propertyType);

    // Arrays
    (data.services ?? []).forEach((s) => appendIf("services[]", s));
    (data.extras ?? []).forEach((e) => appendIf("extras[]", e));

    // Vivienda
    if (data.extras?.includes("Vivienda")) {
      appendIf("environments", data.environments);
      (data.environmentsList ?? []).forEach((v) =>
        appendIf("environmentsList[]", v)
      );
      appendIf("bedrooms", data.bedrooms);
      appendIf("bathrooms", data.bathrooms);
      appendIf("condition", data.condition);
      appendIf("age", data.age);
      appendIf("houseMeasures", data.houseMeasures);
    }

    // Imágenes
    existingImages.forEach((url) => fd.append("keepImages", url));
    imageFiles.forEach((file) => fd.append("images", file));

    // Videos
    (data.videoUrls ?? [])
      .map((u) => (u ?? "").trim())
      .filter(Boolean)
      .forEach((u) => fd.append("videoUrls[]", u));

    const path = isEdit ? `/properties/${id}` : "/properties";
    const method = isEdit ? "PUT" : "POST";

    const headers: Record<string, string> = { "X-Idempotency-Key": nanoid(24) };

    try {
      await api(path, method, { body: fd, headers });
      navigate("/admin/dashboard");
    } catch (err: any) {
      alert("Error al guardar la propiedad: " + (err?.message || err));
      throw err;
    }
  };

  const onError = () => setTriedSubmit(true);

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
            <label className="block font-semibold mb-1">Título</label>
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
            <label className="block font-semibold mb-1">Descripción</label>
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
              {OPERATION_TYPES.slice(0, 2).map((t) => (
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
          {watch("operationType") !== "Arrendamiento" && (
            <div>
              <label className="block font-semibold mb-1">Precio</label>
              <input
                {...register("price", { valueAsNumber: true })}
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
            <label className="block font-semibold mb-1">Hectáreas</label>
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
            <label className="block font-semibold mb-1">Ubicación</label>
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
                    setValue("lat", lat, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setValue("lng", lng, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              </MapContainer>
            </div>
            <div className="flex gap-2">
              <input
                {...register("lat", { valueAsNumber: true })}
                type="number"
                placeholder="Latitud"
                className="w-1/2 p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468]"
                readOnly
              />
              <input
                {...register("lng", { valueAsNumber: true })}
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

            {/* registrar fields presentes en el schema */}
            <input type="hidden" {...register("imageFiles")} />
            <input type="hidden" {...register("existingImagesUrls")} />

            <div className="flex gap-2 mt-2 flex-wrap">
              {/* existentes (DB / Cloudinary / ruta relativa) */}
              {existingImages.map((url, i) => (
                <div key={`exist-${i}`} className="relative w-24 h-16">
                  <img
                    src={buildImgUrl(url)}
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

              {/* nuevas (File[]) usando previews */}
              {previews.map((src, i) => (
                <div key={`new-${i}`} className="relative w-24 h-16">
                  <img
                    src={src}
                    alt={`new-${i}`}
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

          {/* 🎥 Videos por URL */}
          <Controller
            name="videoUrls"
            control={control}
            render={({ field }) => {
              const items = Array.isArray(field.value)
                ? field.value.map((v) => (v ?? "") as string)
                : [""];
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
            <label className="block font-semibold mb-1">Servicios</label>
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
            <label className="block font-semibold mb-1">Extras</label>
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

          {/* ⬇️ Campos adicionales SOLO si se marcó "Vivienda" */}
          {hasVivienda && (
            <div className="rounded-xl border border-[#ebdbb9] bg-[#f9f1da]/60 p-4 space-y-4">
              <h3 className="font-semibold text-base">Datos de la vivienda</h3>

              {/* Números rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ambientes (número)
                  </label>
                  <input
                    {...register("environments", { valueAsNumber: true })}
                    type="number"
                    placeholder="Ej: 5"
                    className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                    aria-invalid={!!errors.environments}
                  />
                  {errors.environments?.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.environments.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dormitorios
                  </label>
                  <input
                    {...register("bedrooms", { valueAsNumber: true })}
                    type="number"
                    placeholder="Ej: 3"
                    className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                    aria-invalid={!!errors.bedrooms}
                  />
                  {errors.bedrooms?.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bedrooms.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Baños
                  </label>
                  <input
                    {...register("bathrooms", { valueAsNumber: true })}
                    type="number"
                    placeholder="Ej: 2"
                    className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                    aria-invalid={!!errors.bathrooms}
                  />
                  {errors.bathrooms?.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bathrooms.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Estado / Antigüedad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estado
                  </label>
                  <select
                    {...register("condition")}
                    className="w-full p-2 border rounded bg-[#fcf7ea]/90 focus:outline-primary focus:border-[#ffe8ad] transition"
                    defaultValue=""
                    aria-invalid={!!errors.condition}
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Muy bueno">Muy bueno</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="A refaccionar">A refaccionar</option>
                  </select>
                  {errors.condition?.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.condition.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Antigüedad (años)
                  </label>
                  <input
                    {...register("age", { valueAsNumber: true })}
                    type="number"
                    placeholder="Ej: 10"
                    className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                    aria-invalid={!!errors.age}
                  />
                  {errors.age?.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.age.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de ambientes */}
              <Controller
                name="environmentsList"
                control={control}
                render={({ field }) => {
                  const items = Array.isArray(field.value)
                    ? field.value.map((v) => String(v ?? ""))
                    : [""];
                  return (
                    <>
                      <DynamicList
                        label="Ambientes (lista)"
                        items={items}
                        placeholder="Ej: Living, Cocina, Comedor…"
                        onChange={(i, v) =>
                          field.onChange(
                            items.map((x, ix) =>
                              ix === i ? String(v ?? "") : x
                            )
                          )
                        }
                        onAdd={() => field.onChange([...items, ""])}
                        onRemove={(i) =>
                          field.onChange(items.filter((_, ix) => ix !== i))
                        }
                      />
                      {(errors.environmentsList as any)?.message && (
                        <p className="mt-1 text-sm text-red-500">
                          {(errors.environmentsList as any).message}
                        </p>
                      )}
                      {Array.isArray(errors.environmentsList) &&
                        (errors.environmentsList as any[]).map((e, idx) =>
                          e?.message ? (
                            <p key={idx} className="mt-1 text-sm text-red-500">
                              {e.message}
                            </p>
                          ) : null
                        )}
                    </>
                  );
                }}
              />

              {/* Superficie cubierta (m²) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Superficie cubierta{" "}
                  <span className="opacity-75">
                    (en m<sup>2</sup>)
                  </span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min={0}
                  placeholder="Ej: 120"
                  {...register("houseMeasures", { valueAsNumber: true })}
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                  aria-invalid={!!errors.houseMeasures}
                />
                {errors.houseMeasures?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.houseMeasures.message as string}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={clsx(
              "inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition",
              "bg-[#c7ae79] text-[#1b2328] hover:opacity-90 shadow",
              isSubmitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Guardando..." : "Guardar propiedad"}
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
