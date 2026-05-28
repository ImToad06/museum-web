"use server";

import { createClient } from "@/lib/supabase/server";
import type { Artwork, ArtworkFilter } from "@/types/database";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

type GetArtworksResponse =
  | { success: true; data: { artworks: Artwork[]; count: number; hasMore: boolean } }
  | { success: false; error: string };

export async function getArtworks(
  filters: ArtworkFilter = {}
): Promise<GetArtworksResponse> {
  try {
    const supabase = await createClient();
    const page = filters.page ?? DEFAULT_PAGE;
    const limit = filters.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("artworks")
      .select(
        `
        *,
        author:authors(id, name),
        style:styles(id, name, slug)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.style_slug) {
      query = query.eq("style.slug", filters.style_slug);
    }

    const { data, error, count } = await query;

    if (error) {
      return { success: false, error: "Error al cargar las obras" };
    }

    return {
      success: true,
      data: {
        artworks: (data as Artwork[]) || [],
        count: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    };
  } catch {
    return { success: false, error: "Error inesperado" };
  }
}

type GetArtworkResponse =
  | { success: true; data: Artwork }
  | { success: false; error: string };

export async function getArtworkById(id: string): Promise<GetArtworkResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        author:authors(id, name),
        style:styles(id, name, slug)
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return { success: false, error: "Obra no encontrada" };
    }

    return { success: true, data: data as Artwork };
  } catch {
    return { success: false, error: "Error inesperado" };
  }
}

type GetFeaturedResponse =
  | { success: true; data: Artwork | null }
  | { success: false; error: string };

export async function getFeaturedArtwork(): Promise<GetFeaturedResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        author:authors(id, name),
        style:styles(id, name, slug)
      `
      )
      .eq("is_featured", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: "Error al cargar la obra destacada" };
    }

    return { success: true, data: (data as Artwork) || null };
  } catch {
    return { success: false, error: "Error inesperado" };
  }
}

export async function getStyles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("styles")
    .select("*")
    .order("name");

  if (error) return [];
  return data || [];
}
