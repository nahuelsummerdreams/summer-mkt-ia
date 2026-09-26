import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { BusinessProvider } from "@/lib/business-store";
import { PostsProvider } from "@/lib/posts-store";
import { MediaProvider } from "@/lib/media-store";
import { InfluencerProvider } from "@/lib/influencer-store";
import { VideoStudioProvider } from "@/lib/video-studio-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUMMER AI",
  description: "Sistema operativo de marketing, contenido y ventas para Summer Dreams Viajes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <BusinessProvider>
          <PostsProvider>
            <MediaProvider>
              <InfluencerProvider>
                <VideoStudioProvider>
                  <AppShell>{children}</AppShell>
                </VideoStudioProvider>
              </InfluencerProvider>
            </MediaProvider>
          </PostsProvider>
        </BusinessProvider>
      </body>
    </html>
  );
}
