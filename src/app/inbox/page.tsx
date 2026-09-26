import { MessageSquare } from "lucide-react";
import { PlaceholderModule } from "@/components/layout/PlaceholderModule";

export default function InboxPage() {
  return (
    <PlaceholderModule
      icon={MessageSquare}
      titulo="💬 Inbox IA"
      descripcion="Bandeja central de mensajes (web, Instagram, WhatsApp) con respuestas asistidas por IA y derivación a un humano cuando haga falta."
    />
  );
}
