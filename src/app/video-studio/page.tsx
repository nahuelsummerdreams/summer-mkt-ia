"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import { useBusiness } from "@/lib/business-store";
import { useInfluencers } from "@/lib/influencer-store";
import { useVideoStudio } from "@/lib/video-studio-store";
import { generateScriptTemplate, splitScriptIntoScenes } from "@/lib/script-studio";
import { uid } from "@/lib/utils";
import { TIPOS_CONTENIDO, ESTILOS_VIDEO } from "@/lib/video-studio-constants";
import type { FormatoVideo, ModoGuion, TipoContenidoVideo, VideoProject } from "@/lib/types";

export default function VideoStudioPage() {
  const router = useRouter();
  const { business } = useBusiness();
  const { proyectos, addProyecto } = useVideoStudio();
  const { influencers } = useInfluencers();

  const [wizard, setWizard] = useState(false);
  const [paso, setPaso] = useState(1);

  const [tipoContenido, setTipoContenido] = useState<TipoContenidoVideo>("tiktok");
  const [formato, setFormato] = useState<FormatoVideo>("9:16");
  const [duracionObjetivo, setDuracionObjetivo] = useState(30);
  const [productoId, setProductoId] = useState(products[0]?.id ?? "");
  const [mensaje, setMensaje] = useState("");
  const [estilo, setEstilo] = useState(ESTILOS_VIDEO[0]);
  const [modoGuion, setModoGuion] = useState<ModoGuion>("ia");
  const [respetarGuion, setRespetarGuion] = useState(true);
  const [guionPropio, setGuionPropio] = useState("");
  const [influencerId, setInfluencerId] = useState(influencers[0]?.id ?? "");

  const reset = () => {
    setPaso(1);
    setMensaje("");
    setGuionPropio("");
    setWizard(false);
  };

  const handleCrear = () => {
    const producto = products.find((p) => p.id === productoId);
    const escenas =
      modoGuion === "propio" && guionPropio.trim()
        ? splitScriptIntoScenes(guionPropio, duracionObjetivo)
        : generateScriptTemplate({ producto, vocabulario: business.vocabulario, mensaje, tipoContenido, estilo, duracionObjetivo });

    const now = new Date().toISOString();
    const proyecto: VideoProject = {
      id: uid("video"),
      nombre: mensaje.slice(0, 60) || `${TIPOS_CONTENIDO.find((t) => t.id === tipoContenido)?.label} — ${new Date().toLocaleDateString("es-AR")}`,
      tipoContenido,
      formato,
      duracionObjetivo,
      productoId: producto?.id,
      mensaje,
      estilo,
      modoGuion,
      respetarGuion: modoGuion === "propio" ? respetarGuion : false,
      influencerId: influencerId || undefined,
      escenas,
      estado: "guion-listo",
      createdAt: now,
      updatedAt: now,
    };
    addProyecto(proyecto);
    reset();
    router.push(`/video-studio/${proyecto.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-6 w-6 text-green" />
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Video Studio</h1>
            <p className="mt-1 text-gray-500">Idea → guion → influencer → escenas → video.</p>
          </div>
        </div>
        {!wizard && (
          <Button onClick={() => setWizard(true)}>
            <Sparkles className="h-4 w-4" />
            Crear video
          </Button>
        )}
      </div>

      {wizard && (
        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              {[1, 2, 3, 4, 5].map((p) => (
                <span key={p} className={`h-1.5 flex-1 rounded-full ${p <= paso ? "bg-green" : "bg-gray-100"}`} />
              ))}
            </div>

            {paso === 1 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-navy">Paso 1 — ¿Qué querés crear?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIPOS_CONTENIDO.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTipoContenido(t.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        tipoContenido === t.id ? "border-green bg-green-light text-green-dark" : "border-gray-200 text-gray-600 hover:border-green/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paso === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-navy">Paso 2 — Formato y duración</p>
                <Select
                  label="Formato"
                  value={formato}
                  onChange={(v) => setFormato(v as FormatoVideo)}
                  options={[
                    { value: "9:16", label: "Vertical (9:16)" },
                    { value: "16:9", label: "Horizontal (16:9)" },
                    { value: "1:1", label: "Cuadrado (1:1)" },
                  ]}
                />
                <Select
                  label="Duración"
                  value={String(duracionObjetivo)}
                  onChange={(v) => setDuracionObjetivo(Number(v))}
                  options={[10, 15, 30, 45, 60].map((d) => ({ value: String(d), label: `${d} segundos` }))}
                />
              </div>
            )}

            {paso === 3 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-navy">Paso 3 — ¿Qué querés comunicar?</p>
                <Select
                  label="Producto (opcional, fuente de verdad para precio/fechas/hotel)"
                  value={productoId}
                  onChange={setProductoId}
                  options={[{ value: "", label: "Sin producto" }, ...products.map((p) => ({ value: p.id, label: p.nombre }))]}
                />
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={3}
                  placeholder="Ej. Quiero promocionar Villa Carlos Paz para jóvenes que quieran viajar con amigos."
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                />
                <Select label="Estilo" value={estilo} onChange={setEstilo} options={ESTILOS_VIDEO.map((e) => ({ value: e, label: e }))} />
              </div>
            )}

            {paso === 4 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-navy">Paso 4 — Guion</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModoGuion("ia")}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium ${
                      modoGuion === "ia" ? "border-green bg-green-light text-green-dark" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    IA crea el guion
                  </button>
                  <button
                    onClick={() => setModoGuion("propio")}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium ${
                      modoGuion === "propio" ? "border-green bg-green-light text-green-dark" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Mi propio guion
                  </button>
                </div>
                {modoGuion === "propio" && (
                  <>
                    <textarea
                      value={guionPropio}
                      onChange={(e) => setGuionPropio(e.target.value)}
                      rows={6}
                      placeholder={"¿Todavía no sabés dónde viajar con tus amigos?\n\nMirá esta opción para Villa Carlos Paz..."}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
                    />
                    <label className="flex items-center gap-2 text-sm text-navy">
                      <input type="checkbox" checked={respetarGuion} onChange={(e) => setRespetarGuion(e.target.checked)} />
                      Respetar mi guion (la IA no reescribe el diálogo, solo dirige lo visual)
                    </label>
                  </>
                )}
              </div>
            )}

            {paso === 5 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-navy">Paso 5 — Elegí el influencer</p>
                {influencers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Todavía no creaste ningún AI Influencer.{" "}
                    <Link href="/ai-influencers" className="font-semibold text-green underline">
                      Crear uno
                    </Link>{" "}
                    (podés seguir sin elegir y asignarlo después).
                  </p>
                ) : (
                  <Select
                    label="Influencer"
                    value={influencerId}
                    onChange={setInfluencerId}
                    options={[{ value: "", label: "Sin asignar todavía" }, ...influencers.map((i) => ({ value: i.id, label: i.nombre }))]}
                  />
                )}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => (paso === 1 ? reset() : setPaso((p) => p - 1))}>
                <ArrowLeft className="h-4 w-4" />
                {paso === 1 ? "Cancelar" : "Atrás"}
              </Button>
              {paso < 5 ? (
                <Button onClick={() => setPaso((p) => p + 1)}>
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleCrear}>
                  <Sparkles className="h-4 w-4" />
                  Generar guion y escenas
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {!wizard && (
        <>
          {proyectos.length === 0 ? (
            <EmptyState icon={Clapperboard} title="Todavía no creaste ningún video" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {proyectos.map((p) => (
                <Link key={p.id} href={`/video-studio/${p.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardBody className="space-y-2">
                      <p className="text-sm font-bold text-navy">{p.nombre}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge>{TIPOS_CONTENIDO.find((t) => t.id === p.tipoContenido)?.label}</Badge>
                        <Badge>{p.formato}</Badge>
                        <Badge>{p.escenas.length} escena(s)</Badge>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
