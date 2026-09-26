"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, RefreshCw, Send, TriangleAlert, Lightbulb } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import { suggestReply } from "@/lib/whatsapp-assistant";

interface InboxMessage {
  id: string;
  telefono: string;
  nombre?: string;
  texto: string;
  direccion: "entrante" | "saliente";
  timestamp: string;
}

export default function InboxPage() {
  const [mensajes, setMensajes] = useState<InboxMessage[]>([]);
  const [configurado, setConfigurado] = useState<boolean | null>(null);
  const [cargando, setCargando] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMensajes = () =>
    fetch("/api/whatsapp/messages")
      .then((r) => r.json())
      .then((data) => {
        setMensajes(data.mensajes ?? []);
        setConfigurado(data.configurado);
      })
      .catch(() => setError("No se pudo cargar el inbox."));

  const cargar = () => {
    setCargando(true);
    fetchMensajes().finally(() => setCargando(false));
  };

  useEffect(() => {
    fetchMensajes();
  }, []);

  const conversaciones = useMemo(() => {
    const porTelefono = new Map<string, InboxMessage[]>();
    mensajes.forEach((m) => {
      const lista = porTelefono.get(m.telefono) ?? [];
      lista.push(m);
      porTelefono.set(m.telefono, lista);
    });
    return [...porTelefono.entries()].map(([telefono, msgs]) => ({
      telefono,
      nombre: msgs.find((m) => m.nombre)?.nombre,
      mensajes: msgs,
      ultimo: msgs[0],
    }));
  }, [mensajes]);

  const handleEnviar = async (telefono: string) => {
    const texto = respuestas[telefono]?.trim();
    if (!texto) return;
    setEnviando(telefono);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: telefono, texto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setRespuestas((prev) => ({ ...prev, [telefono]: "" }));
        cargar();
      }
    } catch {
      setError("No se pudo contactar al servidor.");
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-green" />
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Inbox</h1>
            <p className="mt-1 text-gray-500">WhatsApp Business Platform (Cloud API).</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={cargar} disabled={cargando}>
          <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {configurado === false && (
        <Card className="border-amber-200 bg-amber-50">
          <CardBody className="flex items-start gap-3 text-sm text-amber-700">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">WhatsApp todavía no está conectado.</p>
              <p className="mt-1">
                Requiere registrar una app en developers.facebook.com, verificar un número business, generar un
                access token y registrar el webhook <code>/api/whatsapp/webhook</code> con tu
                <code> WHATSAPP_VERIFY_TOKEN</code>. Variables server-side: WHATSAPP_ACCESS_TOKEN,
                WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID, WHATSAPP_VERIFY_TOKEN.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="text-sm text-red-600">{error}</CardBody>
        </Card>
      )}

      {conversaciones.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Todavía no hay conversaciones"
          description="Los mensajes entrantes aparecen acá en cuanto Meta empiece a mandarlos al webhook."
        />
      ) : (
        <div className="space-y-4">
          {conversaciones.map((conv) => {
            const sugerencia = suggestReply(conv.ultimo.texto, products);
            return (
              <Card key={conv.telefono}>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy">{conv.nombre ?? conv.telefono}</p>
                    <Badge>{conv.mensajes.length} mensaje(s)</Badge>
                  </div>

                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {[...conv.mensajes].reverse().map((m) => (
                      <p
                        key={m.id}
                        className={`w-fit max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                          m.direccion === "entrante" ? "bg-gray-100 text-navy" : "ml-auto bg-green-light text-green-dark"
                        }`}
                      >
                        {m.texto}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-2.5 text-xs text-blue-700">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{sugerencia.texto}</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={respuestas[conv.telefono] ?? sugerencia.texto}
                      onChange={(e) => setRespuestas((prev) => ({ ...prev, [conv.telefono]: e.target.value }))}
                      className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-navy outline-none focus:border-green/40"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleEnviar(conv.telefono)}
                      disabled={enviando === conv.telefono || !configurado}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Enviar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
