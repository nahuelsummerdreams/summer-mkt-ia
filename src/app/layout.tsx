import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PostsProvider } from "@/lib/posts-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUMMER AI",
  description: "Sistema operativo de marketing, contenido y ventas para Summer Dreams Viajes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PostsProvider>
          <AppShell>{children}</AppShell>
        </PostsProvider>
      </body>
    </html>
  );
}
