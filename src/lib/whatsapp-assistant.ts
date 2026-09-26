import type { Product } from "./types";
import { formatCurrency, formatDateRange } from "./utils";

// Sugerencia de respuesta para el Inbox (spec §20/21) — mismo principio
// que Summer Assistant: si el mensaje entrante menciona un destino real
// del catálogo, sugiere una respuesta con esos datos reales; si no
// reconoce nada, deriva a un humano en vez de inventar. Es una sugerencia
// que el vendedor revisa y edita antes de enviar — nunca se manda sola.

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function suggestReply(mensaje: string, products: Product[]): { texto: string; derivar: boolean } {
  const query = normalize(mensaje);
  const disponibles = products.filter((p) => p.estado === "activo");

  const match = disponibles.find((p) => query.includes(normalize(p.destino)) || query.includes(normalize(p.nombre)));

  if (match) {
    return {
      texto: `¡Hola! 👋 Tenemos ${match.nombre} a ${match.destino}: ${formatDateRange(
        match.fechaSalida,
        match.fechaRegreso
      )}, desde ${formatCurrency(match.precioVenta, match.moneda)}${
        match.incluyeAereos ? " (vuelos incluidos)" : ""
      }. ¿Querés que te cuente más detalles?`,
      derivar: false,
    };
  }

  return {
    texto: "No encontré un producto del catálogo que coincida con este mensaje — conviene que lo derives a un vendedor humano.",
    derivar: true,
  };
}
