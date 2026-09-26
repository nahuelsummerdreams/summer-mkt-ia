"use client";

import { useEffect, useState } from "react";
import { Cpu, Check, X, Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { AiPrioridad } from "@/lib/ai/types";

interface ProviderStatus {
  id: string;
  label: string;
  tasks: string[];
  envVar: string;
  configurado: boolean;
}

interface MediaProviderStatus {
  id: string;
  label: string;
  capacidad: string;
  envVars: string[];
  comoConfigurar: string;
  configurado: boolean;
}

const TASK_CATEGORIAS: { id: string; label: string }[] = [
  { id: "texto", label: "Texto" },
  { id: "imagen", label: "Imagen" },
  { id: "vision", label: "Visión" },
  { id: "video", label: "Video" },
  { id: "voz", label: "Voz" },
  { id: "avatar-lipsync", label: "Avatar / Lip-Sync" },
];

export default function AiModelHubPage() {
  const [providers, setProviders] = useState<ProviderStatus[] | null>(null);
  const [mediaProviders, setMediaProviders] = useState<MediaProviderStatus[] | null>(null);
  const [prompt, setPrompt] = useState("Escribí un hook para Instagram sobre un viaje a Bariloche.");
  const [prioridad, setPrioridad] = useState<AiPrioridad>("calidad");
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((data) => setProviders(data.proveedores))
      .catch(() => setProviders([]));
    fetch("/api/ai/media-status")
      .then((r) => r.json())
      .then((data) => setMediaProviders(data.proveedores))
      .catch(() => setMediaProviders([]));
  }, []);

  const hayTextoConfigurado = providers?.some((p) => p.tasks.includes("texto") && p.configurado);

  const handleProbar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: "texto", prompt, prioridad }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error desconocido.");
      } else {
        setResultado(`[${data.proveedor}] ${data.texto}`);
      }
    } catch {
      setError("No se pudo contactar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <Cpu className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">AI Model Hub</h1>
          <p className="mt-1 text-gray-500">
            Routing server-side hacia proveedores de IA. Las claves nunca se exponen al navegador: viven solo en
            variables de entorno del servidor. AUTO MODE elige el proveedor configurado que mejor se ajusta a la
            prioridad pedida (calidad, velocidad o costo).
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TASK_CATEGORIAS.map((cat) => {
          const deTexto = providers?.filter((p) => p.tasks.includes(cat.id)) ?? [];
          const deMedia = mediaProviders?.filter((p) => p.capacidad === cat.id) ?? [];
          return (
            <Card key={cat.id}>
              <CardBody>
                <p className="mb-2 text-sm font-bold text-navy">{cat.label}</p>
                {deTexto.length === 0 && deMedia.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin proveedores conectados todavía.</p>
                ) : (
                  <div className="space-y-1.5">
                    {deTexto.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-navy">{p.label}</span>
                        {p.configurado ? (
                          <Badge className="bg-green-light text-green-dark">
                            <Check className="h-3 w-3" /> Configurado
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500">
                            <X className="h-3 w-3" /> Falta {p.envVar}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {deMedia.map((p) => (
                      <div key={p.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy">{p.label}</span>
                          {p.configurado ? (
                            <Badge className="bg-green-light text-green-dark">
                              <Check className="h-3 w-3" /> Configurado
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500">
                              <X className="h-3 w-3" /> Falta {p.envVars.join(", ")}
                            </Badge>
                          )}
                        </div>
                        {!p.configurado && <p className="text-xs text-gray-400">{p.comoConfigurar}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green" />
            <p className="font-bold text-navy">Probar AUTO MODE (texto)</p>
          </div>

          {!hayTextoConfigurado && providers != null && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              No hay ningún proveedor de texto configurado todavía. Agregá <code>ANTHROPIC_API_KEY</code>,{" "}
              <code>OPENAI_API_KEY</code> o <code>GOOGLE_GENERATIVE_AI_API_KEY</code> en <code>.env.local</code>{" "}
              (server-side, nunca <code>NEXT_PUBLIC_</code>) para probar una generación real.
            </p>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-navy outline-none focus:border-green/40 focus:ring-4 focus:ring-green/10"
          />
          <Select
            label="Prioridad"
            value={prioridad}
            onChange={(v) => setPrioridad(v as AiPrioridad)}
            options={[
              { value: "calidad", label: "Calidad" },
              { value: "velocidad", label: "Velocidad" },
              { value: "costo", label: "Costo" },
            ]}
          />
          <Button onClick={handleProbar} disabled={loading}>
            {loading ? "Generando…" : "Generar con AUTO MODE"}
          </Button>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {resultado && <p className="whitespace-pre-line rounded-xl bg-gray-50 p-3 text-sm text-navy">{resultado}</p>}
        </CardBody>
      </Card>
    </div>
  );
}
