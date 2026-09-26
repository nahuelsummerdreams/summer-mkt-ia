import type { Business, Rubro, VocabularioNegocio } from "./types";

// SUMMER AI es multi-negocio: este catálogo define, por rubro, cómo se
// llaman las cosas (un "paquete" en turismo es un "plato" en gastronomía
// y una "propiedad" en inmobiliaria) para que toda la app hable el idioma
// del negocio configurado en vez de asumir turismo.

export const RUBROS: { id: Rubro; label: string }[] = [
  { id: "turismo", label: "Turismo y viajes" },
  { id: "gastronomia", label: "Gastronomía" },
  { id: "salud-bienestar", label: "Salud y bienestar" },
  { id: "fitness", label: "Fitness" },
  { id: "belleza", label: "Belleza" },
  { id: "educacion", label: "Educación" },
  { id: "inmobiliaria", label: "Inmobiliaria" },
  { id: "retail", label: "Retail / Ecommerce" },
  { id: "servicios-profesionales", label: "Servicios profesionales" },
  { id: "tecnologia", label: "Tecnología" },
  { id: "otro", label: "Otro" },
];

export const VOCABULARIO_POR_RUBRO: Record<Rubro, VocabularioNegocio> = {
  turismo: { itemSingular: "paquete", itemPlural: "paquetes", clienteSingular: "pasajero", clientePlural: "pasajeros" },
  gastronomia: { itemSingular: "plato", itemPlural: "platos", clienteSingular: "comensal", clientePlural: "comensales" },
  "salud-bienestar": {
    itemSingular: "servicio",
    itemPlural: "servicios",
    clienteSingular: "paciente",
    clientePlural: "pacientes",
  },
  fitness: { itemSingular: "clase", itemPlural: "clases", clienteSingular: "alumno", clientePlural: "alumnos" },
  belleza: { itemSingular: "servicio", itemPlural: "servicios", clienteSingular: "cliente", clientePlural: "clientes" },
  educacion: { itemSingular: "curso", itemPlural: "cursos", clienteSingular: "alumno", clientePlural: "alumnos" },
  inmobiliaria: {
    itemSingular: "propiedad",
    itemPlural: "propiedades",
    clienteSingular: "cliente",
    clientePlural: "clientes",
  },
  retail: { itemSingular: "producto", itemPlural: "productos", clienteSingular: "cliente", clientePlural: "clientes" },
  "servicios-profesionales": {
    itemSingular: "servicio",
    itemPlural: "servicios",
    clienteSingular: "cliente",
    clientePlural: "clientes",
  },
  tecnologia: { itemSingular: "producto", itemPlural: "productos", clienteSingular: "cliente", clientePlural: "clientes" },
  otro: { itemSingular: "producto", itemPlural: "productos", clienteSingular: "cliente", clientePlural: "clientes" },
};

export const DEFAULT_BUSINESS: Business = {
  id: "biz-default",
  nombre: "Summer Dreams Viajes",
  rubro: "turismo",
  vocabulario: VOCABULARIO_POR_RUBRO.turismo,
  colorPrimario: "#16a34a",
  colorSecundario: "#06101f",
  tono: "cercano y juvenil",
  descripcion: "Agencia de viajes argentina especializada en turismo joven y experiencias grupales.",
  whatsapp: "5491100000000",
  instagram: "@summerdreamsviajes",
  hashtags: ["#SummerDreams", "#ViajarConSummer"],
};
