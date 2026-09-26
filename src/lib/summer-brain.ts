import type { Lead, Product } from "./types";
import { scoreLead, type LeadScore } from "./lead-scoring";
import { daysSince } from "./utils";

// Summer Brain (spec §24) — motor de reglas, mismo principio que el resto
// de la suite: cada frase del resumen se arma a partir de datos reales
// (leads, productos) que ya están cargados. Nada de esto es generación
// libre de un LLM: es agregación + explicación, así el resumen siempre es
// auditable y nunca puede "alucinar" una métrica que no exista.

export interface LeadPrioritario {
  lead: Lead;
  score: LeadScore;
}

export interface TemaTendencia {
  tema: string;
  cantidad: number;
}

export interface ProductoDestacado {
  producto: Product;
  motivo: string;
}

export interface SummerBriefing {
  resumen: string[];
  metricas: { total: number; hot: number; warm: number; cold: number; seguimientosPendientes: number };
  leadsPrioritarios: LeadPrioritario[];
  temaTendencia?: TemaTendencia;
  productoDestacado?: ProductoDestacado;
  alertas: string[];
}

export function generateBriefing(leads: Lead[], products: Product[]): SummerBriefing {
  const conScore = leads.map((lead) => ({ lead, score: scoreLead(lead) }));
  const hot = conScore.filter((x) => x.score.nivel === "hot");
  const warm = conScore.filter((x) => x.score.nivel === "warm");
  const cold = conScore.filter((x) => x.score.nivel === "cold");

  const activos = leads.filter((l) => l.estado !== "vendido" && l.estado !== "perdido");
  const seguimientosPendientes = activos.filter((l) => l.proximaAccion);

  const leadsPrioritarios = [...hot]
    .sort((a, b) => b.score.puntos - a.score.puntos)
    .slice(0, 3);

  // Tendencia de interés: el tema con más leads activos (mínimo 2 para
  // que valga la pena mencionarlo como tendencia).
  const porTema = new Map<string, number>();
  activos.forEach((l) => {
    if (!l.interesEn) return;
    porTema.set(l.interesEn, (porTema.get(l.interesEn) ?? 0) + 1);
  });
  let temaTendencia: TemaTendencia | undefined;
  for (const [tema, cantidad] of porTema) {
    if (cantidad >= 2 && (!temaTendencia || cantidad > temaTendencia.cantidad)) {
      temaTendencia = { tema, cantidad };
    }
  }

  // Producto a impulsar: prioriza cupos bajos (urgencia real); si no hay,
  // el que más leads activos tiene asociado.
  const productosActivos = products.filter((p) => p.estado === "activo");
  const conCuposBajos = productosActivos
    .filter((p) => p.cupos != null && p.cupos <= 15)
    .sort((a, b) => (a.cupos ?? 0) - (b.cupos ?? 0))[0];

  let productoDestacado: ProductoDestacado | undefined;
  if (conCuposBajos) {
    productoDestacado = { producto: conCuposBajos, motivo: `quedan solo ${conCuposBajos.cupos} cupos cargados` };
  } else {
    const porProducto = new Map<string, number>();
    activos.forEach((l) => {
      if (!l.productoId) return;
      porProducto.set(l.productoId, (porProducto.get(l.productoId) ?? 0) + 1);
    });
    const top = [...porProducto.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) {
      const producto = productosActivos.find((p) => p.id === top[0]);
      if (producto) productoDestacado = { producto, motivo: `es el que más consultas activas está generando (${top[1]})` };
    }
  }

  const alertas: string[] = [];
  const sinContactoHaceRato = activos.filter((l) => daysSince(l.ultimaInteraccion) > 10);
  if (sinContactoHaceRato.length > 0) {
    alertas.push(
      `${sinContactoHaceRato.length} lead(s) sin contacto hace más de 10 días: ${sinContactoHaceRato
        .map((l) => `${l.nombre} ${l.apellido}`)
        .join(", ")}.`
    );
  }
  const cuposCriticos = productosActivos.filter((p) => p.cupos != null && p.cupos <= 5);
  cuposCriticos.forEach((p) => alertas.push(`${p.nombre} tiene solo ${p.cupos} cupos cargados — quedan casi agotados.`));

  const resumen: string[] = [];
  resumen.push(
    `Tenés ${leads.length} lead(s) en total: ${hot.length} caliente(s), ${warm.length} tibio(s) y ${cold.length} frío(s).`
  );
  if (temaTendencia) {
    resumen.push(
      `${temaTendencia.tema} está generando más consultas que el resto del catálogo (${temaTendencia.cantidad} leads activos).`
    );
  }
  if (productoDestacado) {
    resumen.push(`Te recomiendo priorizar ${productoDestacado.producto.nombre}: ${productoDestacado.motivo}.`);
  }
  if (seguimientosPendientes.length > 0) {
    resumen.push(`Tenés ${seguimientosPendientes.length} seguimiento(s) con una próxima acción pendiente de hacer hoy.`);
  }

  return {
    resumen,
    metricas: { total: leads.length, hot: hot.length, warm: warm.length, cold: cold.length, seguimientosPendientes: seguimientosPendientes.length },
    leadsPrioritarios,
    temaTendencia,
    productoDestacado,
    alertas,
  };
}
