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

const OPERATION_TYPES = ["Venta", "Arrendamiento"];

export default function PropertyFormRH() {
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;
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
      existingVideos,
    },
    mode: "onChange",
    defaultValues: {
      imageFiles: [],
      videoFiles: [],
    },
  });

  function LocationPicker({
    value,
    onChange,
  }: {
    value: { lat: number; lng: number } | null;
    onChange: (coords: { lat: number; lng: number }) => void;
  }) {
    // Un handler para el click en el mapa
    useMapEvents({
      click(e) {
        onChange(e.latlng);
      },
    });

    // El marker se muestra solo si hay coords
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
  const API = import.meta.env.VITE_API_URL;

  const hasVivienda = extras.includes("Vivienda");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    setValue("imageFiles", [...imageFiles, ...files], { shouldValidate: true });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setVideoFiles([...videoFiles, ...files]);
    setValue("videoFiles", [...videoFiles, ...files], { shouldValidate: true });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
    clearErrors("imageFiles");
  };

  const handleRemoveVideo = (index: number) => {
    setVideoFiles(videoFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingVideo = (index: number) => {
    setExistingVideos(existingVideos.filter((_, i) => i !== index));
    clearErrors("videoFiles");
  };

  useEffect(() => {
    trigger(["imageFiles", "videoFiles"]);
  }, [existingImages, existingVideos, trigger]);

  useEffect(() => {
    if (id) {
      fetch(`${API}/properties/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setExistingImages(data.imageUrls || []);
          setExistingVideos(data.videoUrls || []);
          reset({
            ...data,
            price: data.price?.toString() ?? undefined,
            measure: data.measure.toString() ?? undefined,
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
            videoFiles: [],
          });
          setTimeout(() => {
            trigger(["imageFiles", "videoFiles"]);
          }, 0);
        });
    }
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

    // Arrays (si existen)
    (data.services || []).forEach((s: string) =>
      formData.append("services[]", s)
    );
    (data.extras || []).forEach((e: string) => formData.append("extras[]", e));

    // Vivienda extras condicionales
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

    // Agregá los archivos:
    existingImages.forEach((url) => formData.append("keepImages", url));
    imageFiles.forEach((file) => formData.append("images", file));

    existingVideos.forEach((url) => formData.append("keepVideos", url));
    videoFiles.forEach((file) => formData.append("videos", file));

    setTriedSubmit(false);

    const isEdit = Boolean(id);
    const url = isEdit
      ? `${API}/properties/${id}`
      : `${API}/properties`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error en el servidor");
      }

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
      <div className="w-full max-w-2xl bg-crema rounded-2xl shadow-xl px-6 sm:px-10 py-8 animate-fade-in border border-[#ebdbb9] !text-[#514737]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#594317]">
          {isEdit ? "Editar Propiedad" : "Nueva Propiedad"}
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-6"
          autoComplete="off"
        >
          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="block font-semibold mb-1 text-[#594317]"
            >
              Título
            </label>
            <input
              {...register("title")}
              placeholder="Título"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block font-semibold mb-1 text-[#594317]"
            >
              Descripción
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Descripción"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] resize-none focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Tipo de operación */}
          <div>
            <label className="block font-semibold mb-1 text-[#594317]">
              Tipo de operación
            </label>
            <select
              {...register("operationType")}
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] focus:outline-primary focus:border-[#ffe8ad] transition"
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
                {errors.operationType.message}
              </p>
            )}
          </div>

          {/* Precio (solo venta) */}
          {operationType !== "Arrendamiento" && (
            <div>
              <label
                htmlFor="price"
                className="block font-semibold mb-1 text-[#594317]"
              >
                Precio
              </label>
              <input
                {...register("price")}
                type="number"
                placeholder="Precio"
                className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          )}

          {/* Hectáreas */}
          <div>
            <label
              htmlFor="measure"
              className="block font-semibold mb-1 text-[#594317]"
            >
              Hectáreas
            </label>
            <input
              {...register("measure", { valueAsNumber: true })}
              type="number"
              placeholder="Ej: 150 (en ha)"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.measure && (
              <p className="text-red-500 text-sm mt-1">
                {errors.measure.message}
              </p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label
              htmlFor="location"
              className="block font-semibold mb-1 text-[#594317]"
            >
              Ubicación
            </label>
            <input
              {...register("location")}
              placeholder="Ubicación"
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Mapa / Lat Lng */}
          <div>
            <label className="block font-semibold mb-1 text-[#594317]">
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
                className="w-1/2 p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468]"
                readOnly
              />
              <input
                {...register("lng")}
                type="number"
                placeholder="Longitud"
                className="w-1/2 p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468]"
                readOnly
              />
            </div>
            <p className="text-red-500 text-sm mt-1">
              {errors.lat?.message || errors.lng?.message}
            </p>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block font-semibold mb-1 text-[#594317]">
              Imágenes
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317]"
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {existingImages.map((url, i) => (
                <div key={`exist-${i}`} className="relative w-24 h-16">
                  <img
                    src={`${API_URL}${url}`}
                    alt={`img-${i}`}
                    className="w-full h-full object-cover rounded border border-[#ebdbb9]"
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

            {errors.imageFiles &&
              typeof errors.imageFiles.message === "string" && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.imageFiles.message}
                </p>
              )}
          </div>

          {/* Videos */}
          <div>
            <label className="block font-semibold mb-1 text-[#594317]">
              Videos
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoChange}
              className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317]"
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {existingVideos.map((url, i) => (
                <div key={`exist-video-${i}`} className="relative w-24 h-16">
                  <video
                    src={`${API_URL}${url}`}
                    className="w-full h-full rounded border border-[#ebdbb9]"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingVideo(i)}
                    className="absolute top-0 right-0 btn-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Borrar video"
                  >
                    ×
                  </button>
                </div>
              ))}
              {videoFiles.map((file, i) => (
                <div key={`new-video-${i}`} className="relative w-24 h-16">
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-full rounded border border-[#ebdbb9]"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(i)}
                    className="absolute top-0 right-0 btn-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Borrar video"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {errors.videoFiles &&
              typeof errors.videoFiles.message === "string" && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.videoFiles.message}
                </p>
              )}
          </div>

          {/* Campos de Vivienda (condicional) */}
          {hasVivienda && (
            <>
              <div>
                <label
                  htmlFor="houseMeasures"
                  className="block font-semibold mb-1 text-[#594317]"
                >
                  Superficie (Vivienda)
                </label>
                <input
                  {...register("houseMeasures", { valueAsNumber: true })}
                  type="number"
                  placeholder="Ej: 150 (en m²)"
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                />
                {errors.houseMeasures && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.houseMeasures.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#594317]">
                  Cantidad de ambientes
                </label>
                <input
                  {...register("environments")}
                  type="number"
                  placeholder="Ambientes"
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                />
                {errors.environments && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.environments.message}
                  </p>
                )}
              </div>

              <Controller
                name="environmentsList"
                control={control}
                render={({ field }) => (
                  <>
                    <DynamicList
                      label="Ambientes (detalle)"
                      items={
                        Array.isArray(field.value) && field.value.length > 0
                          ? field.value
                          : [""]
                      }
                      onChange={(i, v) =>
                        field.onChange(
                          (field.value ?? [""]).map((x, ix) =>
                            ix === i ? v : x
                          )
                        )
                      }
                      onAdd={() =>
                        field.onChange([...(field.value ?? [""]), ""])
                      }
                      onRemove={(i) =>
                        field.onChange(
                          (field.value ?? [""]).filter((_, ix) => ix !== i)
                        )
                      }
                    />
                    {errors.environmentsList?.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.environmentsList.message}
                      </p>
                    )}
                    {Array.isArray(errors.environmentsList) &&
                      errors.environmentsList.map(
                        (err, i) =>
                          err && (
                            <p key={i} className="text-red-500 text-sm">
                              Ambiente {i + 1}: {err?.message}
                            </p>
                          )
                      )}
                  </>
                )}
              />

              <div>
                <label className="block font-semibold mb-1 text-[#594317]">
                  Dormitorios
                </label>
                <input
                  {...register("bedrooms")}
                  type="number"
                  placeholder="Dormitorios"
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#594317]">
                  Baños
                </label>
                <input
                  {...register("bathrooms")}
                  type="number"
                  placeholder="Baños"
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#594317]">
                  Condición
                </label>
                <input
                  {...register("condition")}
                  placeholder="Condición"
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                />
                {errors.condition && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.condition.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#594317]">
                  Antigüedad
                </label>
                <input
                  {...register("age")}
                  placeholder="Antigüedad"
                  className="w-full p-2 border rounded bg-[#fcf7ea]/90 text-[#594317] placeholder:text-[#a69468] focus:outline-primary focus:border-[#ffe8ad] transition"
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Servicios / Extras */}
          <div>
            <label
              htmlFor="services"
              className="block font-semibold mb-1 text-[#594317]"
            >
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
            <label
              htmlFor="extras"
              className="block font-semibold mb-1 text-[#594317]"
            >
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
            className="w-full py-2 rounded-lg font-semibold shadow bg-[#ffe8ad] text-[#594317] hover:bg-[#f5e3b8] hover:text-[#ad924a] transition-all duration-200 active:scale-95 border border-[#ebdbb9] cursor-pointer"
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
