"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/mock-data";
import { generateWeeklyCalendar } from "@/lib/content-calendar";
import { formatDate } from "@/lib/utils";

export default function CalendarioPage() {
  const semana = useMemo(() => generateWeeklyCalendar(products), []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Calendario de contenidos</h1>
          <p className="mt-1 text-gray-500">
            Un tema por día, con el producto activo real que mejor encaja. Si ninguno encaja, el día queda sin
            sugerencia — nunca se inventa un producto.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {semana.map((dia) => (
          <Card key={dia.diaSemana}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dia.emoji}</span>
                  <p className="font-bold text-navy">
                    {dia.diaSemana} <span className="font-normal text-gray-400">· {formatDate(dia.fecha)}</span>
                  </p>
                </div>
                <Badge className="mt-1.5">{dia.temaLabel}</Badge>
              </div>

              {dia.productoSugerido ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy">{dia.productoSugerido.nombre}</p>
                    <p className="text-xs text-gray-400">{dia.productoSugerido.destino}</p>
                  </div>
                  <Button href={`/content-studio?producto=${dia.productoSugerido.id}`} size="sm" variant="subtle">
                    Generar
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sin producto que encaje este tema</p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
