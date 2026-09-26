"use client";

import { useState } from "react";
import { Settings, Check } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useBusiness } from "@/lib/business-store";
import { RUBROS, VOCABULARIO_POR_RUBRO } from "@/lib/business-constants";
import type { Rubro } from "@/lib/types";

export default function ConfiguracionPage() {
  const { business, updateBusiness } = useBusiness();
  const [form, setForm] = useState(business);
  const [guardado, setGuardado] = useState(false);

  const handleRubroChange = (rubro: Rubro) => {
    setForm((f) => ({ ...f, rubro, vocabulario: VOCABULARIO_POR_RUBRO[rubro] }));
  };

  const handleGuardar = () => {
    updateBusiness(form);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Configuración del negocio</h1>
          <p className="mt-1 text-gray-500">
            SUMMER AI es multi-negocio: el rubro que elijas acá define cómo se llaman las cosas en toda la app (un
            &ldquo;paquete&rdquo; en turismo es un &ldquo;plato&rdquo; en gastronomía o una &ldquo;propiedad&rdquo; en
            inmobiliaria) y con qué tono le habla la IA a tus clientes.
          </p>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Nombre del negocio
            <input
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
            />
          </label>

          <Select
            label="Rubro"
            value={form.rubro}
            onChange={(v) => handleRubroChange(v as Rubro)}
            options={RUBROS.map((r) => ({ value: r.id, label: r.label }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Cómo le decís a tu producto/servicio (singular)
              <input
                value={form.vocabulario.itemSingular}
                onChange={(e) => setForm((f) => ({ ...f, vocabulario: { ...f.vocabulario, itemSingular: e.target.value } }))}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Plural
              <input
                value={form.vocabulario.itemPlural}
                onChange={(e) => setForm((f) => ({ ...f, vocabulario: { ...f.vocabulario, itemPlural: e.target.value } }))}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Cómo le decís a tu cliente (singular)
              <input
                value={form.vocabulario.clienteSingular}
                onChange={(e) => setForm((f) => ({ ...f, vocabulario: { ...f.vocabulario, clienteSingular: e.target.value } }))}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Plural
              <input
                value={form.vocabulario.clientePlural}
                onChange={(e) => setForm((f) => ({ ...f, vocabulario: { ...f.vocabulario, clientePlural: e.target.value } }))}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Tono de comunicación
            <input
              value={form.tono}
              onChange={(e) => setForm((f) => ({ ...f, tono: e.target.value }))}
              placeholder="Ej. cercano y juvenil, profesional y elegante..."
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Descripción de la marca
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={2}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              WhatsApp
              <input
                value={form.whatsapp ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder="549..."
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Instagram
              <input
                value={form.instagram ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                placeholder="@tu_negocio"
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>
          </div>

          <Button onClick={handleGuardar} size="lg">
            {guardado ? <Check className="h-4 w-4" /> : null}
            {guardado ? "Guardado ✓" : "Guardar configuración"}
          </Button>
        </CardBody>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardBody className="text-sm text-amber-700">
          Esta configuración vive en memoria del navegador para esta sesión — todavía no hay persistencia entre
          sesiones (eso es Supabase, día 2). Se aplica de inmediato a Content Studio, Video Studio, Leads, Campañas y
          Summer Brain mientras navegás.
        </CardBody>
      </Card>
    </div>
  );
}
