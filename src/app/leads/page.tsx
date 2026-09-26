"use client";

import { useMemo, useState } from "react";
import { Flame, ThermometerSun, Snowflake, Phone, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { leads as initialLeads, products } from "@/lib/mock-data";
import { scoreLead, type LeadScoreNivel } from "@/lib/lead-scoring";
import type { Lead, LeadStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate, whatsAppLink } from "@/lib/utils";

const NIVEL_META: Record<LeadScoreNivel, { label: string; icon: typeof Flame; className: string }> = {
  hot: { label: "Hot", icon: Flame, className: "bg-red-50 text-red-600" },
  warm: { label: "Warm", icon: ThermometerSun, className: "bg-amber-50 text-amber-700" },
  cold: { label: "Cold", icon: Snowflake, className: "bg-blue-50 text-blue-600" },
};

const ESTADOS: LeadStatus[] = [
  "nuevo",
  "contactado",
  "interesado",
  "cotizando",
  "negociacion",
  "reservado",
  "vendido",
  "perdido",
  "seguimiento",
];

const ESTADO_LABEL: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  interesado: "Interesado",
  cotizando: "Cotizando",
  negociacion: "Negociación",
  reservado: "Reservado",
  vendido: "Vendido",
  perdido: "Perdido",
  seguimiento: "Seguimiento",
};

const FILTROS: { id: LeadScoreNivel | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "hot", label: "🔥 Hot" },
  { id: "warm", label: "🟡 Warm" },
  { id: "cold", label: "🔵 Cold" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filtro, setFiltro] = useState<LeadScoreNivel | "todos">("todos");

  const conScore = useMemo(
    () => leads.map((lead) => ({ lead, score: scoreLead(lead) })).sort((a, b) => b.score.puntos - a.score.puntos),
    [leads]
  );

  const filtrados = filtro === "todos" ? conScore : conScore.filter((x) => x.score.nivel === filtro);

  const conteos = useMemo(() => {
    const c = { hot: 0, warm: 0, cold: 0 };
    conScore.forEach((x) => c[x.score.nivel]++);
    return c;
  }, [conScore]);

  const updateEstado = (id: string, estado: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado } : l)));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Leads</h1>
        <p className="mt-1 text-gray-500">
          Lead scoring explicado por señales comerciales reales — nunca un número sin justificación.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filtro === f.id
                ? "border-green bg-green text-white shadow-sm shadow-green/30"
                : "border-gray-200 bg-white text-gray-600 hover:border-green/40"
            )}
          >
            {f.label}
            {f.id !== "todos" && <span className="ml-1.5 opacity-70">({conteos[f.id]})</span>}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={Users} title="No hay leads en este filtro" />
      ) : (
        <div className="space-y-3">
          {filtrados.map(({ lead, score }) => {
            const meta = NIVEL_META[score.nivel];
            const producto = products.find((p) => p.id === lead.productoId);
            const mensaje = `Hola ${lead.nombre}! 👋 Te escribo de Summer Dreams por tu consulta${
              lead.destinoInteres ? ` sobre ${lead.destinoInteres}` : ""
            }.`;

            return (
              <Card key={lead.id}>
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-navy">
                        {lead.nombre} {lead.apellido}
                      </p>
                      <p className="text-sm text-gray-500">
                        {lead.destinoInteres ?? "Sin destino de interés"}
                        {producto ? ` · ${producto.nombre}` : ""}
                      </p>
                    </div>
                    <Badge className={meta.className}>
                      <meta.icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-500">{score.explicacion}</p>

                  <div className="flex flex-wrap gap-1.5 text-xs text-gray-500">
                    {lead.fechaViaje && <Badge>📅 {formatDate(lead.fechaViaje)}</Badge>}
                    {lead.presupuesto && <Badge>💰 {formatCurrency(lead.presupuesto)}</Badge>}
                    {lead.cantidadPasajeros && <Badge>👥 {lead.cantidadPasajeros} pasajero(s)</Badge>}
                    <Badge>📍 {lead.origen}</Badge>
                  </div>

                  {lead.proximaAccion && (
                    <p className="text-xs font-semibold text-navy">👉 Próxima acción: {lead.proximaAccion}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <select
                      value={lead.estado}
                      onChange={(e) => updateEstado(lead.id, e.target.value as LeadStatus)}
                      className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {ESTADO_LABEL[e]}
                        </option>
                      ))}
                    </select>
                    <Button href={whatsAppLink(lead.telefono, mensaje)} target="_blank" size="sm" variant="subtle">
                      <Phone className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
