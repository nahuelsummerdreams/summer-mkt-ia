// Entidades de SUMMER AI.
// Regla fundamental (spec §39): la app diferencia DATOS REALES (catálogo)
// de GENERACIÓN CREATIVA (ideas, hooks, guiones). Nunca se presenta una
// creación de IA como un dato real, ni se inventa información turística.
// Hoy estas interfaces las implementa un catálogo mock (`mock-data.ts`);
// el día que se conecte a Supabase (propio o el del Seller Hub), se
// reescribe solo `repositories/*`, sin tocar la UI.

// SUMMER AI es multi-negocio: cada cuenta configura su propio Business
// (rubro.ts + vocabulario) y su catálogo usa el mismo esquema genérico de
// Product para cualquier rubro. Lo específico del rubro (destino/hotel en
// turismo, ingredientes en gastronomía, duración de sesión en salud, etc.)
// vive en `atributos` — nunca como campos fijos — así el generador de
// contenido puede citarlos sin que el modelo de datos asuma un rubro.

export type Rubro =
  | "turismo"
  | "gastronomia"
  | "salud-bienestar"
  | "fitness"
  | "belleza"
  | "educacion"
  | "inmobiliaria"
  | "retail"
  | "servicios-profesionales"
  | "tecnologia"
  | "otro";

export interface VocabularioNegocio {
  itemSingular: string; // "paquete" | "plato" | "servicio" | "clase" | "propiedad" | "producto"
  itemPlural: string;
  clienteSingular: string; // "pasajero" | "comensal" | "paciente" | "alumno" | "cliente"
  clientePlural: string;
}

export interface Business {
  id: string;
  nombre: string;
  rubro: Rubro;
  vocabulario: VocabularioNegocio;
  colorPrimario: string;
  colorSecundario: string;
  tono: string;
  descripcion: string;
  whatsapp?: string;
  instagram?: string;
  web?: string;
  hashtags: string[];
  logoUrl?: string;
}

export type ProductStatus = "activo" | "pausado" | "agotado";

export interface Product {
  id: string;
  nombre: string;
  categoria: string; // libre — no atado a un rubro específico
  descripcion: string;
  precio: number;
  moneda: "ARS" | "USD";
  fechaLimite?: string; // ISO — promoción, reserva o cupo con fecha límite (aplica a cualquier rubro)
  cupos?: number; // disponibilidad limitada, si el rubro la maneja
  atributos: Record<string, string>; // detalles propios del rubro: destino/hotel, ingredientes, duración de sesión, m2, etc.
  imagenPortada: string;
  publicoObjetivo: string[];
  estado: ProductStatus;
}

// CRM — Leads (spec §18/§19). El scoring (HOT/WARM/COLD) se calcula en
// `lead-scoring.ts` a partir de estas señales; nunca se guarda como campo
// fijo para que la explicación siempre refleje el estado actual del lead.

export type LeadOrigin = "web" | "instagram" | "whatsapp" | "referido" | "otro";

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "cotizando"
  | "negociacion"
  | "reservado"
  | "vendido"
  | "perdido"
  | "seguimiento";

export interface Lead {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  origen: LeadOrigin;
  instagram?: string;
  interesEn?: string; // lo que el lead mencionó que le interesa (un destino, un plato, una propiedad, un servicio...)
  fechaConcreta?: string; // ISO — fecha concreta que el lead mencionó, no la del catálogo
  cantidadPersonas?: number;
  presupuesto?: number;
  productoId?: string;
  pidioMediosPago?: boolean;
  estado: LeadStatus;
  vendedor?: string;
  ultimaInteraccion: string; // ISO
  proximaAccion?: string;
  notas?: string;
  createdAt: string;
}

// Instagram/TikTok Manager (spec §12/§13). Pipeline explícito
// BORRADOR → REVISIÓN → APROBADO → PROGRAMADO → PUBLICADO (spec §33):
// nada se publica solo. El paso a "publicado" requiere una integración
// real con Meta/TikTok que hoy no está conectada — ver lib/integrations.ts.

export type PostPlataforma = "instagram" | "tiktok";
export type PostFormato = "reel" | "story" | "carrusel";
export type PostEstado = "borrador" | "revision" | "aprobado" | "programado" | "publicado";

export interface Post {
  id: string;
  plataforma: PostPlataforma;
  formato: PostFormato;
  productoId: string;
  objetivo: string;
  publico: string;
  tono: string;
  estilo: string;
  duracionReel: number;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  estado: PostEstado;
  fechaProgramada?: string;
  createdAt: string;
  updatedAt: string;
}

// Summer Media Library (spec §26). El archivo vive como data URL en
// memoria del navegador para esta sesión — no hay storage persistente
// todavía (eso es Supabase Storage o similar, día 2). El etiquetado es
// real (IA de visión vía AI Model Hub) cuando hay un proveedor
// configurado; si no, queda pendiente y se puede etiquetar a mano.

export type MediaEstadoAnalisis = "pendiente" | "analizado" | "error";

export interface MediaAsset {
  id: string;
  nombre: string;
  url: string; // data URL
  mimeType: string;
  etiquetas: string[];
  descripcionIA?: string;
  proveedorIA?: string;
  estadoAnalisis: MediaEstadoAnalisis;
  errorAnalisis?: string;
  createdAt: string;
}

// AI Influencer Studio + Video Studio (spec del módulo "AI Influencer +
// Video Studio", §8-12, §32, §36). Regla no negociable: un influencer
// creado a partir de una persona real (Digital Twin) exige consentimiento
// explícito con timestamp — el sistema no está diseñado para facilitar
// suplantación sin autorización. El "Character ID" (este mismo id) es lo
// que un proveedor de video/imagen real usaría como referencia de
// consistencia entre escenas — hoy no hay proveedor conectado, pero el
// campo ya existe para no rehacer el modelo cuando se conecte uno.

export type InfluencerGenero = "femenino" | "masculino" | "no-binario";
export type InfluencerPersonalidad =
  | "energetico"
  | "divertido"
  | "casual"
  | "profesional"
  | "elegante"
  | "aventurero"
  | "amigable"
  | "inspirador";
export type InfluencerNicho =
  | "turismo"
  | "viajes"
  | "lifestyle"
  | "gastronomia"
  | "tecnologia"
  | "negocios"
  | "moda"
  | "fitness"
  | "educacion";

export interface ConsentimientoUso {
  aceptado: boolean;
  texto: string;
  timestamp: string;
}

export interface Influencer {
  id: string;
  nombre: string;
  edadAparente: number;
  genero: InfluencerGenero;
  nacionalidad: string;
  idioma: string;
  acento: string;
  personalidad: InfluencerPersonalidad;
  nicho: InfluencerNicho;
  estiloVisual: string;
  vestimenta: string;
  descripcionFisica: string;
  nivelEnergia: "bajo" | "medio" | "alto";
  formaDeHablar: string;
  negativePrompts: string[];
  imagenReferenciaUrl?: string; // data URL de la foto de referencia, si vino de "Crear desde mi foto"
  esDigitalTwin: boolean;
  consentimiento?: ConsentimientoUso; // obligatorio si esDigitalTwin o imagenReferenciaUrl están presentes
  idsExternos: Record<string, string>; // ids que un proveedor real de video/imagen asigne a este Character ID
  createdAt: string;
}

export type TipoContenidoVideo =
  | "tiktok"
  | "instagram-reel"
  | "youtube-short"
  | "publicidad"
  | "ugc"
  | "video-turistico"
  | "video-institucional"
  | "review"
  | "tutorial"
  | "storytelling"
  | "presentacion-producto";

export type FormatoVideo = "9:16" | "16:9" | "1:1";
export type ModoGuion = "ia" | "propio";
export type EscenaEstado = "borrador" | "lista" | "generando" | "generada" | "error";

export interface Scene {
  id: string;
  numero: number;
  duracionSegundos: number;
  dialogo: string;
  accion: string;
  ubicacion: string;
  tipoPlano: string;
  movimientoCamara: string;
  iluminacion: string;
  ambiente: string;
  broll?: string;
  textoEnPantalla?: string;
  estado: EscenaEstado;
  advertenciaCalidad?: string;
  jobId?: string;
}

export interface VideoProject {
  id: string;
  nombre: string;
  tipoContenido: TipoContenidoVideo;
  formato: FormatoVideo;
  duracionObjetivo: number;
  productoId?: string;
  mensaje: string;
  estilo: string;
  modoGuion: ModoGuion;
  respetarGuion: boolean; // si true, la IA nunca reescribe el diálogo del usuario
  influencerId?: string;
  escenas: Scene[];
  estado: "borrador" | "guion-listo" | "generando" | "listo";
  createdAt: string;
  updatedAt: string;
}

// Generation Jobs (spec §32) — el trabajo real de generación de
// video/voz/avatar es asíncrono y depende de un proveedor externo. Sin
// uno configurado, el job pasa a "failed" con el motivo exacto en vez de
// simular un video que no existe.

export type GenerationJobTipo = "escena-video" | "voz" | "avatar-lipsync";
export type GenerationJobEstado = "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerationJob {
  id: string;
  tipo: GenerationJobTipo;
  proyectoId: string;
  escenaId?: string;
  estado: GenerationJobEstado;
  progreso: number;
  error?: string;
  resultUrl?: string;
  createdAt: string;
  updatedAt: string;
}
