import { NextResponse } from "next/server";
import { sendWhatsAppMessage, WhatsAppError } from "@/lib/whatsapp";
import { addMessage } from "@/lib/whatsapp-inbox";
import { isIntegrationConfigured } from "@/lib/integrations";
import { uid } from "@/lib/utils";

export async function POST(req: Request) {
  let body: { to?: string; texto?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido: se esperaba JSON." }, { status: 400 });
  }

  if (!body.to || !body.texto) {
    return NextResponse.json({ error: "Faltan campos requeridos: to, texto." }, { status: 400 });
  }

  if (!isIntegrationConfigured("whatsapp")) {
    return NextResponse.json(
      {
        error:
          "WhatsApp todavía no está conectado (faltan WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID). El mensaje no se envió.",
      },
      { status: 400 }
    );
  }

  try {
    await sendWhatsAppMessage(body.to, body.texto);
    addMessage({
      id: uid("wa"),
      telefono: body.to,
      texto: body.texto,
      direccion: "saliente",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof WhatsAppError ? err.message : "Error inesperado enviando el mensaje.";
    console.error("Error enviando WhatsApp:", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
