import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function PlaceholderModule({
  icon,
  titulo,
  descripcion,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-navy">{titulo}</h1>
      <p className="mt-1 text-gray-500">{descripcion}</p>
      <div className="mt-6">
        <EmptyState icon={icon} title="Próximamente" description="Este módulo todavía no está construido en el MVP." />
      </div>
    </div>
  );
}
