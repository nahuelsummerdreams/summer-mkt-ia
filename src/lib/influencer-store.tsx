"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Influencer } from "./types";

// Store en memoria de AI Influencers (mismo patrón que posts-store.tsx).
// El "Character ID" de cada influencer es su propio `id` — es lo que un
// proveedor real de video/imagen usaría como referencia de consistencia.

interface InfluencerState {
  influencers: Influencer[];
  addInfluencer: (inf: Influencer) => void;
  updateInfluencer: (id: string, patch: Partial<Influencer>) => void;
  deleteInfluencer: (id: string) => void;
}

const InfluencerContext = createContext<InfluencerState | null>(null);

export function InfluencerProvider({ children }: { children: ReactNode }) {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);

  const value = useMemo<InfluencerState>(
    () => ({
      influencers,
      addInfluencer: (inf) => setInfluencers((prev) => [inf, ...prev]),
      updateInfluencer: (id, patch) =>
        setInfluencers((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
      deleteInfluencer: (id) => setInfluencers((prev) => prev.filter((i) => i.id !== id)),
    }),
    [influencers]
  );

  return <InfluencerContext.Provider value={value}>{children}</InfluencerContext.Provider>;
}

export function useInfluencers() {
  const ctx = useContext(InfluencerContext);
  if (!ctx) throw new Error("useInfluencers debe usarse dentro de InfluencerProvider");
  return ctx;
}
