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
