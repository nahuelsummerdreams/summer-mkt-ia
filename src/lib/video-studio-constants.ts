import type { TipoContenidoVideo } from "./types";

export const TIPOS_CONTENIDO: { id: TipoContenidoVideo; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram-reel", label: "Instagram Reel" },
  { id: "youtube-short", label: "YouTube Short" },
  { id: "publicidad", label: "Publicidad" },
  { id: "ugc", label: "UGC" },
  { id: "video-turistico", label: "Video turístico" },
  { id: "video-institucional", label: "Video institucional" },
  { id: "review", label: "Review" },
  { id: "tutorial", label: "Tutorial" },
  { id: "storytelling", label: "Storytelling" },
  { id: "presentacion-producto", label: "Presentación de producto" },
];

export const ESTILOS_VIDEO = [
  "Viral",
  "UGC",
  "Natural",
  "Profesional",
  "Comercial",
  "Emocional",
  "Divertido",
  "Premium",
  "Storytelling",
];
