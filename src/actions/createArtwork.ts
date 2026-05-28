"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { artworkFormSchema, imageFileSchema } from "@/lib/validations";
import { v4 as uuidv4 } from "uuid";
import type { ArtworkInsert } from "@/types/database";

type ActionResponse =
  | { success: true; data: { artworkId: string } }
  | { success: false; error: string };

export async function createArtwork(
  formData: {
    title: string;
    authorName: string;
    styleId: string;
    description?: string;
  },
  originalFile: File,
  stylizedFile?: File
): Promise<ActionResponse> {
  try {
    const parsed = artworkFormSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const originalValidation = imageFileSchema.safeParse(originalFile);
    if (!originalValidation.success) {
      return { success: false, error: originalValidation.error.issues[0].message };
    }

    if (stylizedFile) {
      const stylizedValidation = imageFileSchema.safeParse(stylizedFile);
      if (!stylizedValidation.success) {
        return { success: false, error: stylizedValidation.error.issues[0].message };
      }
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: author, error: authorError } = await supabase
      .from("authors")
      .insert({ name: parsed.data.authorName })
      .select("id")
      .single();

    if (authorError || !author) {
      return { success: false, error: "Error al crear el autor" };
    }

    const originalExt = originalFile.name.split(".").pop()!;
    const originalKey = `${uuidv4()}.${originalExt}`;

    const { error: uploadOriginalError } = await admin.storage
      .from("artworks-originals")
      .upload(originalKey, originalFile, {
        contentType: originalFile.type,
        upsert: false,
      });

    if (uploadOriginalError) {
      return { success: false, error: "Error al subir la imagen original" };
    }

    const { data: originalUrlData } = admin.storage
      .from("artworks-originals")
      .getPublicUrl(originalKey);

    let stylizedUrl: string | null = null;

    if (stylizedFile) {
      const stylizedExt = stylizedFile.name.split(".").pop()!;
      const stylizedKey = `${uuidv4()}.${stylizedExt}`;

      const { error: uploadStylizedError } = await admin.storage
        .from("artworks-stylized")
        .upload(stylizedKey, stylizedFile, {
          contentType: stylizedFile.type,
          upsert: false,
        });

      if (uploadStylizedError) {
        return { success: false, error: "Error al subir la imagen estilizada" };
      }

      const { data: stylizedUrlData } = admin.storage
        .from("artworks-stylized")
        .getPublicUrl(stylizedKey);

      stylizedUrl = stylizedUrlData.publicUrl;
    }

    const artworkData: ArtworkInsert = {
      title: parsed.data.title,
      author_id: author.id,
      style_id: parsed.data.styleId,
      original_image_url: originalUrlData.publicUrl,
      stylized_image_url: stylizedUrl,
      description: parsed.data.description || null,
    };

    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .insert(artworkData)
      .select("id")
      .single();

    if (artworkError || !artwork) {
      return { success: false, error: "Error al guardar la obra" };
    }

    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true, data: { artworkId: artwork.id } };
  } catch {
    return { success: false, error: "Error inesperado. Intenta de nuevo." };
  }
}
