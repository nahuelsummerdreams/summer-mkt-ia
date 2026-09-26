import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-gray-300" />
      <p className="text-sm font-semibold text-navy">{title}</p>
      {description && <p className="max-w-sm text-sm text-gray-400">{description}</p>}
    </div>
  );
}
