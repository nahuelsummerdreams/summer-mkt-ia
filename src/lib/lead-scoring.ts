import type { Lead } from "./types";
import { formatCurrency, formatDate, daysSince } from "./utils";

// Lead Scoring (spec §19) — motor de reglas, no una caja negra.
// Cada nivel viene siempre acompañado de una explicación en español que
// enumera exactamente qué señales comerciales reales lo justifican, para
// que el vendedor pueda confiar en el número sin tener que adivinar de
// dónde sale.

export type LeadScoreNivel = "hot" | "warm" | "cold";

export interface LeadScore {
  nivel: LeadScoreNivel;
  puntos: number;
  explicacion: string;
  señales: string[];
}

const PESOS = {
  fechaConcreta: 2,
  presupuesto: 2,
  pasajeros: 1,
  pidioMediosPago: 3,
  interaccionReciente: 2,
  enProcesoAvanzado: 2,
};

export function scoreLead(lead: Lead): LeadScore {
  const señalesPositivas: string[] = [];
  const señalesNegativas: string[] = [];
  let puntos = 0;

  if (lead.fechaConcreta) {
    puntos += PESOS.fechaConcreta;
    señalesPositivas.push(`indicó una fecha concreta (${formatDate(lead.fechaConcreta)})`);
  } else {
    señalesNegativas.push("sin fecha concreta");
  }

  if (lead.presupuesto) {
    puntos += PESOS.presupuesto;
    señalesPositivas.push(`mencionó un presupuesto (${formatCurrency(lead.presupuesto)})`);
  } else {
    señalesNegativas.push("sin presupuesto definido");
  }

  if (lead.cantidadPersonas) {
    puntos += PESOS.pasajeros;
    señalesPositivas.push(`confirmó cantidad de personas (${lead.cantidadPersonas})`);
  }

  if (lead.pidioMediosPago) {
    puntos += PESOS.pidioMediosPago;
    señalesPositivas.push("pidió medios de pago");
  }

  const dias = daysSince(lead.ultimaInteraccion);
  if (dias <= 2) {
    puntos += PESOS.interaccionReciente;
    señalesPositivas.push(dias === 0 ? "tuvo interacción hoy" : `tuvo interacción hace ${dias} día(s)`);
  } else if (dias > 10) {
    señalesNegativas.push(`sin interacción hace ${dias} días`);
  }

  if (lead.estado === "cotizando" || lead.estado === "negociacion") {
    puntos += PESOS.enProcesoAvanzado;
    señalesPositivas.push(`está en etapa avanzada (${lead.estado})`);
  } else if (lead.estado === "perdido") {
    señalesNegativas.push("marcado como perdido");
  }

  const nivel: LeadScoreNivel = puntos >= 7 ? "hot" : puntos >= 3 ? "warm" : "cold";

  const etiqueta = nivel === "hot" ? "Lead caliente" : nivel === "warm" ? "Lead tibio" : "Lead frío";
  const detalle =
    señalesPositivas.length > 0
      ? señalesPositivas.join(", ")
      : señalesNegativas.length > 0
      ? señalesNegativas.join(", ")
      : "todavía no hay señales comerciales cargadas";

  return {
    nivel,
    puntos,
    explicacion: `${etiqueta} porque ${detalle}.`,
    señales: [...señalesPositivas, ...señalesNegativas],
  };
}
