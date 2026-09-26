import { NextResponse } from "next/server";
import { AI_PROVIDERS, isProviderConfigured } from "@/lib/ai/providers";

// Expone únicamente si cada proveedor está configurado (booleano) — nunca
// el valor de la key. Lo consume el AI Model Hub para mostrar estados.
export async function GET() {
  const proveedores = AI_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    tasks: p.tasks,
    envVar: p.envVar,
    configurado: isProviderConfigured(p),
  }));
  return NextResponse.json({ proveedores });
}
