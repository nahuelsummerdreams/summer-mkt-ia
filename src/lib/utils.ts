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

export function daysUntil(iso: string) {
  const target = new Date(iso + "T00:00:00").getTime();
  if (!Number.isFinite(target)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function whatsAppLink(phone: string | undefined, message: string) {
  const base = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
