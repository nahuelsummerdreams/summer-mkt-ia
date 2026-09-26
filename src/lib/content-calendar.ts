import type { Product } from "./types";

// Calendario de contenidos (spec §14) — motor de reglas: asigna un tema
// fijo por día de la semana y sugiere, para ese tema, el producto activo
// real que mejor encaja (nunca un producto inventado). Si no hay ningún
// producto que encaje, el día queda sin sugerencia en vez de forzar uno.
// Genérico por diseño: los temas no asumen turismo, se resuelven contra
// `atributos`/precio/cupos/fechaLimite de cualquier rubro.

export type TemaDia = "publico" | "detalle" | "precio" | "destacado" | "oferta" | "experiencia" | "cta";

export interface DiaCalendario {
  diaSemana: string;
  fecha: string; // ISO
  tema: TemaDia;
  temaLabel: string;
  emoji: string;
  productoSugerido?: Product;
}

const PLANTILLA_SEMANA: { diaSemana: string; tema: TemaDia; temaLabel: string; emoji: string }[] = [
  { diaSemana: "Lunes", tema: "publico", temaLabel: "Público objetivo", emoji: "🎯" },
  { diaSemana: "Martes", tema: "detalle", temaLabel: "Detalle", emoji: "🔎" },
  { diaSemana: "Miércoles", tema: "precio", temaLabel: "Precio", emoji: "💰" },
  { diaSemana: "Jueves", tema: "destacado", temaLabel: "Destacado", emoji: "🌟" },
  { diaSemana: "Viernes", tema: "oferta", temaLabel: "Oferta", emoji: "🔥" },
  { diaSemana: "Sábado", tema: "experiencia", temaLabel: "Experiencia", emoji: "🎉" },
  { diaSemana: "Domingo", tema: "cta", temaLabel: "CTA", emoji: "📲" },
];

function nextMonday(from: Date): Date {
  const d = new Date(from);
  const dow = d.getDay(); // 0 = domingo
  const diff = dow === 1 ? 0 : ((8 - dow) % 7);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sugerirProducto(tema: TemaDia, productos: Product[]): Product | undefined {
  const activos = productos.filter((p) => p.estado === "activo");
  if (activos.length === 0) return undefined;

  switch (tema) {
    case "publico":
      return activos.find((p) => p.publicoObjetivo.includes("jovenes")) ?? activos[0];
    case "detalle":
      return [...activos].sort((a, b) => Object.keys(b.atributos).length - Object.keys(a.atributos).length)[0];
    case "precio":
      return [...activos].sort((a, b) => a.precio - b.precio)[0];
    case "destacado":
      return activos[0];
    case "oferta":
      return [...activos].filter((p) => p.cupos != null).sort((a, b) => (a.cupos ?? Infinity) - (b.cupos ?? Infinity))[0];
    case "experiencia":
      return activos.find((p) => Object.keys(p.atributos).length > 2) ?? activos[0];
    case "cta":
      return activos.find((p) => p.fechaLimite) ?? activos[0];
    default:
      return undefined;
  }
}

export function generateWeeklyCalendar(productos: Product[], desde: Date = new Date()): DiaCalendario[] {
  const lunes = nextMonday(desde);
  return PLANTILLA_SEMANA.map((d, i) => {
    const fecha = new Date(lunes);
    fecha.setDate(fecha.getDate() + i);
    return {
      ...d,
      fecha: fecha.toISOString().slice(0, 10),
      productoSugerido: sugerirProducto(d.tema, productos),
    };
  });
}
