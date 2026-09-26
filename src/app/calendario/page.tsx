import { CalendarDays } from "lucide-react";
import { PlaceholderModule } from "@/components/layout/PlaceholderModule";

export default function CalendarioPage() {
  return (
    <PlaceholderModule
      icon={CalendarDays}
      titulo="📅 Calendario de contenidos"
      descripcion="Calendario mensual/semanal generado por IA, con publicaciones que se pueden arrastrar y mover."
    />
  );
}
