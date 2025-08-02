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
    then: (s) =>
      s
        .typeError("El precio por período debe ser un número válido.")
        .required("El precio por período es obligatorio."),
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
    then: (s) =>
      s
        .typeError("La cantidad de dormitorios debe ser un número.")
        .min(0, "La cantidad mínima de dormitorios es 0.")
        .required("La cantidad de dormitorios es obligatoria."),
    otherwise: (s) => s.notRequired(),
  }),
  bathrooms: yup.number().when("propertyType", {
    is: (val: string) => val !== "Terreno",
    then: (s) =>
      s
        .typeError("La cantidad de baños debe ser un número.")
        .min(0, "La cantidad mínima de baños es 0.")
        .required("La cantidad de baños es obligatoria."),
    otherwise: (s) => s.notRequired(),
  }),

  // Arrays para imágenes y features
  imageUrls: yup
    .array()
    .of(
      yup
        .string()
        .url("Cada imagen debe ser una URL válida.")
        .required("La URL de la imagen es obligatoria.")
    )
    .min(1, "Debes subir al menos una imagen.")
    .required("Debes subir al menos una imagen."),

  videoUrls: yup
    .array()
    .of(
      yup
        .string()
        .url("Cada video debe ser una URL válida.")
        .required("La URL del video es obligatoria.")
    )
    .nullable(),

  measuresList: yup
    .array()
    .of(
      yup
        .string()
        .min(2, "Cada medida debe tener al menos 2 caracteres.")
        .required("La medida es obligatoria.")
    )
    .min(1, "Debes agregar al menos una medida.")
    .required("La lista de medidas es obligatoria."),

  environmentsList: yup
    .array()
    .of(
      yup
        .string()
        .min(2, "Cada ambiente debe tener al menos 2 caracteres.")
        .required("El ambiente es obligatorio.")
    )
    .min(1, "Debes agregar al menos un ambiente.")
    .required("La lista de ambientes es obligatoria."),
  services: yup.array().of(yup.string()),
  extras: yup.array().of(yup.string()),
});
