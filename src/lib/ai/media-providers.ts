import "server-only";

// AI Provider Layer para medios generativos (Video / Voz / Avatar-LipSync).
// Es la contraparte de providers.ts (texto/visión) para capacidades que
// son intrínsecamente asíncronas (generar un video tarda minutos, no
// segundos) y cuyo contrato de request/response varía mucho entre
// proveedores reales (Runway, Kling, Pika para video; ElevenLabs para voz;
// HeyGen/Synthesia-style para avatar+lip-sync).
//
// A propósito NO se implementa un adaptador contra un proveedor
// específico todavía: fabricar una llamada a una API que no tenemos
// contratada (y cuyo contrato exacto puede cambiar) sería peor que no
// tener nada — el usuario merece un "necesitás conectar X" claro, no una
// implementación adivinada. Cuando se elija un proveedor concreto, el
// adaptador va en providers/<proveedor>.ts siguiendo el mismo patrón que
// anthropic.ts/openai.ts, y video-jobs.ts deja de tirar AiHubError acá.

export type MediaCapacidad = "video" | "voz" | "avatar-lipsync";

export interface MediaProviderMeta {
  id: string;
  label: string;
  capacidad: MediaCapacidad;
  envVars: string[];
  comoConfigurar: string;
}

export const MEDIA_PROVIDERS: MediaProviderMeta[] = [
  {
    id: "runway",
    label: "Runway (Gen-3/Gen-4, image-to-video)",
    capacidad: "video",
    envVars: ["RUNWAY_API_KEY"],
    comoConfigurar: "Crear cuenta y API key en runwayml.com/api. Cobra por segundo de video generado.",
  },
  {
    id: "kling",
    label: "Kling AI (text-to-video / image-to-video)",
    capacidad: "video",
    envVars: ["KLING_API_KEY", "KLING_API_SECRET"],
    comoConfigurar: "Solicitar acceso a la API en klingai.com — actualmente por invitación/lista de espera.",
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs (text-to-speech / voice cloning)",
    capacidad: "voz",
    envVars: ["ELEVENLABS_API_KEY"],
    comoConfigurar:
      "Crear cuenta en elevenlabs.io, generar una API key. El voice cloning autorizado requiere subir una muestra de voz con consentimiento.",
  },
  {
    id: "heygen",
    label: "HeyGen (talking avatar + lip-sync)",
    capacidad: "avatar-lipsync",
    envVars: ["HEYGEN_API_KEY"],
    comoConfigurar: "Crear cuenta business en heygen.com y generar una API key desde el panel de developers.",
  },
];

export function isMediaProviderConfigured(provider: MediaProviderMeta): boolean {
  return provider.envVars.every((v) => Boolean(process.env[v]?.trim()));
}

export function mediaProvidersForCapacidad(capacidad: MediaCapacidad) {
  return MEDIA_PROVIDERS.filter((p) => p.capacidad === capacidad);
}

export function anyMediaProviderConfigured(capacidad: MediaCapacidad): boolean {
  return mediaProvidersForCapacidad(capacidad).some(isMediaProviderConfigured);
}
