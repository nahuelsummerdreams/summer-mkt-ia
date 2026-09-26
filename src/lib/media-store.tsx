"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { MediaAsset } from "./types";

// Store en memoria de la Biblioteca (mismo patrón que posts-store.tsx).

interface MediaState {
  assets: MediaAsset[];
  addAsset: (asset: MediaAsset) => void;
  updateAsset: (id: string, patch: Partial<MediaAsset>) => void;
  deleteAsset: (id: string) => void;
}

const MediaContext = createContext<MediaState | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const value = useMemo<MediaState>(
    () => ({
      assets,
      addAsset: (asset) => setAssets((prev) => [asset, ...prev]),
      updateAsset: (id, patch) => setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      deleteAsset: (id) => setAssets((prev) => prev.filter((a) => a.id !== id)),
    }),
    [assets]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia debe usarse dentro de MediaProvider");
  return ctx;
}
