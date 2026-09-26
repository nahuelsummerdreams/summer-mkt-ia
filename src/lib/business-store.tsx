"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Business } from "./types";
import { DEFAULT_BUSINESS } from "./business-constants";

// Configuración del negocio activo (mismo patrón que posts-store.tsx).
// Todo el resto de la app (Content Studio, Video Studio, Leads, Summer
// Brain, WhatsApp) lee `business.vocabulario` en vez de asumir "paquete"
// o "pasajero" — así la misma plataforma sirve para cualquier rubro.

interface BusinessState {
  business: Business;
  updateBusiness: (patch: Partial<Business>) => void;
}

const BusinessContext = createContext<BusinessState | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS);

  const value = useMemo<BusinessState>(
    () => ({
      business,
      updateBusiness: (patch) => setBusiness((prev) => ({ ...prev, ...patch })),
    }),
    [business]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness debe usarse dentro de BusinessProvider");
  return ctx;
}
