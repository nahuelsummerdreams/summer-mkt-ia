import "server-only";

// Adaptador real de ElevenLabs (text-to-speech). Contrato estable y bien
// documentado — a diferencia de Runway/Kling (video), que quedaron sin
// implementar porque adivinar su contrato exacto sería arriesgado, acá sí
// vale la pena implementarlo de verdad.
// Docs: https://elevenlabs.io/docs/api-reference/text-to-speech

export class ElevenLabsError extends Error {}

// Voz premade de ElevenLabs ("Rachel") — sirve de default hasta que el
// usuario cargue su propia voz clonada (con consentimiento) o elija otra
// del catálogo de su cuenta.
export const ELEVENLABS_VOZ_DEFAULT = "21m00Tcm4TlvDq8ikWAM";

export async function generateSpeechElevenLabs(
  texto: string,
  voiceId: string = ELEVENLABS_VOZ_DEFAULT
): Promise<{ audioBase64: string; mimeType: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new ElevenLabsError("ELEVENLABS_API_KEY no está configurada en el servidor.");
  if (!texto?.trim()) throw new ElevenLabsError("El texto a convertir en voz no puede estar vacío.");

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "audio/mpeg",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: texto,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ElevenLabsError(`ElevenLabs devolvió ${res.status}: ${detail.slice(0, 300)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return { audioBase64: buffer.toString("base64"), mimeType: "audio/mpeg" };
}
