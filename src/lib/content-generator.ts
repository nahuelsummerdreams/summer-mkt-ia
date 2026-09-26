import type { Product, VocabularioNegocio } from "./types";
import { formatCurrency, formatDate } from "./utils";

// Summer Content Studio — motor de generación creativa.
// Principio no negociable (spec §39 / §5): la IA nunca inventa precios,
// fechas ni disponibilidad. Todo dato concreto sale del producto real
// seleccionado (incluidos sus `atributos`, propios del rubro del
// negocio); si falta información, se lo dice en `advertencias` en vez de
// completarlo con una suposición.
//
// Genérico por diseño: nada acá asume turismo. `vocabulario` (paquete/
// plato/servicio/propiedad + pasajero/comensal/paciente/cliente) viene
// del Business configurado y es lo único que cambia el "vos" con el que
// la IA le habla al rubro del negocio.

export type ContentObjetivo =
  | "vender"
  | "consultas"
  | "reconocimiento"
  | "inspiracion"
  | "educacion"
  | "engagement";

export type ContentPublico = "jovenes" | "parejas" | "familias" | "grupos" | "empresas" | "premium";

export type ContentTono = "cercano" | "juvenil" | "premium" | "emocional" | "vendedor" | "profesional";

export type ContentEstilo = "viral" | "social" | "premium" | "venta" | "experiencia" | "protagonista";

export const CONTENT_OBJETIVOS: { id: ContentObjetivo; label: string }[] = [
  { id: "vender", label: "Vender" },
  { id: "consultas", label: "Generar consultas" },
  { id: "reconocimiento", label: "Reconocimiento de marca" },
  { id: "inspiracion", label: "Inspiración" },
  { id: "educacion", label: "Educación" },
  { id: "engagement", label: "Engagement" },
];

export const CONTENT_PUBLICOS: { id: ContentPublico; label: string }[] = [
  { id: "jovenes", label: "Jóvenes" },
  { id: "parejas", label: "Parejas" },
  { id: "familias", label: "Familias" },
  { id: "grupos", label: "Grupos de amigos" },
  { id: "empresas", label: "Empresas" },
  { id: "premium", label: "Público premium" },
];

export const CONTENT_TONOS: { id: ContentTono; label: string }[] = [
  { id: "cercano", label: "Cercano" },
  { id: "juvenil", label: "Juvenil" },
  { id: "premium", label: "Premium" },
  { id: "emocional", label: "Emocional" },
  { id: "vendedor", label: "Vendedor" },
  { id: "profesional", label: "Profesional" },
];

export const CONTENT_ESTILOS: { id: ContentEstilo; label: string; descripcion: string }[] = [
  { id: "viral", label: "Viral", descripcion: "Rápido, dinámico, hook fuerte" },
  { id: "social", label: "Social", descripcion: "Energético, divertido, para compartir" },
  { id: "premium", label: "Premium", descripcion: "Elegante, aspiracional, cinematográfico" },
  { id: "venta", label: "Venta", descripcion: "Precio, beneficios, urgencia y CTA" },
  { id: "experiencia", label: "Experiencia", descripcion: "Emociones y recuerdos" },
  { id: "protagonista", label: "Protagonista", descripcion: "Foco en descubrir el producto/servicio" },
];

export const CONTENT_DURACIONES = [10, 15, 30, 45, 60] as const;

export interface ContentGenerationInput {
  objetivo: ContentObjetivo;
  publico: ContentPublico;
  tono: ContentTono;
  estilo: ContentEstilo;
  duracionReel: (typeof CONTENT_DURACIONES)[number];
}

export interface ProductoSnapshot {
  nombre: string;
  itemSingular: string;
  itemPlural: string;
  precio: string;
  atributos: { clave: string; valor: string }[];
  atributoDestacado?: { clave: string; valor: string };
  fechaLimite?: string;
  cupos?: number;
}

export interface ReelEscena {
  numero: number;
  duracion: string;
  visual: string;
  texto: string;
}

export interface StoryItem {
  numero: number;
  tipo: string;
  texto: string;
}

export interface CarruselSlide {
  numero: number;
  titulo: string;
  texto?: string;
}

export interface GeneratedContentPack {
  producto: ProductoSnapshot;
  hooks: string[];
  reel: {
    duracion: number;
    escenas: ReelEscena[];
    vozOff: string;
    musicaSugerida: string;
  };
  captions: { instagram: string; tiktok: string; whatsapp: string };
  hashtags: string[];
  cta: string;
  stories: StoryItem[];
  carrusel: CarruselSlide[];
  advertencias: string[];
}

function buildProductoSnapshot(
  p: Product,
  vocabulario: VocabularioNegocio
): { snapshot: ProductoSnapshot; advertencias: string[] } {
  const advertencias: string[] = [];
  const atributos = Object.entries(p.atributos).map(([clave, valor]) => ({ clave, valor }));
  if (atributos.length === 0) {
    advertencias.push(`Este ${vocabulario.itemSingular} no tiene atributos cargados: el contenido va a ser genérico.`);
  }
  if (p.cupos != null && p.cupos <= 5) {
    advertencias.push(`Quedan pocos cupos cargados (${p.cupos}): considerá mencionar urgencia real.`);
  }

  const snapshot: ProductoSnapshot = {
    nombre: p.nombre,
    itemSingular: vocabulario.itemSingular,
    itemPlural: vocabulario.itemPlural,
    precio: formatCurrency(p.precio, p.moneda),
    atributos,
    atributoDestacado: atributos[0],
    fechaLimite: p.fechaLimite ? formatDate(p.fechaLimite) : undefined,
    cupos: p.cupos,
  };
  return { snapshot, advertencias };
}

const TONO_EMOJI: Record<ContentTono, string> = {
  cercano: "😊",
  juvenil: "🔥",
  premium: "✨",
  emocional: "💛",
  vendedor: "🚀",
  profesional: "",
};

function detalleClave(p: ProductoSnapshot): string {
  return p.atributoDestacado ? p.atributoDestacado.valor : p.nombre;
}

const HOOK_TEMPLATES: Record<ContentEstilo, (p: ProductoSnapshot) => string[]> = {
  viral: (p) => [
    `PARÁ DE HACER SCROLL 🛑 esto es lo que necesitás ver antes de decidir`,
    `No te vas a creer lo que incluye este ${p.itemSingular} 👀`,
    `POV: encontraste el ${p.itemSingular} que estabas buscando`,
  ],
  social: (p) => [
    `¿Ya conocés ${p.nombre}? 👀`,
    `${p.nombre}: la mejor opción para compartir con amigos.`,
    `Armá el grupo, esto se arma solo 🙌`,
  ],
  premium: (p) => [
    `${p.nombre}, tal como se lo merece tu próxima elección.`,
    `Una experiencia diseñada para quienes no negocian los detalles.`,
    `${p.nombre}: lo que vas a recordar más que cualquier otra opción.`,
  ],
  venta: (p) => [
    `${p.nombre} desde ${p.precio} 🔥`,
    `Cupos limitados para ${p.nombre}. Así de simple.`,
    `Esto es lo que incluye ${p.nombre} por ${p.precio}`,
  ],
  experiencia: (p) => [
    `Lo que vas a vivir con ${p.nombre} no tiene precio (pero el ${p.itemSingular} sí, y es este)`,
    `${p.nombre}: una experiencia que vas a recordar.`,
    `Esto es lo que se siente elegir ${p.nombre}`,
  ],
  protagonista: (p) => [
    `Te presentamos ${p.nombre} 🌟`,
    `3 cosas que no sabías de ${detalleClave(p)}`,
    `¿Por qué todos están eligiendo ${p.nombre}?`,
  ],
};

function buildHooks(snapshot: ProductoSnapshot, estilo: ContentEstilo, seed: number): string[] {
  const propios = HOOK_TEMPLATES[estilo](snapshot);
  const universal = `${snapshot.nombre}: desde ${snapshot.precio}`;
  const combinadas = [...propios, universal];
  const offset = ((seed % combinadas.length) + combinadas.length) % combinadas.length;
  const rotated = combinadas.slice(offset).concat(combinadas.slice(0, offset));
  return rotated.slice(0, 4);
}

function buildReel(
  snapshot: ProductoSnapshot,
  estilo: ContentEstilo,
  tono: ContentTono,
  duracion: number
): GeneratedContentPack["reel"] {
  const emoji = TONO_EMOJI[tono];
  const detalles = snapshot.atributos.slice(0, 2);
  const bloques = [
    {
      visual: `Plano abierto / imágenes de ${snapshot.nombre}`,
      texto: `Hook: ${HOOK_TEMPLATES[estilo](snapshot)[0]}`,
    },
    {
      visual: detalles[0] ? `Imágenes mostrando: ${detalles[0].valor}` : `Imágenes de ${snapshot.nombre}`,
      texto: `${snapshot.nombre} ${emoji}`.trim(),
    },
    {
      visual: "Detalle de lo que incluye",
      texto: detalles.length > 0 ? detalles.map((d) => `${d.clave}: ${d.valor}`).join(" · ") : `Consultá todo lo que incluye este ${snapshot.itemSingular}`,
    },
    {
      visual: "Precio en pantalla + logo de marca",
      texto: `Desde ${snapshot.precio}${snapshot.fechaLimite ? ` · hasta el ${snapshot.fechaLimite}` : ""}`,
    },
    {
      visual: "CTA final con botón/flecha de WhatsApp",
      texto: "👉 Escribinos y te armamos tu propuesta",
    },
  ];

  const escenas: ReelEscena[] = bloques.map((b, i) => ({
    numero: i + 1,
    duracion: `${Math.round((duracion / bloques.length) * i)}s–${Math.round((duracion / bloques.length) * (i + 1))}s`,
    visual: b.visual,
    texto: b.texto,
  }));

  const vozOff = escenas.map((e) => e.texto).join(" · ");
  const musicaPorEstilo: Record<ContentEstilo, string> = {
    viral: "Audio en tendencia, ritmo rápido y percusivo",
    social: "Pop/electrónica energética",
    premium: "Cinematográfica, instrumental, crescendo suave",
    venta: "Ritmo marcado, urgencia, sin voces",
    experiencia: "Emotiva, acústica, in crescendo",
    protagonista: "Ambiental, acorde al rubro del negocio",
  };

  return { duracion, escenas, vozOff, musicaSugerida: musicaPorEstilo[estilo] };
}

function buildCaptions(
  snapshot: ProductoSnapshot,
  tono: ContentTono,
  objetivo: ContentObjetivo,
  cta: string
): GeneratedContentPack["captions"] {
  const emoji = TONO_EMOJI[tono];
  const intro =
    objetivo === "vender"
      ? `${snapshot.nombre} te está esperando ${emoji}`.trim()
      : objetivo === "reconocimiento"
      ? `Así trabajamos ${emoji}`.trim()
      : objetivo === "inspiracion"
      ? `¿Ya pensaste en ${snapshot.nombre}? Es una gran opción ${emoji}`.trim()
      : `Contanos: ¿te interesa ${snapshot.nombre}? ${emoji}`.trim();

  const datos = [
    `✨ ${snapshot.nombre}`,
    ...snapshot.atributos.slice(0, 3).map((a) => `📌 ${a.clave}: ${a.valor}`),
    snapshot.fechaLimite ? `📅 Hasta el ${snapshot.fechaLimite}` : null,
    `💰 Desde ${snapshot.precio}`,
  ]
    .filter(Boolean)
    .join("\n");

  const instagram = `${intro}\n\n${datos}\n\n${cta}`;
  const tiktok = `${intro} ${emoji}\n${snapshot.nombre} desde ${snapshot.precio}. ${cta}`;
  const whatsapp = `Hola! 👋 Te comparto una propuesta sobre *${snapshot.nombre}*.\n\n${datos}\n\n${cta}`;

  return { instagram, tiktok, whatsapp };
}

function buildHashtags(snapshot: ProductoSnapshot, publico: ContentPublico): string[] {
  const base = ["#SummerAI", `#${snapshot.itemPlural.replace(/\s+/g, "")}`];
  const nombreTag = `#${snapshot.nombre.replace(/\s+/g, "")}`;
  const publicoTag: Record<ContentPublico, string> = {
    jovenes: "#Jovenes",
    parejas: "#Parejas",
    familias: "#Familias",
    grupos: "#Grupos",
    empresas: "#Empresas",
    premium: "#Premium",
  };
  return [...base, nombreTag, publicoTag[publico]];
}

function buildCta(objetivo: ContentObjetivo, tono: ContentTono): string {
  const emoji = TONO_EMOJI[tono];
  const ctas: Record<ContentObjetivo, string> = {
    vender: `Reservá tu lugar ahora 👉 escribinos por WhatsApp ${emoji}`.trim(),
    consultas: `Contanos qué buscás y te armamos una propuesta a medida ${emoji}`.trim(),
    reconocimiento: `Seguinos para descubrir más novedades ${emoji}`.trim(),
    inspiracion: `Guardá este posteo para cuando estés listo ${emoji}`.trim(),
    educacion: `¿Tenés dudas? Dejanos tu consulta en los comentarios ${emoji}`.trim(),
    engagement: `Contanos en los comentarios qué te parece 👇`,
  };
  return ctas[objetivo];
}

function buildStories(snapshot: ProductoSnapshot, tono: ContentTono): StoryItem[] {
  const emoji = TONO_EMOJI[tono];
  return [
    { numero: 1, tipo: "pregunta", texto: `¿Te interesa ${snapshot.nombre}? ${emoji}`.trim() },
    { numero: 2, tipo: "propuesta", texto: `Tenemos una propuesta para vos 🙌` },
    {
      numero: 3,
      tipo: "detalle",
      texto: snapshot.atributoDestacado ? `${snapshot.atributoDestacado.clave}: ${snapshot.atributoDestacado.valor}` : snapshot.nombre,
    },
    { numero: 4, tipo: "precio", texto: `Desde ${snapshot.precio}` },
    { numero: 5, tipo: "cta-whatsapp", texto: `Respondé "${snapshot.nombre.toUpperCase()}" y te mandamos la propuesta completa` },
  ];
}

function buildCarrusel(snapshot: ProductoSnapshot): CarruselSlide[] {
  const slides: CarruselSlide[] = [{ numero: 1, titulo: snapshot.nombre, texto: "Portada" }];
  let n = 2;
  snapshot.atributos.slice(0, 4).forEach((a) => {
    slides.push({ numero: n++, titulo: `${a.clave}: ${a.valor}` });
  });
  slides.push({ numero: n++, titulo: `Desde ${snapshot.precio}` });
  slides.push({ numero: n++, titulo: "Pedí tu propuesta", texto: "CTA final" });
  return slides;
}

export function generateContentPack(
  product: Product,
  vocabulario: VocabularioNegocio,
  input: ContentGenerationInput,
  seed: number = Date.now()
): GeneratedContentPack {
  const { snapshot, advertencias } = buildProductoSnapshot(product, vocabulario);
  const hooks = buildHooks(snapshot, input.estilo, seed);
  const cta = buildCta(input.objetivo, input.tono);
  const reel = buildReel(snapshot, input.estilo, input.tono, input.duracionReel);
  const captions = buildCaptions(snapshot, input.tono, input.objetivo, cta);
  const hashtags = buildHashtags(snapshot, input.publico);
  const stories = buildStories(snapshot, input.tono);
  const carrusel = buildCarrusel(snapshot);

  return { producto: snapshot, hooks, reel, captions, hashtags, cta, stories, carrusel, advertencias };
}
