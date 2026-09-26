"use client";

import { Package } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import { useBusiness } from "@/lib/business-store";
import { formatCurrency, formatDate } from "@/lib/utils";

const ESTADO_LABEL: Record<string, string> = {
  activo: "Activo",
  pausado: "Pausado",
  agotado: "Agotado",
};

export default function ProductosPage() {
  const { business } = useBusiness();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">
          {business.vocabulario.itemPlural.charAt(0).toUpperCase() + business.vocabulario.itemPlural.slice(1)}
        </h1>
        <p className="mt-1 text-gray-500">
          Catálogo de {business.nombre} — fuente de verdad de la IA. Ningún generador de contenido inventa precios ni
          datos que no estén cargados acá.
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title={`Todavía no hay ningún ${business.vocabulario.itemSingular} cargado`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-navy">{p.nombre}</p>
                    <p className="text-sm text-gray-500">{p.categoria}</p>
                  </div>
                  <Badge>{ESTADO_LABEL[p.estado]}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-gray-500">
                  <Badge>💰 {formatCurrency(p.precio, p.moneda)}</Badge>
                  {p.fechaLimite && <Badge>📅 hasta {formatDate(p.fechaLimite)}</Badge>}
                  {p.cupos != null && <Badge>🎟️ {p.cupos} cupos</Badge>}
                  {Object.entries(p.atributos).map(([clave, valor]) => (
                    <Badge key={clave}>
                      {clave}: {valor}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">{p.descripcion}</p>
                <Button href={`/content-studio?producto=${p.id}`} size="sm" variant="subtle">
                  Generar contenido con este {business.vocabulario.itemSingular}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
