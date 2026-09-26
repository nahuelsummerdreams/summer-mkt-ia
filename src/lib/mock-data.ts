import type { Lead, Product } from "./types";

// Catálogo mock de arranque para SUMMER AI. Mismo espíritu que
// `desktop-tutorial/src/lib/mock-data.ts`: datos desacoplados de la UI,
// listos para reemplazarse por un repositorio real (propio o compartido
// con el Seller Hub) sin tocar ninguna pantalla.
//
// Este catálogo de ejemplo es de turismo (el negocio real para el que se
// armó SUMMER AI primero) pero el esquema de Product es genérico —
// `atributos` es donde vive todo lo propio del rubro (destino, hotel,
// fechas). Un negocio de otro rubro carga su catálogo con las mismas
// entidades, solo cambian las claves de `atributos`.

export const products: Product[] = [
  {
    id: "vcp-friends",
    nombre: "VCP Friends",
    categoria: "turismo-joven",
    descripcion:
      "El clásico viaje de egresados/turismo joven a Villa Carlos Paz, con salidas nocturnas y excursiones grupales.",
    precio: 420000,
    moneda: "ARS",
    cupos: 40,
    fechaLimite: "2025-12-15",
    atributos: {
      destino: "Villa Carlos Paz, Argentina",
      duracion: "8 días / 7 noches",
      fechas: "10 al 17 de enero 2026",
      hotel: "Hotel Punta Piedras · habitación cuádruple",
      vuelos: "No incluye — traslado terrestre",
      excursiones: "Boliche Zeppelin, Rafting en el río, Noche de casino",
    },
    imagenPortada: "/productos/vcp-friends.jpg",
    publicoObjetivo: ["jovenes", "grupos"],
    estado: "activo",
  },
  {
    id: "brasil-floripa",
    nombre: "Floripa Friends",
    categoria: "brasil",
    descripcion: "Grupos de amigos en Florianópolis: playa, vida nocturna y aéreos incluidos desde Buenos Aires.",
    precio: 890000,
    moneda: "ARS",
    cupos: 30,
    fechaLimite: "2025-12-01",
    atributos: {
      destino: "Florianópolis, Brasil",
      duracion: "8 días / 7 noches",
      fechas: "20 al 27 de enero 2026",
      hotel: "Ingleses Praia Hotel · habitación triple",
      vuelos: "Incluidos, desde Aeroparque (AEP)",
      excursiones: "City tour por las playas, Paseo en lancha",
    },
    imagenPortada: "/productos/floripa-friends.jpg",
    publicoObjetivo: ["jovenes", "grupos"],
    estado: "activo",
  },
  {
    id: "caribe-punta-cana",
    nombre: "Punta Cana Premium",
    categoria: "caribe",
    descripcion: "Resort 5 estrellas all inclusive para parejas o viajeros premium que buscan una experiencia aspiracional.",
    precio: 1450000,
    moneda: "ARS",
    cupos: 12,
    fechaLimite: "2025-12-20",
    atributos: {
      destino: "Punta Cana, República Dominicana",
      duracion: "8 días / 7 noches",
      fechas: "5 al 12 de febrero 2026",
      hotel: "Riu Palace Punta Cana · doble all inclusive",
      vuelos: "Incluidos, desde Ezeiza (EZE)",
      excursiones: "Isla Saona",
    },
    imagenPortada: "/productos/punta-cana-premium.jpg",
    publicoObjetivo: ["parejas", "premium"],
    estado: "activo",
  },
];

// Las interacciones se generan relativas a "ahora" para que el ejemplo de
// Lead Scoring (señal de recencia) sea realista corriendo la app en
// cualquier fecha, en vez de quedar pegado a una fecha fija del pasado.
function daysAgoIso(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

export const leads: Lead[] = [
  {
    id: "lead-sofia",
    nombre: "Sofía",
    apellido: "Martínez",
    telefono: "5491122334455",
    email: "sofia.martinez@example.com",
    origen: "instagram",
    instagram: "@sofimartinez",
    interesEn: "Florianópolis",
    fechaConcreta: "2026-01-20",
    cantidadPersonas: 4,
    presupuesto: 900000,
    productoId: "brasil-floripa",
    pidioMediosPago: true,
    estado: "cotizando",
    vendedor: "Julieta Paz",
    ultimaInteraccion: daysAgoIso(0),
    proximaAccion: "Enviar cotización formal con medios de pago",
    notas: "Va con 3 amigas, ya vieron el hotel y preguntaron por seña.",
    createdAt: daysAgoIso(3),
  },
  {
    id: "lead-valentina",
    nombre: "Valentina",
    apellido: "Ruiz",
    telefono: "5491133445566",
    email: "valen.ruiz@example.com",
    origen: "whatsapp",
    interesEn: "Punta Cana",
    fechaConcreta: "2026-02-05",
    cantidadPersonas: 2,
    presupuesto: 1450000,
    productoId: "caribe-punta-cana",
    pidioMediosPago: true,
    estado: "negociacion",
    vendedor: "Julieta Paz",
    ultimaInteraccion: daysAgoIso(1),
    proximaAccion: "Confirmar disponibilidad de habitación doble",
    notas: "Viaje de aniversario, pidió factura A.",
    createdAt: daysAgoIso(8),
  },
  {
    id: "lead-lucas",
    nombre: "Lucas",
    apellido: "Fernández",
    telefono: "5491144556677",
    origen: "web",
    interesEn: "Villa Carlos Paz",
    cantidadPersonas: 6,
    productoId: "vcp-friends",
    estado: "interesado",
    vendedor: "Martín Olivera",
    ultimaInteraccion: daysAgoIso(1),
    proximaAccion: "Preguntar fecha y presupuesto del grupo",
    notas: "Grupo de egresados, todavía sin fecha definida.",
    createdAt: daysAgoIso(2),
  },
  {
    id: "lead-martina",
    nombre: "Martina",
    apellido: "Gómez",
    telefono: "5491155667788",
    email: "martina.gomez@example.com",
    origen: "referido",
    interesEn: "Punta Cana",
    fechaConcreta: "2026-02-10",
    presupuesto: 1300000,
    productoId: "caribe-punta-cana",
    estado: "contactado",
    vendedor: "Martín Olivera",
    ultimaInteraccion: daysAgoIso(15),
    proximaAccion: "Retomar contacto: no responde hace dos semanas",
    notas: "La recomendó una clienta anterior.",
    createdAt: daysAgoIso(20),
  },
  {
    id: "lead-tomas",
    nombre: "Tomás",
    apellido: "Ibarra",
    telefono: "5491166778899",
    origen: "web",
    interesEn: "Villa Carlos Paz",
    productoId: "vcp-friends",
    estado: "nuevo",
    ultimaInteraccion: daysAgoIso(20),
    proximaAccion: "Primer contacto",
    createdAt: daysAgoIso(20),
  },
  {
    id: "lead-bruno",
    nombre: "Bruno",
    apellido: "Silva",
    telefono: "5491177889900",
    origen: "instagram",
    instagram: "@brunosilva",
    interesEn: "Florianópolis",
    productoId: "brasil-floripa",
    estado: "perdido",
    vendedor: "Julieta Paz",
    ultimaInteraccion: daysAgoIso(30),
    notas: "Dijo que lo iba a pensar y dejó de responder.",
    createdAt: daysAgoIso(40),
  },
];
