import "server-only";
import type { GenerationJob, GenerationJobTipo } from "./types";
import { anyMediaProviderConfigured, type MediaCapacidad } from "./ai/media-providers";
import { generateSpeechElevenLabs, ElevenLabsError } from "./ai/providers/elevenlabs";
import { uid } from "./utils";

// Buffer de jobs en memoria del proceso — mismo patrón y misma advertencia
// que whatsapp-inbox.ts: sirve para `next dev` / un servidor long-running;
// en producción serverless esto necesita una tabla real (GenerationJobs
// en Supabase, como ya prevé el spec).

const JOBS: GenerationJob[] = [];

const CAPACIDAD_POR_TIPO: Record<GenerationJobTipo, MediaCapacidad> = {
  "escena-video": "video",
  voz: "voz",
  "avatar-lipsync": "avatar-lipsync",
};

export function getJobs(proyectoId?: string): GenerationJob[] {
  return proyectoId ? JOBS.filter((j) => j.proyectoId === proyectoId) : JOBS;
}

export function getJob(id: string): GenerationJob | undefined {
  return JOBS.find((j) => j.id === id);
}

export interface RequestGenerationOpts {
  texto?: string; // requerido para tipo "voz" — el diálogo de la escena a sintetizar
  voiceId?: string;
}

// Encola un job. Para "voz" ya hay un proveedor real conectado
// (ElevenLabs) cuando está configurada la key: la llamada se hace de
// verdad y el resultado queda en `resultUrl` como data URL de audio. Para
// "escena-video" y "avatar-lipsync" todavía no hay ningún proveedor
// implementado, así que se resuelven a "failed" con el motivo exacto en
// vez de simular un resultado.
export async function requestGeneration(
  tipo: GenerationJobTipo,
  proyectoId: string,
  escenaId?: string,
  opts: RequestGenerationOpts = {}
): Promise<GenerationJob> {
  const now = new Date().toISOString();
  const job: GenerationJob = {
    id: uid("job"),
    tipo,
    proyectoId,
    escenaId,
    estado: "queued",
    progreso: 0,
    createdAt: now,
    updatedAt: now,
  };
  JOBS.unshift(job);

  const capacidad = CAPACIDAD_POR_TIPO[tipo];
  if (!anyMediaProviderConfigured(capacidad)) {
    job.estado = "failed";
    job.error = `No hay ningún proveedor de "${capacidad}" configurado. Revisá AI Model Hub → Video/Voz/Avatar para ver qué credenciales hacen falta.`;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  if (tipo === "voz") {
    job.estado = "processing";
    try {
      const { audioBase64, mimeType } = await generateSpeechElevenLabs(opts.texto ?? "", opts.voiceId);
      job.estado = "completed";
      job.progreso = 100;
      job.resultUrl = `data:${mimeType};base64,${audioBase64}`;
    } catch (err) {
      job.estado = "failed";
      job.error = err instanceof ElevenLabsError ? err.message : "Error inesperado generando la voz.";
      console.error("Error generando voz con ElevenLabs:", err);
    }
    job.updatedAt = new Date().toISOString();
    return job;
  }

  // "escena-video" / "avatar-lipsync": sin adaptador implementado todavía
  // aunque hipotéticamente hubiera una key (no debería llegar acá porque
  // anyMediaProviderConfigured ya filtra, pero por las dudas).
  job.estado = "failed";
  job.error = `Todavía no hay un adaptador implementado para "${capacidad}".`;
  job.updatedAt = new Date().toISOString();
  return job;
}
