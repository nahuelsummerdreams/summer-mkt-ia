import "server-only";
import { generate } from "./router";
import { AiHubError } from "./types";
import type { ContentGenerationInput, GeneratedContentPack } from "../content-generator";

// Puente entre Content Studio y el AI Model Hub.
// Regla no negociable (igual que el motor de plantillas en
// content-generator.ts): el prompt le entrega a la IA los datos reales ya
// resueltos (precio, fechas, hotel, excursiones) y le prohíbe inventar
// otros — su único trabajo es el copy creativo. Si la IA falla o devuelve
// algo con una forma inesperada, se hace merge parcial sobre el pack de
// plantillas en vez de romper la generación.

interface AiContentJson {
  hooks?: string[];
  captionInstagram?: string;
  captionTiktok?: string;
  captionWhatsapp?: string;
  cta?: string;
  storyTexts?: string[];
  reelSceneTexts?: string[];
  carruselTitles?: string[];
}

function buildPrompt(pack: GeneratedContentPack, input: ContentGenerationInput): string {
  const p = pack.producto;
  return `Sos el copywriter de Summer Dreams Viajes, una agencia de turismo argentina, trabajando dentro de SUMMER AI.

Regla no negociable: SUMMER AI nunca inventa datos de viajes. Todos los datos reales del producto ya están decididos abajo — tu único trabajo es escribir el copy creativo (hooks, captions, guion, CTA) usando EXACTAMENTE esos datos, sin agregar precios, fechas, hoteles, vuelos ni disponibilidad que no aparezcan en esta lista.

DATOS REALES DEL PRODUCTO (no los cambies ni agregues otros):
- Nombre: ${p.nombre}
- Destino: ${p.destino}
- Fechas: ${p.fechas === "—" ? "no cargadas" : p.fechas}
- Duración: ${p.dias} días / ${p.noches} noches
- Precio: ${p.precio}
- Incluye vuelos: ${p.incluyeAereos ? "sí" : "no"}
- Hotel: ${p.hotelNombre ?? "no cargado"}
- Excursiones incluidas: ${p.excursiones.length > 0 ? p.excursiones.join(", ") : "ninguna cargada"}

PARÁMETROS DE LA PIEZA:
- Objetivo: ${input.objetivo}
- Público: ${input.publico}
- Tono: ${input.tono}
- Estilo: ${input.estilo}

Devolvé SOLO un JSON válido (sin texto alrededor, sin markdown, sin explicación) con esta forma exacta:
{
  "hooks": [4 strings, variantes de hook],
  "captionInstagram": "string",
  "captionTiktok": "string",
  "captionWhatsapp": "string",
  "cta": "string",
  "storyTexts": [${pack.stories.length} strings, uno por cada Story en este orden: ${pack.stories.map((s) => s.tipo).join(", ")}],
  "reelSceneTexts": [${pack.reel.escenas.length} strings, uno por cada escena del Reel en orden],
  "carruselTitles": [${pack.carrusel.length} strings, uno por cada slide del carrusel en orden]
}`;
}

function parseAiJson(raw: string): AiContentJson {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new AiHubError("La IA no devolvió un JSON reconocible.");
    }
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      throw new AiHubError("La IA devolvió un JSON inválido.");
    }
  }
}

function mergePack(pack: GeneratedContentPack, ai: AiContentJson): GeneratedContentPack {
  const hooks =
    Array.isArray(ai.hooks) && ai.hooks.length > 0
      ? pack.hooks.map((original, i) => ai.hooks?.[i] || original)
      : pack.hooks;

  const stories = pack.stories.map((s, i) => ({ ...s, texto: ai.storyTexts?.[i] || s.texto }));
  const escenas = pack.reel.escenas.map((e, i) => ({ ...e, texto: ai.reelSceneTexts?.[i] || e.texto }));
  const carrusel = pack.carrusel.map((c, i) => ({ ...c, titulo: ai.carruselTitles?.[i] || c.titulo }));

  return {
    ...pack,
    hooks,
    reel: { ...pack.reel, escenas, vozOff: escenas.map((e) => e.texto).join(" · ") },
    captions: {
      instagram: ai.captionInstagram || pack.captions.instagram,
      tiktok: ai.captionTiktok || pack.captions.tiktok,
      whatsapp: ai.captionWhatsapp || pack.captions.whatsapp,
    },
    cta: ai.cta || pack.cta,
    stories,
    carrusel,
  };
}

export async function enhanceContentPackWithAI(
  pack: GeneratedContentPack,
  input: ContentGenerationInput
): Promise<{ pack: GeneratedContentPack; proveedor: string }> {
  const prompt = buildPrompt(pack, input);
  const { proveedor, texto } = await generate({ task: "texto", prompt, prioridad: "calidad" });
  const ai = parseAiJson(texto);
  return { pack: mergePack(pack, ai), proveedor };
}
