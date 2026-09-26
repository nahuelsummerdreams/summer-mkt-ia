import type { Product, VocabularioNegocio } from "./types";
import { formatCurrency } from "./utils";

// Sugerencia de respuesta para el Inbox (spec §20/21) — mismo principio
// que Summer Assistant: si el mensaje entrante menciona un producto real
// del catálogo (por nombre o por algún atributo cargado), sugiere una
// respuesta con esos datos reales; si no reconoce nada, deriva a un
// humano en vez de inventar. Es una sugerencia que el vendedor revisa y
// edita antes de enviar — nunca se manda sola.

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function suggestReply(
  mensaje: string,
  products: Product[],
  vocabulario: VocabularioNegocio
): { texto: string; derivar: boolean } {
  const query = normalize(mensaje);
  const disponibles = products.filter((p) => p.estado === "activo");

  const match = disponibles.find(
    (p) => query.includes(normalize(p.nombre)) || Object.values(p.atributos).some((v) => query.includes(normalize(v)))
  );

  if (match) {
    const detalle = Object.values(match.atributos)[0];
    return {
      texto: `¡Hola! 👋 Tenemos ${match.nombre}${detalle ? ` — ${detalle}` : ""}, desde ${formatCurrency(
        match.precio,
        match.moneda
      )}. ¿Querés que te cuente más sobre este ${vocabulario.itemSingular}?`,
      derivar: false,
    };
  }

  return {
    texto: `No encontré un ${vocabulario.itemSingular} del catálogo que coincida con este mensaje — conviene que lo derives a alguien del equipo.`,
    derivar: true,
  };
}
