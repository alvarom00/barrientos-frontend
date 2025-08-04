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

const OPERATION_TYPES = ["Venta", "Arrendamiento"];

export default function PropertyFormRH() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(propertySchema),
    mode: "onChange",
    defaultValues: {},
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const operationType = watch("operationType");
  const extras = watch("extras") ?? [];
  const hasVivienda = extras.includes("Vivienda");
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/api/properties/${id}`)
        .then((res) => res.json())
        .then((data) => {
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
          });
        });
    }
  }, [id, reset]);

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
  }, [hasVivienda, setValue, clearErrors]);

  const onSubmit = async (data: any) => {
    const payload = {
      title: data.title,
      description: data.description,
      price: data.price ? Number(data.price) : undefined,
      measure: data.measure ? Number(data.measure) : undefined,
      location: data.location,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
      imageUrls: data.imageUrls?.filter(Boolean),
      videoUrls: data.videoUrls.filter(Boolean),
      operationType: data.operationType,
      services: data.services || [],
      extras: data.extras || [],
      ...(data.extras?.includes("Vivienda")
        ? {
            environments: data.environments
              ? Number(data.environments)
              : undefined,
            environmentsList: data.environmentsList?.filter(Boolean),
            bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
            bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
            condition: data.condition,
            age: data.age,
            houseMeasures: data.houseMeasures,
          }
        : {}),
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18182a] flex items-center justify-center py-10">
      <div className="w-full max-w-2xl bg-white dark:bg-[#232347] rounded-xl shadow-lg px-6 sm:px-10 py-8 animate-fade-in">
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
            <label htmlFor="title" className="block font-medium mb-1">
              Título
            </label>
            <input
              {...register("title")}
              placeholder="Título"
              className="w-full p-2 border border-gray-300 dark:border-[#393964] bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white rounded"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Descripción
            </label>
            <textarea
              {...register("description")}
              placeholder="Descripción"
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-[#393964] bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white rounded resize-none"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <select
                {...register("operationType")}
                className="w-full p-2 border border-gray-300 dark:border-[#393964] rounded bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white"
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
          </div>

          {/* Precio */}
          {operationType !== "Arrendamiento" && (
            <div>
              <label htmlFor="price" className="block font-medium mb-1">
                Precio
              </label>
              <input
                {...register("price")}
                type="number"
                placeholder="Precio"
                className="w-full p-2 border border-gray-300 dark:border-[#393964] bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white rounded"
              />
              {errors.price && (
                <p className="text-red-500">{errors.price.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="measure" className="block font-medium mb-1">
              Hectáreas
            </label>
            <input
              {...register("measure", {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Ej: 150 (en ha)"
              className="w-full p-2 border rounded"
            />
            {errors.measure && (
              <p className="text-red-500">{errors.measure.message}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block font-medium mb-1">
              Ubicación
            </label>
            <input
              {...register("location")}
              placeholder="Ubicación"
              className="w-full p-2 border border-gray-300 dark:border-[#393964] bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white rounded"
            />
            {errors.location && (
              <p className="text-red-500">{errors.location.message}</p>
            )}
          </div>

          {/* Lat/Lng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block font-medium mb-1">
                Latitud
              </label>
              <input
                {...register("lat")}
                type="number"
                placeholder="Latitud"
                className="w-full p-2 border border-gray-300 dark:border-[#393964] bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white rounded"
              />
              <p className="text-red-500 min-h-[1.5em]">
                {errors.lat?.message ?? ""}
              </p>
            </div>
            <div>
              <label htmlFor="lng" className="block font-medium mb-1">
                Longitud
              </label>
              <input
                {...register("lng")}
                type="number"
                placeholder="Longitud"
                className="w-full p-2 border border-gray-300 dark:border-[#393964] bg-gray-50 dark:bg-[#18182a] text-gray-900 dark:text-white rounded"
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
                          Imagen {i + 1}: {err?.message}
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
          {hasVivienda && (
            <>
              <div>
                <label
                  htmlFor="houseMeasures"
                  className="block font-medium mb-1"
                >
                  Superficie (Vivienda)
                </label>
                <input
                  {...register("houseMeasures", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="Ej: 150 (en m²)"
                  className="w-full p-2 border rounded"
                />
                {errors.houseMeasures && (
                  <p className="text-red-500">{errors.houseMeasures.message}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Cantidad de ambientes
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
              {/* Lista de ambientes */}
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
                      <p className="text-red-500">
                        {errors.environmentsList.message}
                      </p>
                    )}
                    {Array.isArray(errors.environmentsList) &&
                      errors.environmentsList.map(
                        (err, i) =>
                          err && (
                            <p key={i} className="text-red-500">
                              Ambiente {i + 1}: {err?.message}
                            </p>
                          )
                      )}
                  </>
                )}
              />

              {/* Dormitorios */}
              <div>
                <label className="block font-medium mb-1">Dormitorios</label>
                <input
                  {...register("bedrooms")}
                  type="number"
                  placeholder="Dormitorios"
                  className="w-full p-2 border rounded"
                />
                {errors.bedrooms && (
                  <p className="text-red-500">{errors.bedrooms.message}</p>
                )}
              </div>
              {/* Baños */}
              <div>
                <label className="block font-medium mb-1">Baños</label>
                <input
                  {...register("bathrooms")}
                  type="number"
                  placeholder="Baños"
                  className="w-full p-2 border rounded"
                />
                {errors.bathrooms && (
                  <p className="text-red-500">{errors.bathrooms.message}</p>
                )}
              </div>
              {/* Condición */}
              <div>
                <label className="block font-medium mb-1">Condición</label>
                <input
                  {...register("condition")}
                  placeholder="Condición"
                  className="w-full p-2 border rounded"
                />
                {errors.condition && (
                  <p className="text-red-500">{errors.condition.message}</p>
                )}
              </div>
              {/* Antigüedad */}
              <div>
                <label className="block font-medium mb-1">Antigüedad</label>
                <input
                  {...register("age")}
                  placeholder="Antigüedad"
                  className="w-full p-2 border rounded"
                />
                {errors.age && (
                  <p className="text-red-500">{errors.age.message}</p>
                )}
              </div>
            </>
          )}

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
            className="
    w-full
    py-2
    rounded-lg
    font-semibold
    transition-all
    duration-200
    shadow
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    bg-gradient-to-r
    from-blue-600
    via-indigo-600
    to-purple-600
    text-white
    hover:from-indigo-700
    hover:via-purple-700
    hover:to-pink-600
    active:scale-95
    animate-fade-in
  "
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
