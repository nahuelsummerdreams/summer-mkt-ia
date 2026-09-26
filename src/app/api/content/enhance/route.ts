import { NextResponse } from "next/server";
import { products } from "@/lib/mock-data";
import { generateContentPack, type ContentGenerationInput } from "@/lib/content-generator";
import { enhanceContentPackWithAI } from "@/lib/ai/content";
import { AiHubError } from "@/lib/ai/types";
import type { VocabularioNegocio } from "@/lib/types";

interface Body {
  productId: string;
  input: ContentGenerationInput;
  vocabulario: VocabularioNegocio;
  negocioNombre?: string;
  seed?: number;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido: se esperaba JSON." }, { status: 400 });
  }

  const product = products.find((p) => p.id === body.productId);
  if (!product) {
    return NextResponse.json({ error: `Producto "${body.productId}" no encontrado en el catálogo.` }, { status: 404 });
  }
  if (!body.input) {
    return NextResponse.json({ error: "Falta el campo input (objetivo/publico/tono/estilo/duracionReel)." }, { status: 400 });
  }
  if (!body.vocabulario) {
    return NextResponse.json({ error: "Falta el campo vocabulario del negocio configurado." }, { status: 400 });
  }

  const basePack = generateContentPack(product, body.vocabulario, body.input, body.seed ?? Date.now());

  try {
    const { pack, proveedor } = await enhanceContentPackWithAI(basePack, body.input, body.negocioNombre);
    return NextResponse.json({ pack, modo: "ia", proveedor });
  } catch (err) {
    const message = err instanceof AiHubError ? err.message : "Error inesperado mejorando el contenido con IA.";
    console.error("Content Studio — fallback a plantillas:", err);
    return NextResponse.json({ pack: basePack, modo: "plantilla", error: message });
  }
}
