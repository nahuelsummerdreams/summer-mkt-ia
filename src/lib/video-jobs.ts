import "server-only";
import type { GenerationJob, GenerationJobTipo } from "./types";
import { anyMediaProviderConfigured, type MediaCapacidad } from "./ai/media-providers";
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

// Encola un job y, como todavía no hay ningún proveedor real conectado
// para video/voz/avatar, lo resuelve inmediatamente a "failed" con el
// motivo exacto (qué env var falta) en vez de simular un resultado. El día
// que se conecte un proveedor real, este es el único lugar que cambia:
// en vez de marcar failed acá, se dispara la llamada real y el job queda
// en "processing" hasta que el proveedor confirme.
export function requestGeneration(tipo: GenerationJobTipo, proyectoId: string, escenaId?: string): GenerationJob {
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
  }
  // else: acá iría la llamada real al proveedor configurado (job.estado = "processing").

  return job;
}
