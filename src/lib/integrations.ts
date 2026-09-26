import "server-only";
import type { PostPlataforma } from "./types";

// Documentación + chequeo de integraciones externas de publicación
// (spec §12/§13, y la advertencia final del spec: "antes de implementar
// integraciones externas que requieran API keys, mostrar claramente qué
// credenciales son necesarias y dónde deben configurarse").
//
// A diferencia del AI Model Hub (una key alcanza para probar), Meta e
// Graph API y TikTok for Developers exigen registrar una app, pasar
// revisión y completar un flujo OAuth de una cuenta business real — no es
// algo que se resuelva pegando una key acá. Por eso esta capa no intenta
// publicar nada: solo informa qué falta y dónde se configura.

export interface IntegrationMeta {
  plataforma: PostPlataforma;
  label: string;
  envVars: string[];
  comoConfigurar: string;
}

export const INTEGRATIONS: IntegrationMeta[] = [
  {
    plataforma: "instagram",
    label: "Instagram (Meta Graph API)",
    envVars: ["META_APP_ID", "META_APP_SECRET", "INSTAGRAM_BUSINESS_ACCOUNT_ID", "INSTAGRAM_ACCESS_TOKEN"],
    comoConfigurar:
      "Registrar una app en developers.facebook.com, vincular una cuenta de Instagram business, pasar la revisión de permisos de contenido y generar un access token de larga duración. No alcanza con pegar una key: requiere el flujo OAuth completo de Meta.",
  },
  {
    plataforma: "tiktok",
    label: "TikTok (TikTok for Developers)",
    envVars: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET", "TIKTOK_ACCESS_TOKEN"],
    comoConfigurar:
      "Registrar una app en developers.tiktok.com, solicitar acceso a la Content Posting API (requiere aprobación de TikTok) y completar el flujo OAuth de una cuenta business.",
  },
];

export function isIntegrationConfigured(plataforma: PostPlataforma): boolean {
  const meta = INTEGRATIONS.find((i) => i.plataforma === plataforma);
  if (!meta) return false;
  return meta.envVars.every((v) => Boolean(process.env[v]?.trim()));
}
