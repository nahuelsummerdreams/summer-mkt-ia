import { NextResponse } from "next/server";
import { MEDIA_PROVIDERS, isMediaProviderConfigured } from "@/lib/ai/media-providers";

export async function GET() {
  const proveedores = MEDIA_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    capacidad: p.capacidad,
    envVars: p.envVars,
    comoConfigurar: p.comoConfigurar,
    configurado: isMediaProviderConfigured(p),
  }));
  return NextResponse.json({ proveedores });
}
