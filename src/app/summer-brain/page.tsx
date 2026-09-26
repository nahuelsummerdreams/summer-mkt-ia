"use client";

import { Brain, Flame, TriangleAlert, Sparkles, Phone } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { leads, products } from "@/lib/mock-data";
import { useBusiness } from "@/lib/business-store";
import { generateBriefing } from "@/lib/summer-brain";
import { formatCurrency, whatsAppLink } from "@/lib/utils";

export default function SummerBrainPage() {
  const { business } = useBusiness();
  const briefing = generateBriefing(leads, products);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Summer Brain</h1>
          <p className="mt-1 text-gray-500">Buenos días 👋 — esto es lo que encontré en tus datos hoy.</p>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-2">
          {briefing.resumen.map((linea, i) => (
            <p key={i} className="text-sm text-navy">
              {linea}
            </p>
          ))}
        </CardBody>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-extrabold text-red-600">{briefing.metricas.hot}</p>
            <p className="text-xs text-gray-500">🔥 Hot</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-extrabold text-amber-600">{briefing.metricas.warm}</p>
            <p className="text-xs text-gray-500">🟡 Warm</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-extrabold text-blue-600">{briefing.metricas.cold}</p>
            <p className="text-xs text-gray-500">🔵 Cold</p>
          </CardBody>
        </Card>
      </div>

      {briefing.alertas.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardBody className="space-y-1">
            {briefing.alertas.map((a, i) => (
              <p key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {a}
              </p>
            ))}
          </CardBody>
        </Card>
      )}

      {briefing.leadsPrioritarios.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy">
            <Flame className="h-4 w-4 text-red-500" />
            Contactá hoy
          </h2>
          <div className="space-y-3">
            {briefing.leadsPrioritarios.map(({ lead, score }) => (
              <Card key={lead.id}>
                <CardBody className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-navy">
                      {lead.nombre} {lead.apellido}
                    </p>
                    <Badge className="bg-red-50 text-red-600">🔥 Hot</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{score.explicacion}</p>
                  {lead.proximaAccion && (
                    <p className="text-xs font-semibold text-navy">👉 {lead.proximaAccion}</p>
                  )}
                  <Button
                    href={whatsAppLink(lead.telefono, `Hola ${lead.nombre}! 👋 Te escribo de ${business.nombre}.`)}
                    target="_blank"
                    size="sm"
                    variant="subtle"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {briefing.productoDestacado && (
        <Card>
          <CardBody className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-navy">
              <Sparkles className="h-4 w-4 text-green" />
              {business.vocabulario.itemSingular.charAt(0).toUpperCase() + business.vocabulario.itemSingular.slice(1)} a impulsar
            </p>
            <p className="text-sm text-gray-500">
              <strong className="text-navy">{briefing.productoDestacado.producto.nombre}</strong> —{" "}
              {briefing.productoDestacado.motivo}. Desde{" "}
              {formatCurrency(briefing.productoDestacado.producto.precio, briefing.productoDestacado.producto.moneda)}.
            </p>
            <Button href={`/content-studio?producto=${briefing.productoDestacado.producto.id}`} size="sm">
              Generar contenido para este {business.vocabulario.itemSingular}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
