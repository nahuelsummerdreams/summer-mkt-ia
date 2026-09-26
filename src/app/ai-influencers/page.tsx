"use client";

import { useState } from "react";
import { UserRound, ShieldCheck, ImagePlus, Trash2, Fingerprint } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInfluencers } from "@/lib/influencer-store";
import { uid } from "@/lib/utils";
import type { Influencer, InfluencerGenero, InfluencerNicho, InfluencerPersonalidad } from "@/lib/types";

const PERSONALIDADES: { id: InfluencerPersonalidad; label: string }[] = [
  { id: "energetico", label: "Energético" },
  { id: "divertido", label: "Divertido" },
  { id: "casual", label: "Casual" },
  { id: "profesional", label: "Profesional" },
  { id: "elegante", label: "Elegante" },
  { id: "aventurero", label: "Aventurero" },
  { id: "amigable", label: "Amigable" },
  { id: "inspirador", label: "Inspirador" },
];

const NICHOS: { id: InfluencerNicho; label: string }[] = [
  { id: "turismo", label: "Turismo" },
  { id: "viajes", label: "Viajes" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "gastronomia", label: "Gastronomía" },
  { id: "tecnologia", label: "Tecnología" },
  { id: "negocios", label: "Negocios" },
  { id: "moda", label: "Moda" },
  { id: "fitness", label: "Fitness" },
  { id: "educacion", label: "Educación" },
];

const CONSENT_TEXT =
  "Confirmo que tengo autorización para utilizar esta imagen, apariencia o voz para crear un personaje digital reutilizable.";

function emptyForm() {
  return {
    nombre: "",
    edadAparente: 25,
    genero: "femenino" as InfluencerGenero,
    nacionalidad: "Argentina",
    idioma: "Español",
    acento: "Argentino (Buenos Aires)",
    personalidad: "energetico" as InfluencerPersonalidad,
    nicho: "turismo" as InfluencerNicho,
    estiloVisual: "",
    vestimenta: "",
    descripcionFisica: "",
    nivelEnergia: "alto" as "bajo" | "medio" | "alto",
    formaDeHablar: "",
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AiInfluencersPage() {
  const { influencers, addInfluencer, deleteInfluencer } = useInfluencers();
  const [form, setForm] = useState(emptyForm());
  const [esDigitalTwin, setEsDigitalTwin] = useState(false);
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const necesitaConsentimiento = esDigitalTwin || Boolean(foto);
  const puedeCrear = form.nombre.trim().length > 0 && (!necesitaConsentimiento || consentimientoAceptado);

  const handleFoto = async (file: File | null) => {
    if (!file) return;
    setFoto(await fileToDataUrl(file));
  };

  const handleCrear = () => {
    if (!puedeCrear) return;
    const inf: Influencer = {
      id: uid("inf"),
      ...form,
      negativePrompts: [
        "plastic skin",
        "cgi appearance",
        "cartoon",
        "3d render",
        "video game appearance",
        "robotic movements",
        "deformed hands",
        "extra fingers",
        "inconsistent faces",
        "flickering",
        "unnatural lip movement",
      ],
      imagenReferenciaUrl: foto,
      esDigitalTwin,
      consentimiento: necesitaConsentimiento
        ? { aceptado: consentimientoAceptado, texto: CONSENT_TEXT, timestamp: new Date().toISOString() }
        : undefined,
      idsExternos: {},
      createdAt: new Date().toISOString(),
    };
    addInfluencer(inf);
    setForm(emptyForm());
    setFoto(undefined);
    setEsDigitalTwin(false);
    setConsentimientoAceptado(false);
    setMostrarForm(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserRound className="h-6 w-6 text-green" />
          <div>
            <h1 className="text-2xl font-extrabold text-navy">AI Influencers</h1>
            <p className="mt-1 text-gray-500">
              Influencers digitales consistentes con Character ID — la referencia que un proveedor real de
              video/imagen usaría para mantener la misma cara en todas las escenas.
            </p>
          </div>
        </div>
        <Button onClick={() => setMostrarForm((v) => !v)}>{mostrarForm ? "Cancelar" : "Crear influencer"}</Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Nombre
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Summer Travel Creator"
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Edad aparente
                <input
                  type="number"
                  value={form.edadAparente}
                  onChange={(e) => setForm((f) => ({ ...f, edadAparente: Number(e.target.value) }))}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Género"
                value={form.genero}
                onChange={(v) => setForm((f) => ({ ...f, genero: v as InfluencerGenero }))}
                options={[
                  { value: "femenino", label: "Femenino" },
                  { value: "masculino", label: "Masculino" },
                  { value: "no-binario", label: "No binario" },
                ]}
              />
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Nacionalidad / acento
                <input
                  value={form.nacionalidad}
                  onChange={(e) => setForm((f) => ({ ...f, nacionalidad: e.target.value }))}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Personalidad"
                value={form.personalidad}
                onChange={(v) => setForm((f) => ({ ...f, personalidad: v as InfluencerPersonalidad }))}
                options={PERSONALIDADES.map((p) => ({ value: p.id, label: p.label }))}
              />
              <Select
                label="Nicho"
                value={form.nicho}
                onChange={(v) => setForm((f) => ({ ...f, nicho: v as InfluencerNicho }))}
                options={NICHOS.map((n) => ({ value: n.id, label: n.label }))}
              />
            </div>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Descripción física (pelo, contextura, rasgos)
              <textarea
                value={form.descripcionFisica}
                onChange={(e) => setForm((f) => ({ ...f, descripcionFisica: e.target.value }))}
                rows={2}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Vestimenta
                <input
                  value={form.vestimenta}
                  onChange={(e) => setForm((f) => ({ ...f, vestimenta: e.target.value }))}
                  placeholder="Ej. ropa casual de verano, colores claros"
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Forma de hablar
                <input
                  value={form.formaDeHablar}
                  onChange={(e) => setForm((f) => ({ ...f, formaDeHablar: e.target.value }))}
                  placeholder="Ej. rápido, cercano, con muletillas argentinas"
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
              </label>
            </div>

            <div className="space-y-2 rounded-xl border border-dashed border-gray-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-navy">
                <input type="checkbox" checked={esDigitalTwin} onChange={(e) => setEsDigitalTwin(e.target.checked)} />
                Es mi Digital Twin (versión digital de una persona real)
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy hover:border-green/40">
                <ImagePlus className="h-4 w-4" />
                {foto ? "Cambiar foto de referencia" : "Cargar foto de referencia (opcional)"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFoto(e.target.files?.[0] ?? null)} />
              </label>
              {foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="Referencia" className="h-24 w-24 rounded-xl object-cover" />
              )}

              {necesitaConsentimiento && (
                <label className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                  <input
                    type="checkbox"
                    checked={consentimientoAceptado}
                    onChange={(e) => setConsentimientoAceptado(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="flex items-start gap-1.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    {CONSENT_TEXT} Solo utilizá imágenes, voz y apariencia de personas con autorización.
                  </span>
                </label>
              )}
            </div>

            <Button onClick={handleCrear} disabled={!puedeCrear}>
              Crear influencer
            </Button>
          </CardBody>
        </Card>
      )}

      {influencers.length === 0 ? (
        <EmptyState icon={UserRound} title="Todavía no creaste ningún influencer" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {influencers.map((inf) => (
            <Card key={inf.id}>
              <CardBody className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {inf.imagenReferenciaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inf.imagenReferenciaUrl} alt={inf.nombre} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light text-green-dark">
                        <UserRound className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-navy">{inf.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {inf.edadAparente} años · {inf.nacionalidad}
                      </p>
                    </div>
                  </div>
                  {inf.esDigitalTwin && <Badge className="bg-green-light text-green-dark">Digital Twin</Badge>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>{PERSONALIDADES.find((p) => p.id === inf.personalidad)?.label}</Badge>
                  <Badge>{NICHOS.find((n) => n.id === inf.nicho)?.label}</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Fingerprint className="h-3.5 w-3.5" /> Character ID: {inf.id}
                </p>
                {inf.consentimiento && (
                  <p className="text-xs text-gray-400">
                    Consentimiento registrado el {new Date(inf.consentimiento.timestamp).toLocaleString("es-AR")}
                  </p>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteInfluencer(inf.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
