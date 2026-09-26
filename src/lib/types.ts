// Entidades de SUMMER AI.
// Regla fundamental (spec §39): la app diferencia DATOS REALES (catálogo)
// de GENERACIÓN CREATIVA (ideas, hooks, guiones). Nunca se presenta una
// creación de IA como un dato real, ni se inventa información turística.
// Hoy estas interfaces las implementa un catálogo mock (`mock-data.ts`);
// el día que se conecte a Supabase (propio o el del Seller Hub), se
// reescribe solo `repositories/*`, sin tocar la UI.

export type ProductCategory =
  | "turismo-joven"
  | "nacional"
  | "brasil"
  | "caribe"
  | "internacional"
  | "cruceros"
  | "incoming"
  | "b2b";

export type ProductStatus = "activo" | "pausado" | "agotado";

export interface Product {
  id: string;
  nombre: string;
  categoria: ProductCategory;
  destino: string;
  pais: string;
  fechaSalida: string; // ISO
  fechaRegreso: string; // ISO
  dias: number;
  noches: number;
  hotelNombre?: string;
  tipoHabitacion?: string;
  incluyeAereos: boolean;
  aeropuertoSalida?: string;
  excursionesIncluidas: string[];
  precioVenta: number;
  moneda: "ARS" | "USD";
  cupos?: number;
  fechaLimiteReserva?: string;
  descripcion: string;
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
  destinoInteres?: string;
  fechaViaje?: string; // ISO — fecha concreta que el lead mencionó, no la del catálogo
  cantidadPasajeros?: number;
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
