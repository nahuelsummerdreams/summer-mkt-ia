"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, Pencil, RotateCcw, Trash2, Send, Clock, TriangleAlert, Camera, Music2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePosts } from "@/lib/posts-store";
import { products } from "@/lib/mock-data";
import { useBusiness } from "@/lib/business-store";
import { generateContentPack, type ContentEstilo, type ContentObjetivo, type ContentPublico, type ContentTono } from "@/lib/content-generator";
import type { Post, PostEstado, PostPlataforma } from "@/lib/types";

const ESTADO_ORDEN: PostEstado[] = ["borrador", "revision", "aprobado", "programado", "publicado"];
const ESTADO_LABEL: Record<PostEstado, string> = {
  borrador: "Borrador",
  revision: "En revisión",
  aprobado: "Aprobado",
  programado: "Programado",
  publicado: "Publicado",
};

interface IntegrationStatus {
  plataforma: PostPlataforma;
  label: string;
  envVars: string[];
  comoConfigurar: string;
  configurado: boolean;
}

function PostCard({ post }: { post: Post }) {
  const { setEstado, updatePost, deletePost } = usePosts();
  const { business } = useBusiness();
  const [editando, setEditando] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(post.caption);
  const producto = products.find((p) => p.id === post.productoId);

  const handleRegenerar = () => {
    if (!producto) return;
    const pack = generateContentPack(
      producto,
      business.vocabulario,
      {
        objetivo: post.objetivo as ContentObjetivo,
        publico: post.publico as ContentPublico,
        tono: post.tono as ContentTono,
        estilo: post.estilo as ContentEstilo,
        duracionReel: post.duracionReel as 10 | 15 | 30 | 45 | 60,
      },
      Date.now()
    );
    const caption =
      post.formato === "story"
        ? pack.stories.map((s) => s.texto).join(" → ")
        : post.formato === "carrusel"
        ? pack.carrusel.map((c) => c.titulo).join(" → ")
        : post.plataforma === "instagram"
        ? pack.captions.instagram
        : pack.captions.tiktok;
    updatePost(post.id, { hook: pack.hooks[0] ?? post.hook, caption, hashtags: pack.hashtags, cta: pack.cta });
    setCaptionDraft(caption);
  };

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-navy">{producto?.nombre ?? "Producto no encontrado"}</p>
            <p className="text-xs text-gray-400">{producto?.categoria}</p>
          </div>
          <Badge>{post.formato}</Badge>
        </div>

        <p className="text-sm font-medium text-navy">{post.hook}</p>

        {editando ? (
          <textarea
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 p-2 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
          />
        ) : (
          <p className="whitespace-pre-line text-sm text-gray-600">{post.caption}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.slice(0, 5).map((h) => (
            <Badge key={h}>{h}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {editando ? (
            <Button
              size="sm"
              onClick={() => {
                updatePost(post.id, { caption: captionDraft });
                setEditando(false);
              }}
            >
              Guardar edición
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}

          {(post.estado === "borrador" || post.estado === "revision") && (
            <Button size="sm" variant="subtle" onClick={() => setEstado(post.id, "aprobado")}>
              <ThumbsUp className="h-3.5 w-3.5" />
              Aprobar
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={handleRegenerar}>
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerar
          </Button>

          {post.estado === "aprobado" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const fecha = window.prompt("Fecha de publicación (AAAA-MM-DD):", new Date().toISOString().slice(0, 10));
                if (!fecha) return;
                updatePost(post.id, { estado: "programado", fechaProgramada: fecha });
              }}
            >
              <Clock className="h-3.5 w-3.5" />
              Programar
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)}>
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>

        {post.fechaProgramada && post.estado === "programado" && (
          <p className="text-xs text-gray-400">📅 Programado para {post.fechaProgramada}</p>
        )}
      </CardBody>
    </Card>
  );
}

export function PostsBoard({ plataforma }: { plataforma: PostPlataforma }) {
  const { posts } = usePosts();
  const icon = plataforma === "instagram" ? Camera : Music2;
  const [integracion, setIntegracion] = useState<IntegrationStatus | null>(null);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then((r) => r.json())
      .then((data) => setIntegracion(data.integraciones.find((i: IntegrationStatus) => i.plataforma === plataforma) ?? null))
      .catch(() => setIntegracion(null));
  }, [plataforma]);

  const propios = posts.filter((p) => p.plataforma === plataforma);

  return (
    <div className="space-y-6">
      <Card className={integracion?.configurado ? "border-green-200 bg-green-light/40" : "border-amber-200 bg-amber-50"}>
        <CardBody className="flex items-start gap-3">
          {integracion?.configurado ? (
            <Send className="mt-0.5 h-5 w-5 text-green-dark" />
          ) : (
            <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-600" />
          )}
          <div className="text-sm">
            {integracion?.configurado ? (
              <p className="text-green-dark">Integración conectada — la publicación real está habilitada.</p>
            ) : (
              <>
                <p className="font-semibold text-amber-700">Publicación real todavía no conectada.</p>
                <p className="mt-1 text-amber-700/90">{integracion?.comoConfigurar}</p>
                {integracion && (
                  <p className="mt-1 text-xs text-amber-600">
                    Variables server-side necesarias: {integracion.envVars.join(", ")}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Mientras tanto, el pipeline borrador → revisión → aprobación → programado funciona completo — solo
                  el último paso (publicar de verdad) queda bloqueado.
                </p>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {propios.length === 0 ? (
        <EmptyState
          icon={icon}
          title="Todavía no hay publicaciones acá"
          description="Generá contenido en Content Studio y guardalo como borrador para esta plataforma."
        />
      ) : (
        ESTADO_ORDEN.map((estado) => {
          const enEstado = propios.filter((p) => p.estado === estado);
          if (enEstado.length === 0) return null;
          return (
            <div key={estado}>
              <h2 className="mb-3 text-sm font-bold text-navy">
                {ESTADO_LABEL[estado]} <span className="font-normal text-gray-400">({enEstado.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {enEstado.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
