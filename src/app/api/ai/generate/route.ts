import { NextResponse } from "next/server";
import { generate } from "@/lib/ai/router";
import { AiHubError, type AiGenerateRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  let body: AiGenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido: se esperaba JSON." }, { status: 400 });
  }

  if (!body?.task || !body?.prompt) {
    return NextResponse.json({ error: "Faltan campos requeridos: task, prompt." }, { status: 400 });
  }

  try {
    const result = await generate(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof AiHubError ? err.message : "Error inesperado generando contenido.";
    console.error("AI Model Hub — error de generación:", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
