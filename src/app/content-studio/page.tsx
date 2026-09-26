"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Copy, Check, RefreshCw, TriangleAlert, Wand2, CalendarPlus } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import { usePosts } from "@/lib/posts-store";
import { uid } from "@/lib/utils";
import type { Post, PostFormato, PostPlataforma } from "@/lib/types";
import {
  CONTENT_OBJETIVOS,
  CONTENT_PUBLICOS,
  CONTENT_TONOS,
  CONTENT_ESTILOS,
  CONTENT_DURACIONES,
  generateContentPack,
  type ContentObjetivo,
  type ContentPublico,
  type ContentTono,
  type ContentEstilo,
  type GeneratedContentPack,
} from "@/lib/content-generator";

const FORMATO_LABEL: Record<PostFormato, string> = { reel: "Reel", story: "Stories", carrusel: "Carrusel" };

function captionParaFormato(pack: GeneratedContentPack, plataforma: PostPlataforma, formato: PostFormato): string {
  if (formato === "story") return pack.stories.map((s) => s.texto).join(" → ");
  if (formato === "carrusel") return pack.carrusel.map((c) => c.titulo).join(" → ");
  return plataforma === "instagram" ? pack.captions.instagram : pack.captions.tiktok;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard no disponible: no rompemos la UI por esto.
        }
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiado" : "Copiar"}
    </Button>
  );
}

function ContentStudioForm() {
  const searchParams = useSearchParams();
  const disponibles = useMemo(() => products.filter((p) => p.estado === "activo"), []);
  const initialId = searchParams.get("producto") ?? disponibles[0]?.id ?? "";

  const [productId, setProductId] = useState(initialId);
  const [objetivo, setObjetivo] = useState<ContentObjetivo>("vender");
  const [publico, setPublico] = useState<ContentPublico>("turismo-joven");
  const [tono, setTono] = useState<ContentTono>("cercano");
  const [estilo, setEstilo] = useState<ContentEstilo>("viral");
  const [duracionReel, setDuracionReel] = useState<(typeof CONTENT_DURACIONES)[number]>(30);
  const [pack, setPack] = useState<GeneratedContentPack | null>(null);
  const [seed, setSeed] = useState(0);
  const [modo, setModo] = useState<"plantilla" | "ia">("plantilla");
  const [proveedorIA, setProveedorIA] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [plataformaGuardar, setPlataformaGuardar] = useState<PostPlataforma>("instagram");
  const [formatoGuardar, setFormatoGuardar] = useState<PostFormato>("reel");
  const [guardado, setGuardado] = useState(false);

  const { addPost } = usePosts();
  const product = disponibles.find((p) => p.id === productId) ?? disponibles[0];
  const input = { objetivo, publico, tono, estilo, duracionReel };

  const handleGenerate = () => {
    if (!product) return;
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setModo("plantilla");
    setProveedorIA(null);
    setAiError(null);
    setPack(generateContentPack(product, input, nextSeed));
  };

  const handleEnhanceWithAI = async () => {
    if (!product) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/content/enhance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: product.id, input, seed: seed || 1 }),
      });
      const data = await res.json();
      setPack(data.pack);
      setModo(data.modo);
      setProveedorIA(data.proveedor ?? null);
      if (data.modo === "plantilla" && data.error) setAiError(data.error);
    } catch {
      setAiError("No se pudo contactar al servidor para mejorar el contenido con IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGuardarComoBorrador = () => {
    if (!pack || !product) return;
    const now = new Date().toISOString();
    const post: Post = {
      id: uid("post"),
      plataforma: plataformaGuardar,
      formato: formatoGuardar,
      productoId: product.id,
      objetivo,
      publico,
      tono,
      estilo,
      duracionReel,
      hook: pack.hooks[0] ?? "",
      caption: captionParaFormato(pack, plataformaGuardar, formatoGuardar),
      hashtags: pack.hashtags,
      cta: pack.cta,
      estado: "borrador",
      createdAt: now,
      updatedAt: now,
    };
    addPost(post);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-green" />
          <h1 className="text-2xl font-extrabold text-navy">Content Studio</h1>
        </div>
        <p className="mt-1 text-gray-500">
          Elegí un producto real del catálogo y generá hooks, guion de Reel, captions, Stories y carrusel listos
          para publicar. Todo dato concreto (destino, fechas, precio, hotel) sale del catálogo — nunca se inventa.
        </p>
      </div>

      {disponibles.length === 0 ? (
        <EmptyState icon={Sparkles} title="No hay productos activos para generar contenido" />
      ) : (
        <>
          <Card>
            <CardBody className="space-y-4">
              <Select
                label="Producto"
                value={productId || product?.id || ""}
                onChange={setProductId}
                options={disponibles.map((p) => ({ value: p.id, label: `${p.nombre} (${p.destino})` }))}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  label="Objetivo"
                  value={objetivo}
                  onChange={(v) => setObjetivo(v as ContentObjetivo)}
                  options={CONTENT_OBJETIVOS.map((o) => ({ value: o.id, label: o.label }))}
                />
                <Select
                  label="Público"
                  value={publico}
                  onChange={(v) => setPublico(v as ContentPublico)}
                  options={CONTENT_PUBLICOS.map((o) => ({ value: o.id, label: o.label }))}
                />
                <Select
                  label="Tono"
                  value={tono}
                  onChange={(v) => setTono(v as ContentTono)}
                  options={CONTENT_TONOS.map((o) => ({ value: o.id, label: o.label }))}
                />
                <Select
                  label="Estilo"
                  value={estilo}
                  onChange={(v) => setEstilo(v as ContentEstilo)}
                  options={CONTENT_ESTILOS.map((o) => ({ value: o.id, label: `${o.label} — ${o.descripcion}` }))}
                />
              </div>
              <Select
                label="Duración del Reel"
                value={String(duracionReel)}
                onChange={(v) => setDuracionReel(Number(v) as (typeof CONTENT_DURACIONES)[number])}
                options={CONTENT_DURACIONES.map((d) => ({ value: String(d), label: `${d} segundos` }))}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleGenerate} size="lg" className="w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  {pack ? "Regenerar contenido" : "Generar contenido"}
                </Button>
                {pack && (
                  <Button
                    onClick={handleEnhanceWithAI}
                    size="lg"
                    variant="secondary"
                    disabled={aiLoading}
                    className="w-full sm:w-auto"
                  >
                    <Wand2 className="h-4 w-4" />
                    {aiLoading ? "Mejorando con IA…" : "Mejorar con IA"}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {pack && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {modo === "ia" ? (
                  <Badge className="bg-green-light text-green-dark">
                    <Wand2 className="h-3 w-3" /> Generado con IA{proveedorIA ? ` · ${proveedorIA}` : ""}
                  </Badge>
                ) : (
                  <Badge>Generado con plantillas</Badge>
                )}
              </div>

              {aiError && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardBody className="flex items-start gap-2 text-sm text-amber-700">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      No se pudo mejorar con IA, se muestra la versión de plantillas. Motivo: {aiError}
                    </span>
                  </CardBody>
                </Card>
              )}

              {pack.advertencias.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardBody className="space-y-1">
                    {pack.advertencias.map((a, i) => (
                      <p key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        {a}
                      </p>
                    ))}
                  </CardBody>
                </Card>
              )}

              <Tabs
                items={[
                  {
                    id: "hooks",
                    label: "Hooks",
                    content: (
                      <div className="space-y-3">
                        {pack.hooks.map((h, i) => (
                          <Card key={i}>
                            <CardBody className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-navy">
                                <Badge className="mr-2 bg-green-light text-green-dark">Hook {i + 1}</Badge>
                                {h}
                              </p>
                              <CopyButton text={h} />
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: "reel",
                    label: "Guion de Reel",
                    content: (
                      <div className="space-y-4">
                        <Card>
                          <CardBody className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <Badge>⏱️ {pack.reel.duracion}s</Badge>
                            <Badge>🎵 {pack.reel.musicaSugerida}</Badge>
                          </CardBody>
                        </Card>
                        {pack.reel.escenas.map((e) => (
                          <Card key={e.numero}>
                            <CardBody>
                              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
                                <span>Escena {e.numero}</span>
                                <span>·</span>
                                <span>{e.duracion}</span>
                              </div>
                              <p className="text-sm text-gray-500">{e.visual}</p>
                              <p className="mt-1 text-sm font-medium text-navy">{e.texto}</p>
                            </CardBody>
                          </Card>
                        ))}
                        <Card>
                          <CardBody className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-400">Voz en off / subtítulos sugeridos</p>
                              <p className="mt-1 text-sm text-navy">{pack.reel.vozOff}</p>
                            </div>
                            <CopyButton text={pack.reel.vozOff} />
                          </CardBody>
                        </Card>
                      </div>
                    ),
                  },
                  {
                    id: "captions",
                    label: "Captions",
                    content: (
                      <div className="space-y-4">
                        {(
                          [
                            ["Instagram", pack.captions.instagram],
                            ["TikTok", pack.captions.tiktok],
                            ["WhatsApp", pack.captions.whatsapp],
                          ] as const
                        ).map(([label, text]) => (
                          <Card key={label}>
                            <CardBody className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge>{label}</Badge>
                                <CopyButton text={text} />
                              </div>
                              <p className="whitespace-pre-line text-sm text-navy">{text}</p>
                            </CardBody>
                          </Card>
                        ))}
                        <Card>
                          <CardBody className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-400">Hashtags</p>
                              <CopyButton text={pack.hashtags.join(" ")} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {pack.hashtags.map((h) => (
                                <Badge key={h}>{h}</Badge>
                              ))}
                            </div>
                          </CardBody>
                        </Card>
                        <Card>
                          <CardBody className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-navy">{pack.cta}</p>
                            <CopyButton text={pack.cta} />
                          </CardBody>
                        </Card>
                      </div>
                    ),
                  },
                  {
                    id: "stories",
                    label: "Stories",
                    content: (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {pack.stories.map((s) => (
                          <Card key={s.numero}>
                            <CardBody>
                              <Badge className="mb-2">
                                Story {s.numero} · {s.tipo}
                              </Badge>
                              <p className="text-sm font-medium text-navy">{s.texto}</p>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: "carrusel",
                    label: "Carrusel",
                    content: (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {pack.carrusel.map((s) => (
                          <Card key={s.numero}>
                            <CardBody>
                              <Badge className="mb-2">Slide {s.numero}</Badge>
                              <p className="text-sm font-medium text-navy">{s.titulo}</p>
                              {s.texto && <p className="mt-1 text-xs text-gray-400">{s.texto}</p>}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ),
                  },
                ]}
              />

              <Button variant="ghost" size="sm" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4" />
                Generar otra variante
              </Button>

              <Card>
                <CardBody className="space-y-3">
                  <p className="text-sm font-bold text-navy">Guardar en el calendario de publicaciones</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      label="Plataforma"
                      value={plataformaGuardar}
                      onChange={(v) => setPlataformaGuardar(v as PostPlataforma)}
                      options={[
                        { value: "instagram", label: "Instagram" },
                        { value: "tiktok", label: "TikTok" },
                      ]}
                    />
                    <Select
                      label="Formato"
                      value={formatoGuardar}
                      onChange={(v) => setFormatoGuardar(v as PostFormato)}
                      options={(Object.keys(FORMATO_LABEL) as PostFormato[]).map((f) => ({
                        value: f,
                        label: FORMATO_LABEL[f],
                      }))}
                    />
                  </div>
                  <Button onClick={handleGuardarComoBorrador} variant="secondary">
                    <CalendarPlus className="h-4 w-4" />
                    {guardado ? "Guardado ✓" : "Guardar como borrador"}
                  </Button>
                  <p className="text-xs text-gray-400">
                    Queda como borrador en {plataformaGuardar === "instagram" ? "Instagram" : "TikTok"} — de ahí
                    pasa por revisión y aprobación antes de programarse.
                  </p>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-gray-400">Cargando…</p>}>
      <ContentStudioForm />
    </Suspense>
  );
}
