import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/ai/router";
import { AiHubError } from "@/lib/ai/types";

// Prompt fijo del lado servidor: le pedimos SOLO etiquetas del catálogo del
// spec §26 (destino, hotel, personas, playa, nieve, amigos, familia,
// aeropuerto, excursión) + una descripción corta. La IA de visión describe
// lo que ve en la imagen — nunca inventa datos del catálogo turístico
// (precio, disponibilidad); eso sigue viniendo siempre de Productos.
const PROMPT_ETIQUETADO = `Analizá esta imagen de una agencia de viajes y devolvé SOLO un JSON (sin texto alrededor, sin markdown) con esta forma exacta:
{
  "etiquetas": [hasta 6 strings de esta lista cerrada, solo las que apliquen: "destino", "hotel", "playa", "nieve", "amigos", "familia", "aeropuerto", "excursion", "pareja", "grupo", "noche", "comida"],
  "descripcion": "una frase corta describiendo la escena, sin inventar el nombre del lugar si no es reconocible"
}`;

export async function POST(req: Request) {
  let body: { base64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido: se esperaba JSON." }, { status: 400 });
  }

  if (!body.base64 || !body.mimeType) {
    return NextResponse.json({ error: "Faltan campos requeridos: base64, mimeType." }, { status: 400 });
  }

  try {
    const { proveedor, texto } = await analyzeImage({
      base64: body.base64,
      mimeType: body.mimeType,
      prompt: PROMPT_ETIQUETADO,
    });

    let parsed: { etiquetas?: string[]; descripcion?: string };
    try {
      const trimmed = texto.trim();
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      parsed = JSON.parse(start !== -1 && end !== -1 ? trimmed.slice(start, end + 1) : trimmed);
    } catch {
      return NextResponse.json({ error: "La IA de visión no devolvió un JSON reconocible." }, { status: 502 });
    }

    return NextResponse.json({
      proveedor,
      etiquetas: Array.isArray(parsed.etiquetas) ? parsed.etiquetas : [],
      descripcion: parsed.descripcion ?? "",
    });
  } catch (err) {
    const message = err instanceof AiHubError ? err.message : "Error inesperado analizando la imagen.";
    console.error("AI Model Hub — error de visión:", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
