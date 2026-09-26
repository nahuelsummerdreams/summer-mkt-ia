import { Package } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import { formatCurrency, formatDateRange } from "@/lib/utils";

const ESTADO_LABEL: Record<string, string> = {
  activo: "Activo",
  pausado: "Pausado",
  agotado: "Agotado",
};

export default function ProductosPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Productos</h1>
        <p className="mt-1 text-gray-500">
          Catálogo turístico — fuente de verdad de la IA. Ningún generador de contenido inventa precios, fechas u
          hoteles que no estén cargados acá.
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="Todavía no hay productos cargados" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-navy">{p.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {p.destino}, {p.pais}
                    </p>
                  </div>
                  <Badge>{ESTADO_LABEL[p.estado]}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-gray-500">
                  <Badge>📅 {formatDateRange(p.fechaSalida, p.fechaRegreso)}</Badge>
                  <Badge>⏱️ {p.dias}d / {p.noches}n</Badge>
                  <Badge>💰 {formatCurrency(p.precioVenta, p.moneda)}</Badge>
                  {p.incluyeAereos && <Badge>✈️ Vuelos incluidos</Badge>}
                </div>
                <p className="text-sm text-gray-500">{p.descripcion}</p>
                <Button href={`/content-studio?producto=${p.id}`} size="sm" variant="subtle">
                  Generar contenido con este producto
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
