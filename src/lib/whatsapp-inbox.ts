import "server-only";

// Inbox de WhatsApp en memoria del proceso del servidor. Funciona bien en
// `next dev` / un servidor long-running; en un deploy serverless cada
// invocación puede correr en una instancia distinta y este array se
// reiniciaría — para producción real esto necesita una base de datos
// (Supabase, igual que el resto de la app). Se documenta acá en vez de
// simular persistencia que no existe.

export interface InboxMessage {
  id: string;
  telefono: string;
  nombre?: string;
  texto: string;
  direccion: "entrante" | "saliente";
  timestamp: string;
}

const MESSAGES: InboxMessage[] = [];

export function addMessage(msg: InboxMessage) {
  MESSAGES.unshift(msg);
}

export function getMessages(): InboxMessage[] {
  return MESSAGES;
}
