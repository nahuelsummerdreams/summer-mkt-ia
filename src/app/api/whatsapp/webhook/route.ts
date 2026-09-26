import { NextResponse } from "next/server";
import { addMessage } from "@/lib/whatsapp-inbox";
import { uid } from "@/lib/utils";

// Webhook real de WhatsApp Cloud API (Meta). Esta URL es la que se pega en
// developers.facebook.com → WhatsApp → Configuration → Webhook, junto con
// el mismo valor que tengas en WHATSAPP_VERIFY_TOKEN.

// GET: handshake de verificación que hace Meta al guardar el webhook.
// https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && verifyToken && token === verifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Verificación fallida", { status: 403 });
}

// POST: notificación real de un mensaje entrante.
// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const entries = (body as { entry?: unknown[] })?.entry ?? [];
    for (const entry of entries as Record<string, unknown>[]) {
      const changes = (entry?.changes as Record<string, unknown>[]) ?? [];
      for (const change of changes) {
        const value = change?.value as Record<string, unknown>;
        const contactos = (value?.contacts as { profile?: { name?: string }; wa_id?: string }[]) ?? [];
        const mensajes = (value?.messages as { from?: string; id?: string; timestamp?: string; text?: { body?: string } }[]) ?? [];
        for (const msg of mensajes) {
          if (!msg.from || !msg.text?.body) continue;
          addMessage({
            id: msg.id ?? uid("wa"),
            telefono: msg.from,
            nombre: contactos.find((c) => c.wa_id === msg.from)?.profile?.name,
            texto: msg.text.body,
            direccion: "entrante",
            timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString(),
          });
        }
      }
    }
  } catch (err) {
    console.error("Error procesando webhook de WhatsApp:", err);
  }

  // Meta espera un 200 rápido para no reintentar la entrega.
  return NextResponse.json({ success: true });
}
