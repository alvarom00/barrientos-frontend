import * as yup from "yup";

// Helper para validar URLs http(s)
const isValidUrl = (value?: string) => {
  if (!value) return true; // permitimos string vacío; el array se limpia al guardar
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export const propertySchema = yup.object().shape({
  title: yup
    .string()
    .min(5, "Mínimo 5 caracteres")
    .max(120, "Máx. 120")
    .required("Título requerido"),

  description: yup
    .string()
    .min(10, "Muy corto")
    .max(2000, "Demasiado largo")
    .required("Descripción requerida"),

  price: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value
    )
    .when("operationType", {
      is: "Venta",
      then: (schema) =>
        schema
          .required("El precio es obligatorio")
          .typeError("El precio debe ser un número"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  operationType: yup.string().required("Operación requerida"),

  // Solo requeridos si hay "Vivienda" en extras:
  environments: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value
    )
    .when("extras", {
      is: (extras: string[] = []) => extras.includes("Vivienda"),
      then: (s) =>
        s
          .typeError("Debe ser número")
          .min(1, "Mínimo 1 ambiente")
          .required("Campo requerido"),
      otherwise: (s) => s.notRequired().nullable(),
    }),

  environmentsList: yup
    .array()
    .of(
      yup
        .string()
        .min(2, "Cada ambiente debe tener al menos 2 caracteres.")
        .required("El ambiente es obligatorio.")
    )
    .min(1, "Debes agregar al menos un ambiente.")
    .when("extras", {
      is: (extras: string[] = []) => extras.includes("Vivienda"),
      then: (s) => s.required("La lista de ambientes es obligatoria."),
      otherwise: (s) => s.notRequired(),
    }),

  bedrooms: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value
    )
    .when("extras", {
      is: (extras: string[] = []) => extras.includes("Vivienda"),
      then: (s) =>
        s
          .typeError("Debe ser número")
          .min(1, "Mínimo 1 dormitorio")
          .required("Campo requerido"),
      otherwise: (s) => s.notRequired().nullable(),
    }),

  bathrooms: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value
    )
    .when("extras", {
      is: (extras: string[] = []) => extras.includes("Vivienda"),
      then: (s) =>
        s
          .typeError("Debe ser número")
          .min(1, "Mínimo 1 baño")
          .required("Campo requerido"),
      otherwise: (s) => s.notRequired().nullable(),
    }),

  condition: yup.string().when("extras", {
    is: (extras: string[] = []) => extras.includes("Vivienda"),
    then: (s) =>
      s
        .min(2, "Campo requerido")
        .max(40, "Demasiado largo")
        .required("Condición requerida"),
    otherwise: (s) => s.notRequired(),
  }),

  age: yup.string().when("extras", {
    is: (extras: string[] = []) => extras.includes("Vivienda"),
    then: (s) =>
      s
        .min(1, "Campo requerido")
        .max(40, "Demasiado largo")
        .required("Antigüedad requerida"),
    otherwise: (s) => s.notRequired(),
  }),

  // Campos siempre requeridos
  location: yup.string().required("Ubicación requerida"),

  lat: yup
    .number()
    .typeError("La latitud debe ser un número válido entre -90 y 90.")
    .min(-90, "La latitud mínima es -90.")
    .max(90, "La latitud máxima es 90.")
    .required("La latitud es obligatoria"),

  lng: yup
    .number()
    .typeError("La longitud debe ser un número válido entre -180 y 180.")
    .min(-180, "La longitud mínima es -180.")
    .max(180, "La longitud máxima es 180.")
    .required("La longitud es obligatoria"),

  // Imágenes (al menos una, entre nuevas o existentes)
  imageFiles: yup
    .mixed()
    .test("required", "Debes subir al menos una imagen.", function (value) {
      // @ts-ignore
      const { existingImages = [] } = this.options?.context || {};
      const hasNew = Array.isArray(value) && value.length > 0;
      const hasExisting =
        Array.isArray(existingImages) && existingImages.length > 0;
      return hasNew || hasExisting;
    }),

  // 🎥 Videos por URL
  videoUrls: yup
    .array(
      yup
        .string()
        .nullable()
        .test("is-url", "Ingrese una URL válida (http/https)", (v) =>
          isValidUrl(v ?? undefined)
        )
    )
    .nullable()
    .transform((_val, orig) =>
      Array.isArray(orig) ? orig : orig ? [orig] : [""]
    ),

  houseMeasures: yup.number().when("extras", {
    is: (extras: string[] = []) => extras.includes("Vivienda"),
    then: (s) =>
      s
        .typeError("La medida debe ser un número")
        .min(1, "La medida debe ser mayor a cero")
        .required("La medida es obligatoria"),
    otherwise: (s) => s.notRequired(),
  }),

  measure: yup
    .number()
    .typeError("Debes ingresar un número válido para las hectáreas.")
    .positive("El número debe ser mayor a 0.")
    .required("Las hectáreas son obligatorias."),

  services: yup.array().of(yup.string()),
  extras: yup.array().of(yup.string()).default([]),
});
