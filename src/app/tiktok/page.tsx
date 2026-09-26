import { Music2 } from "lucide-react";
import { PostsBoard } from "@/components/domain/PostsBoard";

export default function TikTokPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <Music2 className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">TikTok</h1>
          <p className="mt-1 text-gray-500">
            Borrador → revisión → aprobación → programado. Las piezas se generan en Content Studio y se guardan acá.
          </p>
        </div>
      </div>
      <PostsBoard plataforma="tiktok" />
    </div>
  );
}
