import type { Product } from "./types";

// Calendario de contenidos (spec §14) — motor de reglas: asigna un tema
// fijo por día de la semana y sugiere, para ese tema, el producto activo
// real que mejor encaja (nunca un producto inventado). Si no hay ningún
// producto que encaje, el día queda sin sugerencia en vez de forzar uno.

export type TemaDia =
  | "turismo-joven"
  | "hotel"
  | "precio"
  | "destino"
  | "oferta"
  | "experiencia"
  | "cta";

export interface DiaCalendario {
  diaSemana: string;
  fecha: string; // ISO
  tema: TemaDia;
  temaLabel: string;
  emoji: string;
  productoSugerido?: Product;
}

const PLANTILLA_SEMANA: { diaSemana: string; tema: TemaDia; temaLabel: string; emoji: string }[] = [
  { diaSemana: "Lunes", tema: "turismo-joven", temaLabel: "Turismo Joven", emoji: "🎒" },
  { diaSemana: "Martes", tema: "hotel", temaLabel: "Hotel", emoji: "🏨" },
  { diaSemana: "Miércoles", tema: "precio", temaLabel: "Precio", emoji: "💰" },
  { diaSemana: "Jueves", tema: "destino", temaLabel: "Destino", emoji: "🌎" },
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
    case "turismo-joven":
      return activos.find((p) => p.categoria === "turismo-joven" || p.publicoObjetivo.includes("turismo-joven"));
    case "hotel":
      return activos.find((p) => p.hotelNombre);
    case "precio":
      return [...activos].sort((a, b) => a.precioVenta - b.precioVenta)[0];
    case "destino":
      return activos[0];
    case "oferta":
      return [...activos]
        .filter((p) => p.cupos != null)
        .sort((a, b) => (a.cupos ?? Infinity) - (b.cupos ?? Infinity))[0];
    case "experiencia":
      return activos.find((p) => p.excursionesIncluidas.length > 0) ?? activos[0];
    case "cta":
      return activos.find((p) => p.fechaLimiteReserva) ?? activos[0];
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
