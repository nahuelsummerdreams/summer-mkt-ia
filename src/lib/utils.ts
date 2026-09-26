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

export function formatDate(iso: string | undefined | null) {
  if (!iso) return "—";
  const date = new Date(iso + "T00:00:00");
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

export function daysSince(iso: string) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return Infinity;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export function whatsAppLink(phone: string | undefined, message: string) {
  const base = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
