import "server-only";
import { AI_PROVIDERS, isProviderConfigured, providersForTask } from "./providers";
import { generateTextAnthropic } from "./providers/anthropic";
import { generateTextOpenAI } from "./providers/openai";
import { generateTextGemini } from "./providers/gemini";
import { AiHubError, type AiGenerateRequest, type AiGenerateResult, type AiProviderId } from "./types";

// AUTO MODE (spec §27): elige el proveedor configurado que mejor se ajusta
// a la prioridad pedida (calidad / velocidad / costo). Si el usuario forzó
// un proveedor puntual, se respeta esa elección en vez de decidir por él.
function pickProvider(task: string, prioridad: string, forzado?: AiProviderId): AiProviderId {
  const candidatos = providersForTask(task).filter(isProviderConfigured);

  if (forzado) {
    const elegido = candidatos.find((p) => p.id === forzado);
    if (!elegido) {
      throw new AiHubError(
        `El proveedor "${forzado}" no está configurado o no soporta la tarea "${task}".`
      );
    }
    return elegido.id;
  }

  if (candidatos.length === 0) {
    const necesarias = AI_PROVIDERS.filter((p) => p.tasks.includes(task as never))
      .map((p) => p.envVar)
      .join(", ");
    throw new AiHubError(
      `No hay ningún proveedor de "${task}" configurado en el servidor. Configurá alguna de estas variables de entorno: ${necesarias || "(sin proveedores para esta tarea todavía)"}.`
    );
  }

  const campo = prioridad === "velocidad" ? "velocidad" : prioridad === "costo" ? "costo" : "calidad";
  const ordenado = [...candidatos].sort((a, b) => a[campo] - b[campo]);
  return ordenado[0].id;
}

async function callProvider(provider: AiProviderId, prompt: string): Promise<string> {
  if (provider === "anthropic") return generateTextAnthropic(prompt);
  if (provider === "openai") return generateTextOpenAI(prompt);
  return generateTextGemini(prompt);
}

export async function generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
  if (!req.prompt?.trim()) throw new AiHubError("El prompt no puede estar vacío.");
  const proveedor = pickProvider(req.task, req.prioridad ?? "calidad", req.proveedor);
  const texto = await callProvider(proveedor, req.prompt);
  return { proveedor, texto };
}
