import type { Business, Lead, Product } from "./types";
import { scoreLead } from "./lead-scoring";

// Asistente de ayuda de SUMMER AI ("Preguntale a Summer AI", spec §38).
// No es un chatbot de cara al cliente final (eso es el Inbox/WhatsApp
// Assistant) — este ayuda al usuario de la app a saber qué hacer y dónde.
// Mismo principio que el resto: FAQ instantánea por reglas primero (sin
// red, sin costo); si no reconoce la pregunta, se puede escalar a una
// consulta real al AI Model Hub, pero siempre grounded con datos reales
// (nunca inventa cuántos leads o productos hay).

export interface ModuloApp {
  ruta: string;
  nombre: string;
  descripcion: string;
}

export const MODULOS_APP: ModuloApp[] = [
  { ruta: "/", nombre: "Dashboard", descripcion: "accesos rápidos a las acciones más comunes" },
  { ruta: "/summer-brain", nombre: "Summer Brain", descripcion: "resumen diario: leads prioritarios, alertas y qué producto impulsar" },
  { ruta: "/productos", nombre: "Productos", descripcion: "catálogo real — fuente de verdad de toda la IA" },
  { ruta: "/content-studio", nombre: "Content Studio", descripcion: "genera hooks, guion de Reel, captions, Stories y carrusel a partir de un producto real" },
  { ruta: "/video-studio", nombre: "Video Studio", descripcion: "wizard idea → guion → influencer → escenas → video" },
  { ruta: "/ai-influencers", nombre: "AI Influencers", descripcion: "crear influencers digitales o tu Digital Twin (requiere consentimiento)" },
  { ruta: "/instagram", nombre: "Instagram", descripcion: "pipeline de publicaciones: borrador → revisión → aprobación → programado" },
  { ruta: "/tiktok", nombre: "TikTok", descripcion: "mismo pipeline que Instagram" },
  { ruta: "/calendario", nombre: "Calendario", descripcion: "un tema por día con el producto que mejor encaja" },
  { ruta: "/campanas", nombre: "Campañas", descripcion: "objetivo + fecha límite + presupuesto → estrategia y KPIs estimados" },
  { ruta: "/inbox", nombre: "Inbox", descripcion: "mensajes de WhatsApp Business (requiere conectar la API real)" },
  { ruta: "/leads", nombre: "Leads", descripcion: "CRM con scoring HOT/WARM/COLD explicado por señales reales" },
  { ruta: "/analytics", nombre: "Analytics", descripcion: "métricas comerciales y de negocio reales" },
  { ruta: "/ai-model-hub", nombre: "AI Model Hub", descripcion: "estado de los proveedores de IA (texto, visión, video, voz, avatar) y dónde conseguir cada key" },
  { ruta: "/biblioteca", nombre: "Biblioteca", descripcion: "subís fotos y la IA de visión las etiqueta automáticamente" },
  { ruta: "/configuracion", nombre: "Configuración", descripcion: "elegís el rubro de tu negocio y cómo se llama tu producto/cliente" },
];

interface FaqEntry {
  keys: string[];
  respuesta: (ctx: AppAssistantContext) => string;
}

export interface AppAssistantContext {
  business: Business;
  products: Product[];
  leads: Lead[];
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const FAQ: FaqEntry[] = [
  {
    keys: ["generar contenido", "content studio", "crear un reel", "hooks", "captions"],
    respuesta: (ctx) =>
      `Andá a Content Studio → elegí un ${ctx.business.vocabulario.itemSingular} real del catálogo → objetivo/público/tono/estilo → "Generar contenido". Si querés que lo mejore con IA real, tocá "Mejorar con IA" (necesita un proveedor conectado en AI Model Hub).`,
  },
  {
    keys: ["crear un video", "video studio", "hacer un video"],
    respuesta: () =>
      `En Video Studio tocá "Crear video": elegís tipo de contenido, formato, tu mensaje y el guion (con IA o pegando el tuyo). Después podés asignarle un AI Influencer. La generación del video real todavía necesita conectar un proveedor (Runway/Kling) — mirá AI Model Hub.`,
  },
  {
    keys: ["crear un influencer", "digital twin", "mi foto"],
    respuesta: () =>
      `En AI Influencers tocá "Crear influencer" y completá sus datos. Si es tu Digital Twin o subís una foto de referencia, te va a pedir el checkbox de consentimiento — es obligatorio, el sistema no permite saltearlo.`,
  },
  {
    keys: ["cambiar el rubro", "otro negocio", "no es turismo", "cambiar de rubro"],
    respuesta: () =>
      `En Configuración elegís tu rubro y se autocompleta el vocabulario (por ejemplo "plato"/"comensal" en gastronomía). Se aplica al toque en Content Studio, Leads, Campañas y Summer Brain.`,
  },
  {
    keys: ["conectar whatsapp", "whatsapp real", "inbox"],
    respuesta: () =>
      `Inbox usa WhatsApp Business Platform (Cloud API de Meta) — necesitás registrar una app en developers.facebook.com, verificar un número business y generar el access token. Los detalles exactos y las variables que faltan están en Inbox y en AI Model Hub.`,
  },
  {
    keys: ["conectar instagram", "publicar en instagram", "publicar en tiktok"],
    respuesta: () =>
      `Publicar de verdad en Instagram/TikTok requiere pasar la revisión de la app en Meta/TikTok for Developers — no alcanza con una key. Mientras tanto, el pipeline borrador → revisión → aprobación → programado ya funciona completo ahí.`,
  },
  {
    keys: ["leads calientes", "cuantos leads", "leads hot"],
    respuesta: (ctx) => {
      const hot = ctx.leads.filter((l) => scoreLead(l).nivel === "hot").length;
      return `Tenés ${ctx.leads.length} lead(s) en total, ${hot} de ellos en HOT ahora mismo. Los ves en Leads, y los prioritarios para contactar hoy están en Summer Brain.`;
    },
  },
  {
    keys: ["que producto impulsar", "que hago hoy", "resumen de hoy"],
    respuesta: () => `Eso te lo arma Summer Brain: entrá ahí para ver el resumen del día con datos reales de tus Leads y Productos.`,
  },
  {
    keys: ["conectar ia", "conectar una key", "api key", "proveedor de ia"],
    respuesta: () =>
      `En AI Model Hub ves, por categoría (Texto/Visión/Video/Voz/Avatar), qué proveedores están conectados y qué variable de entorno falta para cada uno que no lo esté.`,
  },
];

export function generateHelpReply(mensaje: string, ctx: AppAssistantContext): string | null {
  const query = normalize(mensaje);
  const match = FAQ.find((f) => f.keys.some((k) => query.includes(normalize(k))));
  return match ? match.respuesta(ctx) : null;
}

// Prompt grounded para cuando la pregunta no matchea la FAQ y hay un
// proveedor de texto conectado — nunca inventa datos de negocio, solo usa
// los que se le pasan explícitamente acá.
export function buildAiHelpPrompt(mensaje: string, ctx: AppAssistantContext): string {
  const hot = ctx.leads.filter((l) => scoreLead(l).nivel === "hot").length;
  const modulos = MODULOS_APP.map((m) => `- ${m.nombre} (${m.ruta}): ${m.descripcion}`).join("\n");

  return `Sos el asistente de ayuda de SUMMER AI, una plataforma de marketing/contenido/CRM con IA para el negocio "${ctx.business.nombre}" (rubro: ${ctx.business.rubro}).

Tu trabajo es ayudar al usuario a saber QUÉ MÓDULO usar y CÓMO, no generar contenido de marketing vos mismo. Respondé corto (2-4 líneas), en español, mencionando el nombre del módulo exacto.

MÓDULOS REALES DE LA APP (no inventes otros que no estén acá):
${modulos}

DATOS REALES DE ESTE NEGOCIO AHORA (no inventes otros números):
- ${ctx.products.length} producto(s)/${ctx.business.vocabulario.itemPlural} cargados
- ${ctx.leads.length} lead(s) en total, ${hot} en HOT

Vocabulario del negocio: le dicen "${ctx.business.vocabulario.itemSingular}" al producto y "${ctx.business.vocabulario.clienteSingular}" al cliente.

Pregunta del usuario: "${mensaje}"`;
}
