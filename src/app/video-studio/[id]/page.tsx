"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Clapperboard, Play, Loader2, CheckCircle2, XCircle, TriangleAlert, Mic } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useVideoStudio } from "@/lib/video-studio-store";
import { useInfluencers } from "@/lib/influencer-store";
import { products } from "@/lib/mock-data";
import { TIPOS_CONTENIDO } from "@/lib/video-studio-constants";
import type { GenerationJob } from "@/lib/types";

const ESTADO_ICONO: Record<GenerationJob["estado"], typeof Loader2> = {
  queued: Loader2,
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
};

export default function VideoProjectPage() {
  const params = useParams<{ id: string }>();
  const { proyectos } = useVideoStudio();
  const { influencers } = useInfluencers();
  const proyecto = proyectos.find((p) => p.id === params.id);
  const [jobsPorEscena, setJobsPorEscena] = useState<Record<string, GenerationJob>>({});
  const [vozJobsPorEscena, setVozJobsPorEscena] = useState<Record<string, GenerationJob>>({});
  const [generando, setGenerando] = useState<string | null>(null);
  const [generandoVoz, setGenerandoVoz] = useState<string | null>(null);

  const cargarJobs = () => {
    if (!proyecto) return;
    fetch(`/api/video-studio/jobs?proyectoId=${proyecto.id}`)
      .then((r) => r.json())
      .then((data) => {
        const mapaVideo: Record<string, GenerationJob> = {};
        const mapaVoz: Record<string, GenerationJob> = {};
        (data.jobs ?? []).forEach((j: GenerationJob) => {
          if (!j.escenaId) return;
          if (j.tipo === "voz") {
            if (!mapaVoz[j.escenaId]) mapaVoz[j.escenaId] = j;
          } else if (!mapaVideo[j.escenaId]) {
            mapaVideo[j.escenaId] = j;
          }
        });
        setJobsPorEscena(mapaVideo);
        setVozJobsPorEscena(mapaVoz);
      });
  };

  useEffect(() => {
    cargarJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto?.id]);

  if (!proyecto) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <EmptyState icon={Clapperboard} title="Proyecto no encontrado" description="Puede haberse perdido al recargar la página (vive en memoria, todavía sin persistencia)." />
      </div>
    );
  }

  const influencer = influencers.find((i) => i.id === proyecto.influencerId);
  const producto = products.find((p) => p.id === proyecto.productoId);

  const handleGenerar = async (escenaId: string) => {
    setGenerando(escenaId);
    try {
      const res = await fetch("/api/video-studio/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: "escena-video", proyectoId: proyecto.id, escenaId }),
      });
      const data = await res.json();
      setJobsPorEscena((prev) => ({ ...prev, [escenaId]: data.job }));
    } finally {
      setGenerando(null);
    }
  };

  const handleGenerarVoz = async (escenaId: string, dialogo: string) => {
    setGenerandoVoz(escenaId);
    try {
      const res = await fetch("/api/video-studio/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: "voz", proyectoId: proyecto.id, escenaId, texto: dialogo }),
      });
      const data = await res.json();
      setVozJobsPorEscena((prev) => ({ ...prev, [escenaId]: data.job }));
    } finally {
      setGenerandoVoz(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">{proyecto.nombre}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge>{TIPOS_CONTENIDO.find((t) => t.id === proyecto.tipoContenido)?.label}</Badge>
          <Badge>{proyecto.formato}</Badge>
          <Badge>{proyecto.duracionObjetivo}s</Badge>
          <Badge>{proyecto.estilo}</Badge>
          {producto && <Badge>{producto.nombre}</Badge>}
          {influencer ? <Badge className="bg-green-light text-green-dark">{influencer.nombre}</Badge> : <Badge>Sin influencer asignado</Badge>}
          {proyecto.modoGuion === "propio" && proyecto.respetarGuion && (
            <Badge className="bg-blue-50 text-blue-700">Guion propio — diálogo respetado</Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {proyecto.escenas.map((escena) => {
          const job = jobsPorEscena[escena.id];
          const Icono = job ? ESTADO_ICONO[job.estado] : Play;
          const vozJob = vozJobsPorEscena[escena.id];
          return (
            <Card key={escena.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-navy">Escena {escena.numero}</p>
                  <Badge>{escena.duracionSegundos}s</Badge>
                </div>
                <p className="text-sm font-medium text-navy">&ldquo;{escena.dialogo}&rdquo;</p>
                <div className="grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
                  <p>🎬 {escena.accion}</p>
                  <p>📷 {escena.tipoPlano} · {escena.movimientoCamara}</p>
                  {escena.ubicacion && <p>📍 {escena.ubicacion}</p>}
                  <p>💡 {escena.iluminacion}</p>
                  {escena.broll && <p>🎞️ B-roll: {escena.broll}</p>}
                </div>

                {job && (
                  <div
                    className={`flex items-start gap-2 rounded-xl p-2.5 text-xs ${
                      job.estado === "failed" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <Icono className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${job.estado === "processing" ? "animate-spin" : ""}`} />
                    <span>
                      {job.estado === "failed" ? job.error : job.estado === "completed" ? "Video generado." : "En cola…"}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleGenerar(escena.id)} disabled={generando === escena.id}>
                    {generando === escena.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    {job ? "Regenerar escena" : "Generar escena"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerarVoz(escena.id, escena.dialogo)}
                    disabled={generandoVoz === escena.id}
                  >
                    {generandoVoz === escena.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
                    {vozJob?.estado === "completed" ? "Regenerar voz" : "Generar voz"}
                  </Button>
                </div>

                {vozJob && vozJob.estado === "completed" && vozJob.resultUrl && (
                  <audio controls src={vozJob.resultUrl} className="h-9 w-full" />
                )}
                {vozJob && vozJob.estado === "failed" && (
                  <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 p-2 text-xs text-amber-700">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {vozJob.error}
                  </p>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardBody className="flex items-start gap-2 text-sm text-amber-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Todavía no hay un proveedor de generación de video conectado (Runway, Kling, etc.) — por eso cada
            escena queda en &ldquo;failed&rdquo; con el motivo exacto. El guion, las escenas y la dirección
            audiovisual ya están listos; conectar un proveedor real en AI Model Hub habilita la generación real sin
            tener que rehacer nada de esto.
          </span>
        </CardBody>
      </Card>
    </div>
  );
}
