import Link from "next/link";
import { Sparkles, Rocket, Package, Users, BarChart3, Brain } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { products, leads } from "@/lib/mock-data";
import { scoreLead } from "@/lib/lead-scoring";

const ACCIONES = [
  { href: "/content-studio", label: "Crear contenido", icon: Sparkles, desc: "Hooks, Reels, Stories y carruseles a partir de un producto real" },
  { href: "/campanas", label: "Crear campaña", icon: Rocket, desc: "Objetivo, fecha límite y presupuesto → estrategia, KPIs y calendario" },
  { href: "/productos", label: "Ver productos", icon: Package, desc: "Catálogo turístico — fuente de verdad de la IA" },
  { href: "/leads", label: "Gestionar leads", icon: Users, desc: "CRM con lead scoring HOT/WARM/COLD explicado" },
  { href: "/analytics", label: "Analizar resultados", icon: BarChart3, desc: "Comercial, negocio, marketing y contenido en un solo lugar" },
  { href: "/summer-brain", label: "Ver resumen de hoy", icon: Brain, desc: "Leads prioritarios, alertas y qué producto impulsar" },
];

export default function DashboardPage() {
  const activos = products.filter((p) => p.estado === "activo").length;
  const hots = leads.filter((l) => scoreLead(l).nivel === "hot").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">SUMMER AI</h1>
        <p className="mt-1 text-gray-500">
          Buenos días 👋 — {activos} producto(s) activo(s) · {hots} lead(s) 🔥 caliente(s) ahora mismo.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-navy">¿Qué querés hacer?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACCIONES.map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <a.icon className="h-6 w-6 text-green" />
                  <p className="mt-3 font-semibold text-navy">{a.label}</p>
                  <p className="mt-1 text-xs text-gray-400">{a.desc}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
