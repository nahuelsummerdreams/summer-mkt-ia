import { NextResponse } from "next/server";
import { INTEGRATIONS, isIntegrationConfigured } from "@/lib/integrations";

export async function GET() {
  const integraciones = INTEGRATIONS.map((i) => ({
    plataforma: i.plataforma,
    label: i.label,
    envVars: i.envVars,
    comoConfigurar: i.comoConfigurar,
    configurado: isIntegrationConfigured(i.plataforma),
  }));
  return NextResponse.json({ integraciones });
}
