import "server-only";

// AI Model Hub — contrato común entre proveedores.
// Regla no negociable (spec §27): las claves de API viven únicamente acá
// (server-side). Ningún archivo bajo `src/lib/ai/` puede importarse desde
// un componente cliente — el `import "server-only"` rompe el build si eso
// pasa por error.

export type AiTaskType = "texto" | "imagen" | "video" | "voz" | "vision";

export type AiProviderId = "anthropic" | "openai" | "gemini";

export type AiPrioridad = "calidad" | "velocidad" | "costo";

export interface AiProviderMeta {
  id: AiProviderId;
  label: string;
  tasks: AiTaskType[];
  envVar: string;
  velocidad: 1 | 2 | 3; // 1 = más rápido
  costo: 1 | 2 | 3; // 1 = más barato
  calidad: 1 | 2 | 3; // 1 = mayor calidad
}

export interface AiGenerateRequest {
  task: AiTaskType;
  prompt: string;
  prioridad?: AiPrioridad;
  proveedor?: AiProviderId; // fuerza un proveedor puntual, salta AUTO MODE
}

export interface AiGenerateResult {
  proveedor: AiProviderId;
  texto: string;
}

export class AiHubError extends Error {}
