import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PostsProvider } from "@/lib/posts-store";
import { MediaProvider } from "@/lib/media-store";
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
          <MediaProvider>
            <AppShell>{children}</AppShell>
          </MediaProvider>
        </PostsProvider>
      </body>
    </html>
  );
}
