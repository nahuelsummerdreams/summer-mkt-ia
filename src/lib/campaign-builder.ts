import type { Product } from "./types";
import { formatCurrency, daysUntil } from "./utils";

// Campaign Builder (spec §16) — motor de reglas, mismo principio que el
// resto de SUMMER AI: la estrategia y los KPIs se arman a partir de datos
// reales del producto (cupos, precio, fecha límite de reserva) más lo que
// el usuario ingresó (objetivo, fecha límite de campaña, presupuesto).
// Cuando hace falta un supuesto que no es un dato real (ej. tasa de
// conversión), se etiqueta explícitamente como estimación editable —
// nunca se presenta como un dato histórico real.

const CONVERSION_SUPUESTA = 0.08; // 8% leads→venta, valor de referencia editable, no histórico

export interface MetaDetectada {
  cantidad: number;
  unidad: string;
}

export interface CampaignKpis {
  metaDetectada: MetaDetectada;
  leadsNecesarios: number;
  conversionSupuesta: number;
  nota: string;
}

export interface CampaignDia {
  fecha: string;
  tema: string;
}

export interface CampaignPlan {
  producto: Product;
  diasRestantes: number | null;
  presupuesto?: number;
  presupuestoDiario?: number;
  publicoObjetivo: string[];
  estrategia: string[];
  kpis?: CampaignKpis;
  calendario: CampaignDia[];
  advertencias: string[];
}

function detectarMeta(texto: string): MetaDetectada | undefined {
  const match = texto.match(/(\d+)\s*(paquetes?|pasajeros?|ventas?|reservas?|cupos?)/i);
  if (!match) return undefined;
  return { cantidad: Number(match[1]), unidad: match[2].toLowerCase() };
}

const TEMAS_ROTACION = [
  "Hook / presentación",
  "Detalle del producto (hotel, incluye)",
  "Precio + urgencia",
  "Testimonio / experiencia",
  "CTA directo a WhatsApp",
];

export function generateCampaignPlan(params: {
  producto: Product;
  objetivoTexto: string;
  fechaLimite: string;
  presupuesto?: number;
}): CampaignPlan {
  const { producto, objetivoTexto, fechaLimite, presupuesto } = params;
  const advertencias: string[] = [];

  const diasRestantes = daysUntil(fechaLimite);
  if (diasRestantes == null) advertencias.push("La fecha límite ingresada no es válida.");
  if (diasRestantes != null && diasRestantes < 0) advertencias.push("La fecha límite ya pasó — ajustala antes de lanzar la campaña.");

  const presupuestoDiario =
    presupuesto && diasRestantes && diasRestantes > 0 ? Math.round(presupuesto / diasRestantes) : undefined;

  const publicoObjetivo = producto.publicoObjetivo.length > 0 ? producto.publicoObjetivo : ["turismo-joven"];

  const estrategia: string[] = [];
  estrategia.push(`Objetivo declarado: "${objetivoTexto}".`);
  if (diasRestantes != null && diasRestantes >= 0) {
    estrategia.push(`Quedan ${diasRestantes} día(s) hasta la fecha límite (${fechaLimite}).`);
  }
  if (producto.cupos != null) {
    estrategia.push(
      producto.cupos <= 15
        ? `Cupos reales limitados (${producto.cupos}): usá esto como urgencia genuina, no como recurso de copy vacío.`
        : `Hay ${producto.cupos} cupos cargados — todavía no es una urgencia real de disponibilidad.`
    );
  }
  if (presupuestoDiario) {
    estrategia.push(`Con ${formatCurrency(presupuesto ?? 0)} de presupuesto, eso es ${formatCurrency(presupuestoDiario)} por día.`);
  }
  estrategia.push(
    `Público sugerido: ${publicoObjetivo.join(", ")}, en base al público objetivo cargado en el producto.`
  );

  const metaDetectada = detectarMeta(objetivoTexto);
  let kpis: CampaignKpis | undefined;
  if (metaDetectada) {
    const leadsNecesarios = Math.ceil(metaDetectada.cantidad / CONVERSION_SUPUESTA);
    kpis = {
      metaDetectada,
      leadsNecesarios,
      conversionSupuesta: CONVERSION_SUPUESTA,
      nota: `Estimado con una conversión supuesta del ${Math.round(CONVERSION_SUPUESTA * 100)}% (valor de referencia editable, no un dato histórico real de esta campaña).`,
    };
  } else {
    advertencias.push('No se detectó una meta numérica en el objetivo (ej. "vender 20 paquetes") — no se calculan KPIs sin eso.');
  }

  const calendario: CampaignDia[] = [];
  const dias = diasRestantes != null && diasRestantes > 0 ? Math.min(diasRestantes, 14) : 0;
  for (let i = 0; i < dias; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i);
    calendario.push({ fecha: fecha.toISOString().slice(0, 10), tema: TEMAS_ROTACION[i % TEMAS_ROTACION.length] });
  }

  return { producto, diasRestantes, presupuesto, presupuestoDiario, publicoObjetivo, estrategia, kpis, calendario, advertencias };
}
