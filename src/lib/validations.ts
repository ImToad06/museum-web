import { z } from "zod";

export const artworkFormSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(120, "Máximo 120 caracteres")
    .trim(),
  authorName: z
    .string()
    .min(1, "El nombre del autor es obligatorio")
    .max(80, "Máximo 80 caracteres")
    .trim(),
  styleId: z.string().uuid("Estilo inválido"),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "La imagen no debe superar 5MB")
  .refine(
    (file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ext && ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
    },
    "Solo se permiten archivos .jpg, .png o .webp"
  );

export type ArtworkFormData = z.infer<typeof artworkFormSchema>;
