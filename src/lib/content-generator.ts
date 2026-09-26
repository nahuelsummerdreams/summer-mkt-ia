import type { Product } from "./types";
import { formatCurrency, formatDateRange } from "./utils";

// Summer Content Studio — motor de generación creativa.
// Principio no negociable (spec §39 / §5): la IA nunca inventa precios,
// fechas, hoteles, vuelos ni disponibilidad. Todo dato concreto sale del
// producto real seleccionado; si falta información, se lo dice en
// `advertencias` en vez de completarlo con una suposición.

export type ContentObjetivo =
  | "vender"
  | "consultas"
  | "reconocimiento"
  | "inspiracion"
  | "educacion"
  | "engagement";

export type ContentPublico =
  | "turismo-joven"
  | "parejas"
  | "familias"
  | "grupos-amigos"
  | "empresas"
  | "premium";

export type ContentTono = "cercano" | "juvenil" | "premium" | "emocional" | "vendedor" | "profesional";

export type ContentEstilo = "viral" | "turismo-joven" | "premium" | "venta" | "experiencia" | "destino";

export const CONTENT_OBJETIVOS: { id: ContentObjetivo; label: string }[] = [
  { id: "vender", label: "Vender" },
  { id: "consultas", label: "Generar consultas" },
  { id: "reconocimiento", label: "Reconocimiento de marca" },
  { id: "inspiracion", label: "Inspiración" },
  { id: "educacion", label: "Educación" },
  { id: "engagement", label: "Engagement" },
];

export const CONTENT_PUBLICOS: { id: ContentPublico; label: string }[] = [
  { id: "turismo-joven", label: "Turismo Joven" },
  { id: "parejas", label: "Parejas" },
  { id: "familias", label: "Familias" },
  { id: "grupos-amigos", label: "Grupos de amigos" },
  { id: "empresas", label: "Empresas" },
  { id: "premium", label: "Viajeros premium" },
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
  { id: "turismo-joven", label: "Turismo Joven", descripcion: "Energético, divertido, social" },
  { id: "premium", label: "Premium", descripcion: "Elegante, aspiracional, cinematográfico" },
  { id: "venta", label: "Venta", descripcion: "Precio, beneficios, urgencia y CTA" },
  { id: "experiencia", label: "Experiencia", descripcion: "Emociones y recuerdos" },
  { id: "destino", label: "Destino", descripcion: "Foco en descubrir el lugar" },
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
  destino: string;
  fechas: string;
  dias: number;
  noches: number;
  precio: string;
  incluyeAereos: boolean;
  hotelNombre?: string;
  excursiones: string[];
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

function buildProductoSnapshot(p: Product): { snapshot: ProductoSnapshot; advertencias: string[] } {
  const advertencias: string[] = [];
  if (!p.hotelNombre) advertencias.push("El producto no tiene un hotel cargado: el contenido no menciona alojamiento.");

  const fechas = formatDateRange(p.fechaSalida, p.fechaRegreso);
  if (fechas === "—") advertencias.push("Las fechas de salida no están cargadas o son inválidas: el contenido no las menciona.");
  if (p.cupos != null && p.cupos <= 5) advertencias.push(`Quedan pocos cupos cargados (${p.cupos}): considerá mencionar urgencia real.`);

  const snapshot: ProductoSnapshot = {
    nombre: p.nombre,
    destino: p.destino,
    fechas,
    dias: p.dias,
    noches: p.noches,
    precio: formatCurrency(p.precioVenta, p.moneda),
    incluyeAereos: p.incluyeAereos,
    hotelNombre: p.hotelNombre,
    excursiones: p.excursionesIncluidas,
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

const HOOK_TEMPLATES: Record<ContentEstilo, (p: ProductoSnapshot) => string[]> = {
  viral: (p) => [
    `PARÁ DE HACER SCROLL 🛑 esto es lo que necesitás ver antes de elegir destino`,
    `No te vas a creer lo que incluye este viaje a ${p.destino} 👀`,
    `POV: encontraste el viaje a ${p.destino} que estabas buscando`,
  ],
  "turismo-joven": (p) => [
    `¿Vos y tu grupo ya eligieron a dónde van este año? 👀🎒`,
    `${p.destino} con amigos > ${p.destino} solo. Así de simple.`,
    `Armá el grupo, esto se arma solo 🙌`,
  ],
  premium: (p) => [
    `${p.destino}, tal como se lo merece tu próximo viaje.`,
    `Una experiencia diseñada para quienes no negocian los detalles.`,
    `El viaje que vas a recordar más que ningún otro.`,
  ],
  venta: (p) => [
    `${p.destino} desde ${p.precio}${p.incluyeAereos ? " con vuelos incluidos" : ""} 🔥`,
    `Cupos limitados para ${p.destino}. Así de simple.`,
    `Esto es lo que incluye tu viaje a ${p.destino} por ${p.precio}`,
  ],
  experiencia: (p) => [
    `Los recuerdos que vas a hacer en ${p.destino} no tienen precio (pero el viaje sí, y es este)`,
    `${p.noches} noches que vas a recordar toda la vida`,
    `Esto es lo que se siente llegar a ${p.destino}`,
  ],
  destino: (p) => [
    `Te presentamos ${p.destino} 🌎`,
    `3 cosas que no sabías de ${p.destino}`,
    `¿Por qué todo el mundo está viajando a ${p.destino}?`,
  ],
};

function buildHooks(snapshot: ProductoSnapshot, estilo: ContentEstilo, seed: number): string[] {
  const propios = HOOK_TEMPLATES[estilo](snapshot);
  const universal = `${snapshot.destino}: ${snapshot.dias} días / ${snapshot.noches} noches desde ${snapshot.precio}`;
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
  const bloques = [
    {
      visual: "Plano abierto del destino / imágenes del producto",
      texto: `Hook: ${HOOK_TEMPLATES[estilo](snapshot)[0]}`,
    },
    {
      visual: snapshot.hotelNombre ? `Imágenes del hotel ${snapshot.hotelNombre}` : "Imágenes del destino",
      texto: `${snapshot.destino} · ${snapshot.dias} días / ${snapshot.noches} noches ${emoji}`.trim(),
    },
    {
      visual: "Detalle de lo que incluye (aéreos, excursiones)",
      texto: [
        snapshot.incluyeAereos ? "✈️ Vuelos incluidos" : null,
        snapshot.excursiones.length > 0 ? `🗺️ ${snapshot.excursiones.length} excursión(es) incluida(s)` : null,
      ]
        .filter(Boolean)
        .join(" · ") || "Consultá todo lo que incluye este producto",
    },
    {
      visual: "Precio en pantalla + logo Summer",
      texto: `Desde ${snapshot.precio} · ${snapshot.fechas !== "—" ? snapshot.fechas : "Consultá fechas disponibles"}`,
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
    "turismo-joven": "Pop/electrónica energética",
    premium: "Cinematográfica, instrumental, crescendo suave",
    venta: "Ritmo marcado, urgencia, sin voces",
    experiencia: "Emotiva, acústica, in crescendo",
    destino: "Ambiental, world music según el destino",
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
      ? `${snapshot.destino} te está esperando ${emoji}`.trim()
      : objetivo === "reconocimiento"
      ? `Así viajamos ${emoji}`.trim()
      : objetivo === "inspiracion"
      ? `¿Ya pensaste en tu próximo viaje? ${snapshot.destino} es una gran opción ${emoji}`.trim()
      : `Contanos: ¿te imaginás en ${snapshot.destino}? ${emoji}`.trim();

  const datos = [
    `📍 ${snapshot.destino}`,
    snapshot.fechas !== "—" ? `📅 ${snapshot.fechas}` : null,
    `⏱️ ${snapshot.dias} días / ${snapshot.noches} noches`,
    snapshot.hotelNombre ? `🏨 ${snapshot.hotelNombre}` : null,
    snapshot.incluyeAereos ? "✈️ Vuelos incluidos" : null,
    `💰 Desde ${snapshot.precio}`,
  ]
    .filter(Boolean)
    .join("\n");

  const instagram = `${intro}\n\n${datos}\n\n${cta}`;
  const tiktok = `${intro} ${emoji}\n${snapshot.destino} desde ${snapshot.precio}. ${cta}`;
  const whatsapp = `Hola! 👋 Te comparto una propuesta para viajar a *${snapshot.destino}*.\n\n${datos}\n\n${cta}`;

  return { instagram, tiktok, whatsapp };
}

function buildHashtags(snapshot: ProductoSnapshot, publico: ContentPublico): string[] {
  const base = ["#SummerAI", "#Viajes", "#Turismo"];
  const destino = `#${snapshot.destino.replace(/\s+/g, "")}`;
  const publicoTag: Record<ContentPublico, string> = {
    "turismo-joven": "#TurismoJoven",
    parejas: "#ViajeEnPareja",
    familias: "#ViajeEnFamilia",
    "grupos-amigos": "#ViajeConAmigos",
    empresas: "#ViajesCorporativos",
    premium: "#TurismoPremium",
  };
  return [...base, destino, publicoTag[publico]];
}

function buildCta(objetivo: ContentObjetivo, tono: ContentTono): string {
  const emoji = TONO_EMOJI[tono];
  const ctas: Record<ContentObjetivo, string> = {
    vender: `Reservá tu lugar ahora 👉 escribinos por WhatsApp ${emoji}`.trim(),
    consultas: `Contanos qué buscás y te armamos una propuesta a medida ${emoji}`.trim(),
    reconocimiento: `Seguinos para descubrir más destinos ${emoji}`.trim(),
    inspiracion: `Guardá este posteo para cuando estés listo para viajar ${emoji}`.trim(),
    educacion: `¿Tenés dudas? Dejanos tu consulta en los comentarios ${emoji}`.trim(),
    engagement: `Contanos en los comentarios con quién te irías 👇`,
  };
  return ctas[objetivo];
}

function buildStories(snapshot: ProductoSnapshot, tono: ContentTono): StoryItem[] {
  const emoji = TONO_EMOJI[tono];
  return [
    { numero: 1, tipo: "pregunta", texto: `¿Te imaginás en ${snapshot.destino}? ${emoji}`.trim() },
    { numero: 2, tipo: "propuesta", texto: `Tenemos una propuesta para vos 🧳` },
    {
      numero: 3,
      tipo: "detalle",
      texto: `${snapshot.dias} días / ${snapshot.noches} noches${snapshot.hotelNombre ? ` · ${snapshot.hotelNombre}` : ""}`,
    },
    { numero: 4, tipo: "precio", texto: `Desde ${snapshot.precio}` },
    { numero: 5, tipo: "cta-whatsapp", texto: `Respondé "${snapshot.destino.toUpperCase()}" y te mandamos la propuesta completa` },
  ];
}

function buildCarrusel(snapshot: ProductoSnapshot): CarruselSlide[] {
  const slides: CarruselSlide[] = [{ numero: 1, titulo: `${snapshot.dias} días en ${snapshot.destino}`, texto: "Portada" }];
  let n = 2;
  if (snapshot.hotelNombre) slides.push({ numero: n++, titulo: `Hotel: ${snapshot.hotelNombre}` });
  if (snapshot.incluyeAereos) slides.push({ numero: n++, titulo: "Vuelos incluidos ✈️" });
  snapshot.excursiones.slice(0, 3).forEach((nombre) => {
    slides.push({ numero: n++, titulo: nombre });
  });
  slides.push({ numero: n++, titulo: `Desde ${snapshot.precio}` });
  slides.push({ numero: n++, titulo: "Pedí tu propuesta", texto: "CTA final" });
  return slides;
}

export function generateContentPack(
  product: Product,
  input: ContentGenerationInput,
  seed: number = Date.now()
): GeneratedContentPack {
  const { snapshot, advertencias } = buildProductoSnapshot(product);
  const hooks = buildHooks(snapshot, input.estilo, seed);
  const cta = buildCta(input.objetivo, input.tono);
  const reel = buildReel(snapshot, input.estilo, input.tono, input.duracionReel);
  const captions = buildCaptions(snapshot, input.tono, input.objetivo, cta);
  const hashtags = buildHashtags(snapshot, input.publico);
  const stories = buildStories(snapshot, input.tono);
  const carrusel = buildCarrusel(snapshot);

  return { producto: snapshot, hooks, reel, captions, hashtags, cta, stories, carrusel, advertencias };
}
