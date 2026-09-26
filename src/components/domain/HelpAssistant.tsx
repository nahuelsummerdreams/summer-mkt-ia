"use client";

import { useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { products, leads } from "@/lib/mock-data";
import { useBusiness } from "@/lib/business-store";
import { generateHelpReply, buildAiHelpPrompt } from "@/lib/app-assistant";
import { cn } from "@/lib/utils";

interface ChatMessage {
  autor: "user" | "assistant";
  texto: string;
}

const SUGERENCIAS = [
  "¿Cómo genero contenido?",
  "¿Cómo creo un influencer?",
  "¿Cuántos leads calientes tengo?",
  "¿Cómo cambio el rubro?",
];

export function HelpAssistant() {
  const { business } = useBusiness();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<ChatMessage[]>([
    {
      autor: "assistant",
      texto: `¡Hola! 👋 Soy tu asistente de SUMMER AI. Preguntame cómo usar cualquier módulo, o sobre tus leads/${business.vocabulario.itemPlural} — no invento datos, siempre uso los reales.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (texto: string) => {
    const mensajeUsuario = texto.trim();
    if (!mensajeUsuario) return;
    setMensajes((prev) => [...prev, { autor: "user", texto: mensajeUsuario }]);
    setInput("");

    const ctx = { business, products, leads };
    const faq = generateHelpReply(mensajeUsuario, ctx);
    if (faq) {
      setMensajes((prev) => [...prev, { autor: "assistant", texto: faq }]);
      return;
    }

    setCargando(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: "texto", prompt: buildAiHelpPrompt(mensajeUsuario, ctx), prioridad: "velocidad" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensajes((prev) => [
          ...prev,
          {
            autor: "assistant",
            texto: `No tengo una respuesta preparada para eso y no hay un proveedor de IA conectado para buscarla (${data.error}). Probá reformular, o mirá los módulos del sidebar.`,
          },
        ]);
      } else {
        setMensajes((prev) => [...prev, { autor: "assistant", texto: data.texto }]);
      }
    } catch {
      setMensajes((prev) => [...prev, { autor: "assistant", texto: "No pude contactar al servidor. Probá de nuevo." }]);
    } finally {
      setCargando(false);
    }
  };

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green text-white shadow-lg shadow-green/30 hover:bg-green-dark lg:bottom-6 lg:right-6"
        aria-label="Abrir asistente de ayuda"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl lg:bottom-6 lg:right-6">
      <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-4.5 w-4.5" />
          <span className="text-sm font-bold">Asistente SUMMER AI</span>
        </div>
        <button onClick={() => setAbierto(false)} aria-label="Cerrar">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {mensajes.map((m, i) => (
          <p
            key={i}
            className={cn(
              "w-fit max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-sm",
              m.autor === "user" ? "ml-auto bg-green-light text-green-dark" : "bg-gray-100 text-navy"
            )}
          >
            {m.texto}
          </p>
        ))}
        {cargando && (
          <p className="flex w-fit items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Pensando…
          </p>
        )}
      </div>

      {mensajes.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:border-green/40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(input);
        }}
        className="flex items-center gap-2 border-t border-gray-200 p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Preguntame algo..."
          className="h-9 flex-1 rounded-xl bg-gray-50 px-3 text-sm text-navy outline-none focus:ring-2 focus:ring-green/20"
        />
        <button
          type="submit"
          disabled={cargando}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-green text-white disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
