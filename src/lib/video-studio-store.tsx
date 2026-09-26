"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Scene, VideoProject } from "./types";

// Store en memoria de Video Studio (mismo patrón que posts-store.tsx).

interface VideoStudioState {
  proyectos: VideoProject[];
  addProyecto: (p: VideoProject) => void;
  updateProyecto: (id: string, patch: Partial<VideoProject>) => void;
  updateScene: (proyectoId: string, sceneId: string, patch: Partial<Scene>) => void;
  deleteProyecto: (id: string) => void;
}

const VideoStudioContext = createContext<VideoStudioState | null>(null);

export function VideoStudioProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<VideoProject[]>([]);

  const value = useMemo<VideoStudioState>(
    () => ({
      proyectos,
      addProyecto: (p) => setProyectos((prev) => [p, ...prev]),
      updateProyecto: (id, patch) =>
        setProyectos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
        ),
      updateScene: (proyectoId, sceneId, patch) =>
        setProyectos((prev) =>
          prev.map((p) =>
            p.id !== proyectoId
              ? p
              : {
                  ...p,
                  escenas: p.escenas.map((s) => (s.id === sceneId ? { ...s, ...patch } : s)),
                  updatedAt: new Date().toISOString(),
                }
          )
        ),
      deleteProyecto: (id) => setProyectos((prev) => prev.filter((p) => p.id !== id)),
    }),
    [proyectos]
  );

  return <VideoStudioContext.Provider value={value}>{children}</VideoStudioContext.Provider>;
}

export function useVideoStudio() {
  const ctx = useContext(VideoStudioContext);
  if (!ctx) throw new Error("useVideoStudio debe usarse dentro de VideoStudioProvider");
  return ctx;
}
