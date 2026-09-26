import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, moneda: "ARS" | "USD" = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateRange(fechaSalida: string, fechaRegreso: string) {
  const start = new Date(fechaSalida + "T00:00:00");
  const end = new Date(fechaRegreso + "T00:00:00");
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return "—";
  const startDay = start.getDate().toString().padStart(2, "0");
  const endDay = end.getDate().toString().padStart(2, "0");
  const month = new Intl.DateTimeFormat("es-AR", { month: "short" })
    .format(end)
    .replace(".", "")
    .toUpperCase();
  const year = end.getFullYear();
  return `${startDay} — ${endDay} ${month} ${year}`;
}
