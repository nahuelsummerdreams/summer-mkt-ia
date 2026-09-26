"use client";

import { useState } from "react";
import { FolderOpen, Upload, Loader2, Tag, TriangleAlert, Search } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMedia } from "@/lib/media-store";
import { uid } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BibliotecaPage() {
  const { assets, addAsset, updateAsset, deleteAsset } = useMedia();
  const [subiendo, setSubiendo] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState<Record<string, string>>({});

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    for (const file of Array.from(files)) {
      const dataUrl = await fileToDataUrl(file);
      const [, base64] = dataUrl.split(",");
      const asset: MediaAsset = {
        id: uid("media"),
        nombre: file.name,
        url: dataUrl,
        mimeType: file.type || "image/jpeg",
        etiquetas: [],
        estadoAnalisis: "pendiente",
        createdAt: new Date().toISOString(),
      };
      addAsset(asset);

      try {
        const res = await fetch("/api/ai/vision", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ base64, mimeType: asset.mimeType }),
        });
        const data = await res.json();
        if (!res.ok) {
          updateAsset(asset.id, { estadoAnalisis: "error", errorAnalisis: data.error });
        } else {
          updateAsset(asset.id, {
            estadoAnalisis: "analizado",
            etiquetas: data.etiquetas,
            descripcionIA: data.descripcion,
            proveedorIA: data.proveedor,
          });
        }
      } catch {
        updateAsset(asset.id, { estadoAnalisis: "error", errorAnalisis: "No se pudo contactar al servidor." });
      }
    }
    setSubiendo(false);
  };

  const filtrados = busqueda.trim()
    ? assets.filter(
        (a) =>
          a.etiquetas.some((t) => t.includes(busqueda.toLowerCase())) ||
          a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          a.descripcionIA?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : assets;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Summer Media Library</h1>
          <p className="mt-1 text-gray-500">
            Subí fotos y la IA de visión (AI Model Hub) las etiqueta automáticamente. El archivo se guarda en memoria
            del navegador para esta sesión — no hay storage persistente todavía.
          </p>
        </div>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">
            {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {subiendo ? "Analizando…" : "Subir foto(s)"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={subiendo}
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>

          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder='Buscar por etiqueta, ej. "playa"'
              className="h-10 w-full bg-transparent text-sm text-navy outline-none"
            />
          </div>
        </CardBody>
      </Card>

      {assets.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Todavía no hay fotos cargadas" />
      ) : filtrados.length === 0 ? (
        <EmptyState icon={Search} title="Nada coincide con esa búsqueda" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((asset) => (
            <Card key={asset.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={asset.nombre} className="h-40 w-full rounded-t-2xl object-cover" />
              <CardBody className="space-y-2">
                <p className="truncate text-xs font-semibold text-navy">{asset.nombre}</p>

                {asset.estadoAnalisis === "pendiente" && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> Analizando con IA…
                  </p>
                )}
                {asset.estadoAnalisis === "error" && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-600">
                    <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" /> {asset.errorAnalisis}
                  </p>
                )}
                {asset.descripcionIA && <p className="text-xs text-gray-500">{asset.descripcionIA}</p>}

                <div className="flex flex-wrap gap-1.5">
                  {asset.etiquetas.map((t) => (
                    <Badge key={t}>
                      <Tag className="h-3 w-3" />
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    value={nuevaEtiqueta[asset.id] ?? ""}
                    onChange={(e) => setNuevaEtiqueta((prev) => ({ ...prev, [asset.id]: e.target.value }))}
                    placeholder="Agregar etiqueta"
                    className="h-8 flex-1 rounded-lg border border-gray-200 px-2 text-xs text-navy outline-none focus:border-green/40"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const valor = nuevaEtiqueta[asset.id]?.trim();
                      if (!valor) return;
                      updateAsset(asset.id, { etiquetas: [...asset.etiquetas, valor] });
                      setNuevaEtiqueta((prev) => ({ ...prev, [asset.id]: "" }));
                    }}
                  >
                    +
                  </Button>
                </div>

                <Button size="sm" variant="ghost" onClick={() => deleteAsset(asset.id)}>
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
