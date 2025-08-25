// src/schema/propertySchema.ts
import * as yup from "yup";

// Helper para validar URLs http(s)
const isValidUrl = (value?: string) => {
  if (!value) return true; // permitimos vacío (el array se limpia al guardar)
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const OPERATION_TYPES = ["Venta", "Arrendamiento"] as const;
const CONDITION_OPTIONS = [
  "Excelente",
  "Muy bueno",
  "Bueno",
  "Regular",
  "A refaccionar",
] as const;

export const propertySchema = yup
  .object({
    // Básicos
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

    operationType: yup
      .string()
      .oneOf([...OPERATION_TYPES], "Tipo de operación inválido")
      .required("Operación requerida"),

    propertyType: yup.string().notRequired(),

    // Precio: requerido solamente en Venta
    price: yup
      .number()
      .transform((v, o) => (o === "" || o === undefined ? null : v))
      .when("operationType", {
        is: "Venta",
        then: (s) =>
          s
            .typeError("El precio debe ser un número")
            .min(0, "El precio no puede ser negativo")
            .required("El precio es obligatorio"),
        otherwise: (s) => s.notRequired().nullable(),
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

    measure: yup
      .number()
      .typeError("Debes ingresar un número válido para las hectáreas.")
      .positive("El número debe ser mayor a 0.")
      .required("Las hectáreas son obligatorias."),

    // Imágenes (nuevas) + existentes
    // Regla: debe haber al menos 1 entre nuevas (imageFiles) o existentes (existingImagesUrls)
    imageFiles: yup
      .mixed()
      .test("at-least-one", "Debes subir al menos una imagen.", function (value) {
        const { existingImagesUrls = [] } = (this.parent || {}) as {
          existingImagesUrls?: unknown[];
        };
        const hasNew = Array.isArray(value) && value.length > 0;
        const hasExisting =
          Array.isArray(existingImagesUrls) && existingImagesUrls.length > 0;
        return hasNew || hasExisting;
      }),

    // Lista de URLs ya guardadas (se sincroniza en el form)
    existingImagesUrls: yup.array(yup.string()).default([]),

    // Videos por URL
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
      .transform((_val, orig) => (Array.isArray(orig) ? orig : orig ? [orig] : [""])),

    // Servicios / Extras
    services: yup.array(yup.string()).default([]),
    extras: yup.array(yup.string()).default([]),

    // —— Campos SOLO si incluye "Vivienda" en extras —— //
    environments: yup
      .number()
      .nullable()
      .transform((v, o) => (o === "" || o === undefined ? null : v))
      .when("extras", {
        is: (extras: string[] = []) => extras.includes("Vivienda"),
        then: (s) =>
          s
            .typeError("Debe ser número")
            .min(1, "Mínimo 1 ambiente")
            .required("Campo requerido"),
        otherwise: (s) => s.notRequired().nullable(),
      }),

    bedrooms: yup
      .number()
      .nullable()
      .transform((v, o) => (o === "" || o === undefined ? null : v))
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
      .transform((v, o) => (o === "" || o === undefined ? null : v))
      .when("extras", {
        is: (extras: string[] = []) => extras.includes("Vivienda"),
        then: (s) =>
          s
            .typeError("Debe ser número")
            .min(1, "Mínimo 1 baño")
            .required("Campo requerido"),
        otherwise: (s) => s.notRequired().nullable(),
      }),

    condition: yup
      .string()
      .when("extras", {
        is: (extras: string[] = []) => extras.includes("Vivienda"),
        then: (s) =>
          s
            .oneOf([...CONDITION_OPTIONS], "Estado inválido")
            .required("Condición requerida"),
        otherwise: (s) => s.notRequired(),
      }),

    houseMeasures: yup
      .number()
      .nullable()
      .transform((v, o) => (o === "" || o === undefined ? null : v))
      .when("extras", {
        is: (extras: string[] = []) => extras.includes("Vivienda"),
        then: (s) =>
          s
            .typeError("La medida debe ser un número")
            .min(1, "La medida debe ser mayor a cero")
            .required("La medida es obligatoria"),
        otherwise: (s) => s.notRequired().nullable(),
      }),
  })
  .required();
