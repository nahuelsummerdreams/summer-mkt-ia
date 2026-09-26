import { NextResponse } from "next/server";
import { getMessages } from "@/lib/whatsapp-inbox";
import { isIntegrationConfigured } from "@/lib/integrations";

export async function GET() {
  return NextResponse.json({
    mensajes: getMessages(),
    configurado: isIntegrationConfigured("whatsapp"),
  });
}
