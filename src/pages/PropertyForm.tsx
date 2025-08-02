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
const OPERATION_TYPES = ["Venta", "Alquiler", "Alquiler temporal"];
const PRICE_BY = ["día", "semana", "mes"];

export default function PropertyFormRH() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(propertySchema),
    mode: "onChange",
    defaultValues: {},
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const propertyType = watch("propertyType");
  const operationType = watch("operationType");
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/api/properties/${id}`)
        .then((res) => res.json())
        .then((data) => {
          reset({
            ...data,
            price: data.price?.toString() ?? "",
            environments: data.environments?.toString() ?? "",
            bedrooms: data.bedrooms?.toString() ?? "",
            bathrooms: data.bathrooms?.toString() ?? "",
            lat: data.lat?.toString() ?? "",
            lng: data.lng?.toString() ?? "",
            floor: data.floor?.toString() ?? "",
            apartmentNumber: data.apartmentNumber?.toString() ?? "",
            pricePerDay: data.pricePerDay?.toString() ?? "",
            pricePerWeek: data.pricePerWeek?.toString() ?? "",
            pricePerMonth: data.pricePerMonth?.toString() ?? "",
            imageUrls:
              Array.isArray(data.imageUrls) && data.imageUrls.length
                ? data.imageUrls
                : [""],
            videoUrls:
              Array.isArray(data.videoUrls) && data.videoUrls.length
                ? data.videoUrls
                : [""],
            measuresList:
              Array.isArray(data.measuresList) && data.measuresList.length
                ? data.measuresList
                : [""],
            environmentsList:
              Array.isArray(data.environmentsList) &&
              data.environmentsList.length
                ? data.environmentsList
                : [""],
            services: Array.isArray(data.services) ? data.services : [],
            extras: Array.isArray(data.extras) ? data.extras : [],
            condition: data.condition ?? "",
            age: data.age ?? "",
            propertyType: data.propertyType ?? "",
            operationType: data.operationType ?? "",
            location: data.location ?? "",
            title: data.title ?? "",
            description: data.description ?? "",
          });
        });
    }
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      location: data.location,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
      imageUrls: data.imageUrls?.filter(Boolean),
      videoUrls: data.videoUrls.filter(Boolean),
      propertyType: data.propertyType,
      operationType: data.operationType,
      environments: Number(data.environments),
      environmentsList: data.environmentsList.filter(Boolean),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      condition: data.condition,
      age: data.age,
      measuresList: data.measuresList.filter(Boolean),
      services: data.services || [],
      extras: data.extras || [],
      floor: data.floor || undefined,
      apartmentNumber: data.apartmentNumber || undefined,
      pricePerDay: data.pricePerDay ? Number(data.pricePerDay) : undefined,
      pricePerWeek: data.pricePerWeek ? Number(data.pricePerWeek) : undefined,
      pricePerMonth: data.pricePerMonth
        ? Number(data.pricePerMonth)
        : undefined,
    };

    setTriedSubmit(false);

    const isEdit = Boolean(id);
    const url = isEdit
      ? `http://localhost:3000/api/properties/${id}`
      : "http://localhost:3000/api/properties";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const watchPropertyType = watch("propertyType");
  const watchOperationType = watch("operationType");

  useEffect(() => {
    if (watchPropertyType !== "Departamento") {
      setValue("floor", "");
      setValue("apartmentNumber", "");
      clearErrors(["floor", "apartmentNumber"]);
    }
    if (watchPropertyType === "Terreno") {
      setValue("environments", undefined);
      setValue("bedrooms", undefined);
      setValue("bathrooms", undefined);
      clearErrors(["environments", "bedrooms", "bathrooms"]);
    }
  }, [watchPropertyType, setValue, clearErrors]);

  useEffect(() => {
    if (watchOperationType !== "Alquiler temporal") {
      setValue("temporalPrice", undefined);
      setValue("priceBy", "");
      clearErrors(["temporalPrice", "priceBy"]);
    }
  }, [watchOperationType, setValue, clearErrors]);

  return (
    <div className="w-full min-h-screen flex items-start justify-center bg-gray-50 py-12">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div className="mb-4">
          <label htmlFor="title" className="block font-medium mb-1">
            Título
          </label>
          <input
            {...register("title")}
            placeholder="Título"
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="´description" className="block font-medium mb-1">
            Descripción
          </label>
          <textarea
            {...register("description")}
            placeholder="Descripción"
            className="w-full p-2 border rounded"
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="mb-4">
          <select
            {...register("propertyType")}
            className="w-full p-2 border rounded"
          >
            <option value="">Tipo de propiedad</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p className="text-red-500">{errors.propertyType.message}</p>
          )}
        </div>

        <div className="mb-4">
          <select
            {...register("operationType")}
            className="w-full p-2 border rounded"
          >
            <option value="">Tipo de operación</option>
            {OPERATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.operationType && (
            <p className="text-red-500">{errors.operationType.message}</p>
          )}
        </div>

        {operationType !== "Alquiler temporal" && (
          <div className="mb-4">
            <label htmlFor="price" className="block font-medium mb-1">
              Precio
            </label>
            <input
              {...register("price")}
              type="number"
              placeholder="Precio"
              className="w-full p-2 border rounded"
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>
        )}

        {/* Condicional: solo si es Departamento */}
        {propertyType === "Departamento" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="mb-4">
              <label htmlFor="floor" className="block font-medium mb-1">
                Piso
              </label>
              <input
                {...register("floor")}
                placeholder="Piso"
                className="p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="apartmentNumber"
                className="block font-medium mb-1"
              >
                Depto
              </label>
              <input
                {...register("apartmentNumber")}
                placeholder="Depto"
                className="p-2 border rounded"
              />
            </div>
            {errors.floor && (
              <p className="text-red-500">{errors.floor.message}</p>
            )}
            {errors.apartmentNumber && (
              <p className="text-red-500">{errors.apartmentNumber.message}</p>
            )}
          </div>
        )}

        {/* Condicional: Alquiler temporal */}
        {operationType === "Alquiler temporal" && (
          <div className="grid grid-cols-2 gap-4 items-end">
            {/* Precio por período */}
            <div>
              <div>
                <label
                  htmlFor="temporalPrice"
                  className="block font-medium mb-1"
                >
                  Precio por período
                </label>
                <input
                  {...register("temporalPrice")}
                  type="number"
                  placeholder="Precio por período"
                  className="p-2 border rounded w-full"
                />
                <p className="text-red-500 min-h-[1.5em]">
                  {errors.temporalPrice?.message ?? ""}
                </p>
              </div>
            </div>
            {/* Select de período */}
            <div>
              <div>
                <label className="block font-medium mb-1">Período</label>
                <select
                  {...register("priceBy")}
                  className="p-2 border rounded w-full"
                >
                  <option value="">Período</option>
                  {PRICE_BY.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <p className="text-red-500 min-h-[1.5em]">
                  {errors.priceBy?.message ?? ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dormitorios, Baños y Ambientes (opcionales si es Terreno) */}
        {watchPropertyType !== "Terreno" && (
          <>
            <div className="mb-4">
              <label htmlFor="environments" className="block font-medium mb-1">
                Ambientes
              </label>
              <input
                {...register("environments")}
                type="number"
                placeholder="Ambientes"
                className="w-full p-2 border rounded"
              />
              {errors.environments && (
                <p className="text-red-500">{errors.environments.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="mb-4">
                <label htmlFor="bedrooms" className="block font-medium mb-1">
                  Dormitorios
                </label>
                <input
                  {...register("bedrooms")}
                  type="number"
                  placeholder="Dormitorios"
                  className="p-2 border rounded"
                />
                {errors.bedrooms && (
                  <p className="text-red-500">
                    {errors.bedrooms.message as any}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="bathrooms" className="block font-medium mb-1">
                  Baños
                </label>
                <input
                  {...register("bathrooms")}
                  type="number"
                  placeholder="Baños"
                  className="p-2 border rounded"
                />
                {errors.bathrooms && (
                  <p className="text-red-500">
                    {errors.bathrooms.message as any}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="mb-4">
          <label htmlFor="location" className="block font-medium mb-1">
            Ubicación
          </label>
          <input
            {...register("location")}
            placeholder="Ubicación"
            className="w-full p-2 border rounded"
          />
          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="mb-4">
            <label htmlFor="lat" className="block font-medium mb-1">
              Latitud
            </label>
            <input
              {...register("lat")}
              type="number"
              placeholder="Latitud"
              className="p-2 border rounded w-full"
            />
            <p className="text-red-500 min-h-[1.5em]">
              {errors.lat?.message ?? ""}
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="lng" className="block font-medium mb-1">
              Longitud
            </label>
            <input
              {...register("lng")}
              type="number"
              placeholder="Longitud"
              className="p-2 border rounded w-full"
            />
            <p className="text-red-500 min-h-[1.5em]">
              {errors.lng?.message ?? ""}
            </p>
          </div>
        </div>

        {/* DynamicList: imágenes, videos, medidas, ambientesList */}
        <Controller
          name="imageUrls"
          control={control}
          render={({ field }) => (
            <>
              <DynamicList
                label="Imágenes"
                items={(field.value ?? [""]).filter(
                  (x): x is string => typeof x === "string"
                )}
                onChange={(i, v) =>
                  field.onChange(
                    (field.value ?? [""]).map((x, ix) => (ix === i ? v : x))
                  )
                }
                onAdd={() => field.onChange([...(field.value ?? [""]), ""])}
                onRemove={(i) =>
                  field.onChange(
                    (field.value ?? [""]).filter((_, ix) => ix !== i)
                  )
                }
              />
              {/* Error general del array */}
              {errors.imageUrls?.message && (
                <p className="text-red-500">{errors.imageUrls.message}</p>
              )}
              {/* Errores por cada elemento */}
              {Array.isArray(errors.imageUrls) &&
                errors.imageUrls.map(
                  (err, i) =>
                    err && (
                      <p key={i} className="text-red-500">
                        Video {i + 1}: {err?.message}
                      </p>
                    )
                )}
            </>
          )}
        />

        <Controller
          name="videoUrls"
          control={control}
          render={({ field }) => (
            <>
              <DynamicList
                label="Videos"
                items={field.value ?? [""]}
                onChange={(i, v) =>
                  field.onChange(
                    (field.value ?? [""]).map((x, ix) => (ix === i ? v : x))
                  )
                }
                onAdd={() => field.onChange([...(field.value ?? [""]), ""])}
                onRemove={(i) =>
                  field.onChange(
                    (field.value ?? [""]).filter((_, ix) => ix !== i)
                  )
                }
              />
              {/* Error general del array */}
              {errors.videoUrls?.message && (
                <p className="text-red-500">{errors.videoUrls.message}</p>
              )}
              {/* Errores por cada elemento */}
              {Array.isArray(errors.videoUrls) &&
                errors.videoUrls.map(
                  (err, i) =>
                    err && (
                      <p key={i} className="text-red-500">
                        Video {i + 1}: {err?.message}
                      </p>
                    )
                )}
            </>
          )}
        />

        <Controller
          name="measuresList"
          control={control}
          render={({ field }) => (
            <>
              <DynamicList
                label="Medidas"
                items={(field.value ?? [""]).filter(
                  (x): x is string => typeof x === "string"
                )}
                onChange={(i, v) =>
                  field.onChange(
                    (field.value ?? [""]).map((x, ix) => (ix === i ? v : x))
                  )
                }
                onAdd={() => field.onChange([...(field.value ?? [""]), ""])}
                onRemove={(i) =>
                  field.onChange(
                    (field.value ?? [""]).filter((_, ix) => ix !== i)
                  )
                }
              />
              {/* Error general del array */}
              {errors.measuresList?.message && (
                <p className="text-red-500">{errors.measuresList.message}</p>
              )}
              {/* Errores por cada elemento */}
              {Array.isArray(errors.measuresList) &&
                errors.measuresList.map(
                  (err, i) =>
                    err && (
                      <p key={i} className="text-red-500">
                        Medida {i + 1}: {err?.message}
                      </p>
                    )
                )}
            </>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Antigüedad */}
          <div>
            <label className="font-medium block mb-1">Antigüedad</label>
            <input
              {...register("age")}
              placeholder="Ej: A Estrenar, 10 años, etc."
              className="w-full p-2 border rounded"
            />
            {errors.age && (
              <p className="text-red-500 text-sm">
                {errors.age.message as any}
              </p>
            )}
          </div>
          {/* Condición */}
          <div>
            <label className="font-medium block mb-1">Condición</label>
            <input
              {...register("condition")}
              placeholder="Ej: Nueva, Buen estado, etc."
              className="w-full p-2 border rounded"
            />
            {errors.condition && (
              <p className="text-red-500 text-sm">
                {errors.condition.message as any}
              </p>
            )}
          </div>
        </div>

        <Controller
          name="environmentsList"
          control={control}
          render={({ field }) => (
            <>
              <DynamicList
                label="Ambientes"
                items={(field.value ?? [""]).filter(
                  (x): x is string => typeof x === "string"
                )}
                onChange={(i, v) =>
                  field.onChange(
                    (field.value ?? [""]).map((x, ix) => (ix === i ? v : x))
                  )
                }
                onAdd={() => field.onChange([...(field.value ?? [""]), ""])}
                onRemove={(i) =>
                  field.onChange(
                    (field.value ?? [""]).filter((_, ix) => ix !== i)
                  )
                }
              />
              {/* Error general del array */}
              {errors.environmentsList?.message && (
                <p className="text-red-500">
                  {errors.environmentsList.message}
                </p>
              )}
              {/* Errores por cada elemento */}
              {Array.isArray(errors.environmentsList) &&
                errors.environmentsList.map(
                  (err, i) =>
                    err && (
                      <p key={i} className="text-red-500">
                        Ambientes {i + 1}: {err?.message}
                      </p>
                    )
                )}
            </>
          )}
        />

        {/* CheckboxGroup para features */}
        <div className="mb-4">
          <label htmlFor="services" className="block font-medium mb-1">
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
        <div className="mb-4">
          <label htmlFor="extras" className="block font-medium mb-1">
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
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
  );
}
