# SUMMER AI

Sistema operativo de marketing, contenido y ventas para **Summer Dreams Viajes**.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- Mobile-first, responsive de 320px a 1440px+
- Catálogo mock en `src/lib/mock-data.ts` (`src/lib/types.ts` define el
  contrato `Product`), pensado para reemplazarse por un repositorio real
  (propio o compartido con el Seller Hub) sin tocar la UI.

## Estado del MVP

Módulo funcional:

- **Content Studio** (`/content-studio`) — genera hooks, guion de Reel,
  captions (Instagram/TikTok/WhatsApp), hashtags, CTA, Stories y slides de
  carrusel a partir de un producto real del catálogo. Regla no negociable:
  ningún dato concreto (precio, fechas, hotel) se inventa; si falta
  información se muestra como advertencia explícita.
- **Productos** (`/productos`) — catálogo de solo lectura, fuente de
  verdad de la IA.
- **Dashboard** (`/`) — accesos rápidos ("¿Qué querés hacer?").

El resto de los 18 módulos del sidebar (Summer Brain, Instagram, TikTok,
Calendario, Campañas, Tendencias, Inbox, Leads, Cotizaciones, Analytics,
AI Model Hub, Biblioteca, Clientes, Postventa, Configuración) están
navegables pero marcados como "Próximamente": son placeholders, no
funcionalidad simulada.

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run start
```
