import type { Lead, LeadStatus, Product } from "./types";
import { scoreLead } from "./lead-scoring";

// Analytics (spec §23) — agregación pura sobre datos reales ya cargados
// (Leads, Productos). Ninguna cifra se inventa: donde no hay una fuente
// conectada todavía (redes sociales, historial de contenido generado), la
// sección lo dice explícitamente en vez de simular un número.

export const FUNNEL_ORDEN: LeadStatus[] = [
  "nuevo",
  "contactado",
  "interesado",
  "cotizando",
  "negociacion",
  "reservado",
  "vendido",
];

export interface EtapaFunnel {
  estado: LeadStatus;
  cantidad: number;
}

export interface ComercialMetrics {
  totalLeads: number;
  hot: number;
  warm: number;
  cold: number;
  funnel: EtapaFunnel[];
  perdidos: number;
  ventas: { cantidad: number; facturacionEstimada: number };
  ticketPromedio: number | null;
  conversion: number | null; // ventas / totalLeads
}

export function computeComercialMetrics(leads: Lead[], products: Product[]): ComercialMetrics {
  const conScore = leads.map((l) => scoreLead(l));
  const hot = conScore.filter((s) => s.nivel === "hot").length;
  const warm = conScore.filter((s) => s.nivel === "warm").length;
  const cold = conScore.filter((s) => s.nivel === "cold").length;

  const funnel = FUNNEL_ORDEN.map((estado) => ({
    estado,
    cantidad: leads.filter((l) => l.estado === estado).length,
  }));

  const perdidos = leads.filter((l) => l.estado === "perdido").length;

  const vendidos = leads.filter((l) => l.estado === "vendido");
  const facturacionEstimada = vendidos.reduce((acc, l) => {
    const producto = products.find((p) => p.id === l.productoId);
    if (!producto) return acc;
    return acc + producto.precioVenta * (l.cantidadPasajeros ?? 1);
  }, 0);

  return {
    totalLeads: leads.length,
    hot,
    warm,
    cold,
    funnel,
    perdidos,
    ventas: { cantidad: vendidos.length, facturacionEstimada },
    ticketPromedio: vendidos.length > 0 ? Math.round(facturacionEstimada / vendidos.length) : null,
    conversion: leads.length > 0 ? vendidos.length / leads.length : null,
  };
}

export interface NegocioMetrics {
  productoConMasLeads?: { producto: Product; cantidad: number };
}

export function computeNegocioMetrics(leads: Lead[], products: Product[]): NegocioMetrics {
  const porProducto = new Map<string, number>();
  leads.forEach((l) => {
    if (!l.productoId) return;
    porProducto.set(l.productoId, (porProducto.get(l.productoId) ?? 0) + 1);
  });
  const top = [...porProducto.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return {};
  const producto = products.find((p) => p.id === top[0]);
  if (!producto) return {};
  return { productoConMasLeads: { producto, cantidad: top[1] } };
}
