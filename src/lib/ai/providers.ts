import "server-only";
import type { AiProviderMeta } from "./types";

// Catálogo de proveedores soportados. Hoy solo "texto" tiene adaptadores
// reales conectados (`providers/*.ts`); imagen/video/voz/visión quedan
// declarados para que el AI Model Hub muestre el roadmap del spec §27,
// pero sin un solo proveedor todavía — no se simula lo que no existe.
export const AI_PROVIDERS: AiProviderMeta[] = [
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    tasks: ["texto", "vision"],
    envVar: "ANTHROPIC_API_KEY",
    velocidad: 2,
    costo: 2,
    calidad: 1,
  },
  {
    id: "openai",
    label: "OpenAI (GPT)",
    tasks: ["texto", "vision"],
    envVar: "OPENAI_API_KEY",
    velocidad: 1,
    costo: 2,
    calidad: 2,
  },
  {
    id: "gemini",
    label: "Google Gemini",
    tasks: ["texto"],
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
    velocidad: 1,
    costo: 1,
    calidad: 3,
  },
];

export function isProviderConfigured(provider: AiProviderMeta): boolean {
  return Boolean(process.env[provider.envVar]?.trim());
}

export function providersForTask(task: string) {
  return AI_PROVIDERS.filter((p) => p.tasks.includes(task as AiProviderMeta["tasks"][number]));
}
