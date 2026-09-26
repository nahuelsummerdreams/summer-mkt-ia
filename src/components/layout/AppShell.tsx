"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  Package,
  Sparkles,
  Camera,
  Music2,
  CalendarDays,
  Rocket,
  Flame,
  MessageSquare,
  Users,
  Wallet,
  BarChart3,
  Cpu,
  FolderOpen,
  Star,
  Luggage,
  Settings,
  UserRound,
  Clapperboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/lib/business-store";
import { HelpAssistant } from "@/components/domain/HelpAssistant";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/summer-brain", label: "Summer Brain", icon: Brain },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/content-studio", label: "Content Studio", icon: Sparkles },
  { href: "/video-studio", label: "Video Studio", icon: Clapperboard },
  { href: "/ai-influencers", label: "AI Influencers", icon: UserRound },
  { href: "/instagram", label: "Instagram", icon: Camera },
  { href: "/tiktok", label: "TikTok", icon: Music2 },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/campanas", label: "Campañas", icon: Rocket },
  { href: "/tendencias", label: "Tendencias", icon: Flame },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/cotizaciones", label: "Cotizaciones", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-model-hub", label: "AI Model Hub", icon: Cpu },
  { href: "/biblioteca", label: "Biblioteca", icon: FolderOpen },
  { href: "/clientes", label: "Clientes", icon: Star },
  { href: "/postventa", label: "Postventa", icon: Luggage },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { business } = useBusiness();

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-navy lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <Sparkles className="h-6 w-6 text-green" />
          <span className="text-lg font-extrabold text-white">SUMMER AI</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-green text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-white/40">{business.nombre} · MVP interno</div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green" />
            <span className="font-extrabold text-navy">SUMMER AI</span>
          </div>
        </header>
        <main className="flex-1 pb-16 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-green" : "text-gray-400"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <HelpAssistant />
    </div>
  );
}
