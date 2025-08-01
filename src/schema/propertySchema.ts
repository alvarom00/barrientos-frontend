// schema/propertySchema.ts
import * as yup from "yup";

export const propertySchema = yup.object({
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
    .typeError("Debe ser un número")
    .min(1000, "Precio mínimo $1000")
    .required("Precio requerido"),
  propertyType: yup.string().required("Tipo requerido"),
  operationType: yup.string().required("Operación requerida"),
  environments: yup.number().when("propertyType", {
    is: (val: string) => val !== "Terreno",
    then: (s) =>
      s
        .typeError("Debe ser número")
        .min(1, "Mínimo 1 ambiente")
        .required("Ambientes requeridos"),
    otherwise: (s) => s.notRequired(),
  }),

  location: yup.string().required("Ubicación requerida"),
  lat: yup.number().typeError("Debe ser número").required("Latitud requerida"),
  lng: yup.number().typeError("Debe ser número").required("Longitud requerida"),

  // Campos agregados
  age: yup
    .string()
    .min(1, "Campo requerido")
    .max(40, "Demasiado largo")
    .required("Antigüedad requerida"),
  condition: yup
    .string()
    .min(2, "Campo requerido")
    .max(40, "Demasiado largo")
    .required("Condición requerida"),

  // Condicional: solo si es Departamento
  floor: yup.string().when("propertyType", {
    is: "Departamento",
    then: (s) => s.required("Piso requerido"),
    otherwise: (s) => s.notRequired(),
  }),
  apartmentNumber: yup.string().when("propertyType", {
    is: "Departamento",
    then: (s) => s.required("Número de depto requerido"),
    otherwise: (s) => s.notRequired(),
  }),

  // Condicional: solo si es Alquiler temporal
  temporalPrice: yup.number().when("operationType", {
    is: "Alquiler temporal",
    then: (s) => s.min(1000, "Precio mínimo 1000").required("Precio requerido"),
    otherwise: (s) => s.notRequired(),
  }),
  priceBy: yup.string().when("operationType", {
    is: "Alquiler temporal",
    then: (s) => s.required("Requerido"),
    otherwise: (s) => s.notRequired(),
  }),

  // Dormitorios/baños no obligatorios en Terreno
  bedrooms: yup.number().when("propertyType", {
    is: (val: string) => val !== "Terreno",
    then: (s) => s.required("Requerido"),
    otherwise: (s) => s.notRequired(),
  }),
  bathrooms: yup.number().when("propertyType", {
    is: (val: string) => val !== "Terreno",
    then: (s) => s.required("Requerido"),
    otherwise: (s) => s.notRequired(),
  }),

  // Arrays para imágenes y features
  imageUrls: yup
    .array()
    .of(yup.string().url("Debe ser una URL válida"))
    .min(1, "Al menos una imagen"),
  videoUrls: yup.array().of(yup.string().url("Debe ser una URL válida")),
  measuresList: yup.array().of(yup.string()),
  environmentsList: yup.array().of(yup.string()),
  services: yup.array().of(yup.string()),
  extras: yup.array().of(yup.string()),
});
