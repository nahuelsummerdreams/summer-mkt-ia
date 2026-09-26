import type { Product, Scene, TipoContenidoVideo } from "./types";
import { formatCurrency, formatDateRange, uid } from "./utils";

// Guion + división en escenas (spec §6/§7/§12/§18).
// Regla no negociable: cuando el usuario pega su propio guion y activa
// "Respetar mi guion", el texto hablado (dialogo) nunca se reescribe —
// solo se lo divide en escenas y se le agrega dirección audiovisual
// alrededor. Cuando la IA genera el guion (Modo A), los datos concretos
// (precio, fechas, hotel) salen del producto real, igual que en
// content-generator.ts — nunca se inventan.

const BROLL_KEYWORDS: { match: RegExp; broll: string }[] = [
  { match: /hotel|habitaci[oó]n|alojamiento/i, broll: "Hotel / habitación / desayuno" },
  { match: /playa/i, broll: "Playa y mar" },
  { match: /avi[oó]n|aeropuerto|vuelo/i, broll: "Aeropuerto / avión" },
  { match: /excursi[oó]n|paseo|tour/i, broll: "Excursión / actividad" },
  { match: /comida|gastronom|restaurante/i, broll: "Comida / gastronomía local" },
  { match: /ciudad|centro/i, broll: "Calles y vida de la ciudad" },
  { match: /precio|oferta|descuento|cuotas/i, broll: "Precio en pantalla" },
];

function detectBRoll(texto: string): string | undefined {
  return BROLL_KEYWORDS.find((k) => k.match.test(texto))?.broll;
}

function baseScene(numero: number, dialogo: string, duracionSegundos: number): Scene {
  return {
    id: uid("scene"),
    numero,
    duracionSegundos,
    dialogo,
    accion: "",
    ubicacion: "",
    tipoPlano: "",
    movimientoCamara: "",
    iluminacion: "Luz natural",
    ambiente: "",
    broll: detectBRoll(dialogo),
    estado: "borrador",
  };
}

// Modo B: el usuario pegó su propio guion. Lo dividimos en escenas sin
// tocar una palabra del texto — "ANALIZAR GUION" del spec §7.
export function splitScriptIntoScenes(texto: string, duracionObjetivo: number): Scene[] {
  const bloques = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const unidades =
    bloques.length > 1
      ? bloques
      : texto
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce<string[]>((acc, frase, i) => {
            if (i % 2 === 0) acc.push(frase);
            else acc[acc.length - 1] += " " + frase;
            return acc;
          }, []);

  const finales = unidades.length > 0 ? unidades.slice(0, 10) : [texto];
  const duracionPorEscena = Math.max(3, Math.round(duracionObjetivo / finales.length));

  return finales.map((dialogo, i) => {
    const scene = baseScene(i + 1, dialogo, duracionPorEscena);
    if (i === 0) {
      scene.accion = "Mira a cámara y capta la atención desde el primer segundo";
      scene.tipoPlano = "Medio close-up";
      scene.movimientoCamara = "Handheld natural";
    } else if (i === finales.length - 1) {
      scene.accion = "Mira a cámara, sonríe y señala el CTA en pantalla";
      scene.tipoPlano = "Medio close-up";
      scene.movimientoCamara = "Estático";
    } else {
      scene.accion = "Habla con naturalidad, gesticula acorde al contenido";
      scene.tipoPlano = "Plano medio";
      scene.movimientoCamara = "Steady, leve movimiento";
    }
    return scene;
  });
}

export interface ScriptTemplateInput {
  producto?: Product;
  mensaje: string;
  tipoContenido: TipoContenidoVideo;
  estilo: string;
  duracionObjetivo: number;
}

// Modo A: la IA (por ahora, motor de reglas — igual que Content Studio
// antes de "Mejorar con IA") arma la estructura Hook/Desarrollo/
// Beneficios/Oferta/CTA del spec §6, usando datos reales del producto si
// hay uno seleccionado.
export function generateScriptTemplate(input: ScriptTemplateInput): Scene[] {
  const { producto, mensaje, duracionObjetivo } = input;
  const n = 5;
  const duracionPorEscena = Math.max(3, Math.round(duracionObjetivo / n));

  const datos = producto
    ? {
        destino: producto.destino,
        precio: formatCurrency(producto.precioVenta, producto.moneda),
        fechas: formatDateRange(producto.fechaSalida, producto.fechaRegreso),
        hotel: producto.hotelNombre,
      }
    : null;

  const bloques: { dialogo: string; accion: string; plano: string; camara: string }[] = [
    {
      dialogo: datos
        ? `¿Todavía no sabés dónde viajar${datos.destino ? ` a ${datos.destino}` : ""}?`
        : `¿Todavía no decidiste tu próximo viaje?`,
      accion: "Mira a cámara, expresión de intriga, capta atención",
      plano: "Medio close-up",
      camara: "Handheld natural",
    },
    {
      dialogo: mensaje,
      accion: "Presenta el producto con entusiasmo, gesticula",
      plano: "Plano medio",
      camara: "Steady",
    },
    {
      dialogo: datos
        ? `Incluye ${datos.hotel ? `hotel en ${datos.hotel}` : "alojamiento"}${datos.fechas !== "—" ? `, saliendo ${datos.fechas}` : ""}.`
        : "Te contamos todo lo que incluye este viaje.",
      accion: "Señala hacia elementos en pantalla (b-roll)",
      plano: "Plano medio",
      camara: "Leve movimiento",
    },
    {
      dialogo: datos ? `Todo esto desde ${datos.precio}.` : "Con un precio pensado para vos.",
      accion: "Muestra el precio con la mano, sonríe",
      plano: "Medio close-up",
      camara: "Estático",
    },
    {
      dialogo: "Escribinos y te armamos tu propuesta. ¡Te esperamos!",
      accion: "Mira a cámara, señala el CTA en pantalla",
      plano: "Medio close-up",
      camara: "Estático",
    },
  ];

  return bloques.map((b, i) => {
    const scene = baseScene(i + 1, b.dialogo, duracionPorEscena);
    scene.accion = b.accion;
    scene.tipoPlano = b.plano;
    scene.movimientoCamara = b.camara;
    scene.ubicacion = datos?.destino ?? "";
    return scene;
  });
}
