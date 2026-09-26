"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Post, PostEstado } from "./types";

// Store en memoria del pipeline de publicaciones (mismo espíritu que
// store.tsx en el Seller Hub): vive en React Context para que Content
// Studio y los managers de Instagram/TikTok compartan el mismo estado
// mientras se navega. El día que haya backend, se reescriben los setState
// por llamadas reales sin tocar la UI que los consume.

interface PostsState {
  posts: Post[];
  addPost: (post: Post) => void;
  updatePost: (id: string, patch: Partial<Post>) => void;
  setEstado: (id: string, estado: PostEstado) => void;
  deletePost: (id: string) => void;
}

const PostsContext = createContext<PostsState | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  const value = useMemo<PostsState>(
    () => ({
      posts,
      addPost: (post) => setPosts((prev) => [post, ...prev]),
      updatePost: (id, patch) =>
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
        ),
      setEstado: (id, estado) =>
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, estado, updatedAt: new Date().toISOString() } : p))),
      deletePost: (id) => setPosts((prev) => prev.filter((p) => p.id !== id)),
    }),
    [posts]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts debe usarse dentro de PostsProvider");
  return ctx;
}
