import "server-only";

// Envío real vía WhatsApp Business Platform (Cloud API de Meta).
// Requiere WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID configurados
// (ver lib/integrations.ts) — sin eso, isIntegrationConfigured("whatsapp")
// es false y esta función ni se llama desde las rutas.

export class WhatsAppError extends Error {}

export async function sendWhatsAppMessage(to: string, texto: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new WhatsAppError("WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID no están configurados en el servidor.");
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: texto },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new WhatsAppError(`WhatsApp Cloud API devolvió ${res.status}: ${detail.slice(0, 300)}`);
  }
}
