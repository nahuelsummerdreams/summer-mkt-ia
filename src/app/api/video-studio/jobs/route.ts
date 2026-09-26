import { NextResponse } from "next/server";
import { requestGeneration, getJobs } from "@/lib/video-jobs";
import type { GenerationJobTipo } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proyectoId = searchParams.get("proyectoId") ?? undefined;
  return NextResponse.json({ jobs: getJobs(proyectoId) });
}

export async function POST(req: Request) {
  let body: { tipo?: GenerationJobTipo; proyectoId?: string; escenaId?: string; texto?: string; voiceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido: se esperaba JSON." }, { status: 400 });
  }

  if (!body.tipo || !body.proyectoId) {
    return NextResponse.json({ error: "Faltan campos requeridos: tipo, proyectoId." }, { status: 400 });
  }

  const job = await requestGeneration(body.tipo, body.proyectoId, body.escenaId, {
    texto: body.texto,
    voiceId: body.voiceId,
  });
  return NextResponse.json({ job });
}
