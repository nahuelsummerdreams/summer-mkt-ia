"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export function Tabs({ items, defaultTab }: { items: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const activeItem = items.find((i) => i.id === active);

  return (
    <div>
      <div className="sticky top-[64px] z-20 -mx-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:mx-0 sm:px-0">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-3 text-sm font-semibold transition-colors",
                active === item.id
                  ? "border-green text-navy"
                  : "border-transparent text-gray-400 hover:text-navy"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="animate-fade-in py-6">{activeItem?.content}</div>
    </div>
  );
}
