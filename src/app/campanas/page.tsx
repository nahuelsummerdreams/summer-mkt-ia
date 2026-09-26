"use client";

import { useState } from "react";
import { Rocket, TriangleAlert, Target } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import { useBusiness } from "@/lib/business-store";
import { generateCampaignPlan, type CampaignPlan } from "@/lib/campaign-builder";
import { formatCurrency, formatDate } from "@/lib/utils";

function defaultFechaLimite() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

export default function CampanasPage() {
  const { business } = useBusiness();
  const disponibles = products.filter((p) => p.estado === "activo");
  const [productId, setProductId] = useState(disponibles[0]?.id ?? "");
  const [objetivoTexto, setObjetivoTexto] = useState(`Vender 20 ${business.vocabulario.itemPlural}`);
  const [fechaLimite, setFechaLimite] = useState(defaultFechaLimite());
  const [presupuesto, setPresupuesto] = useState(300000);
  const [plan, setPlan] = useState<CampaignPlan | null>(null);

  const producto = disponibles.find((p) => p.id === productId) ?? disponibles[0];

  const handleCrear = () => {
    if (!producto) return;
    setPlan(generateCampaignPlan({ producto, vocabulario: business.vocabulario, objetivoTexto, fechaLimite, presupuesto }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <Rocket className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Campañas</h1>
          <p className="mt-1 text-gray-500">
            Objetivo, producto, fecha límite y presupuesto → estrategia, KPIs estimados y calendario de campaña.
          </p>
        </div>
      </div>

      {disponibles.length === 0 ? (
        <EmptyState icon={Rocket} title="No hay productos activos para armar una campaña" />
      ) : (
        <>
          <Card>
            <CardBody className="space-y-4">
              <Select
                label="Producto"
                value={productId || producto?.id || ""}
                onChange={setProductId}
                options={disponibles.map((p) => ({ value: p.id, label: p.nombre }))}
              />
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Objetivo (ej. &ldquo;Vender 20 {business.vocabulario.itemPlural}&rdquo;)
                <input
                  value={objetivoTexto}
                  onChange={(e) => setObjetivoTexto(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                  Fecha límite
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                  Presupuesto (ARS)
                  <input
                    type="number"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(Number(e.target.value))}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                  />
                </label>
              </div>
              <Button onClick={handleCrear} size="lg" className="w-full sm:w-auto">
                <Rocket className="h-4 w-4" />
                Crear campaña
              </Button>
            </CardBody>
          </Card>

          {plan && (
            <div className="space-y-6">
              {plan.advertencias.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardBody className="space-y-1">
                    {plan.advertencias.map((a, i) => (
                      <p key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        {a}
                      </p>
                    ))}
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardBody className="space-y-2">
                  <p className="text-sm font-bold text-navy">Estrategia</p>
                  {plan.estrategia.map((linea, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {linea}
                    </p>
                  ))}
                </CardBody>
              </Card>

              {plan.kpis && (
                <Card>
                  <CardBody className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-bold text-navy">
                      <Target className="h-4 w-4 text-green" />
                      KPIs estimados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>
                        Meta: {plan.kpis.metaDetectada.cantidad} {plan.kpis.metaDetectada.unidad}
                      </Badge>
                      <Badge>Leads necesarios: ~{plan.kpis.leadsNecesarios}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">{plan.kpis.nota}</p>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardBody className="space-y-2">
                  <p className="text-sm font-bold text-navy">Calendario de campaña</p>
                  {plan.calendario.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin días disponibles antes de la fecha límite.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {plan.calendario.map((d) => (
                        <div key={d.fecha} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{formatDate(d.fecha)}</span>
                          <span className="font-medium text-navy">{d.tema}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy">Listo para generar el contenido</p>
                    <p className="text-xs text-gray-400">
                      {plan.presupuestoDiario ? `${formatCurrency(plan.presupuestoDiario)}/día · ` : ""}
                      {plan.producto.nombre}
                    </p>
                  </div>
                  <Button href={`/content-studio?producto=${plan.producto.id}`} variant="secondary">
                    Ir a Content Studio
                  </Button>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
