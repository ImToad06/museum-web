export type Style = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preview_url: string | null;
  created_at: string;
};

export type Author = {
  id: string;
  name: string;
  created_at: string;
};

export type Artwork = {
  id: string;
  title: string;
  author_id: string;
  style_id: string;
  original_image_url: string;
  stylized_image_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
  deleted_at: string | null;
  author?: Author;
  style?: Style;
};

export type ArtworkInsert = {
  title: string;
  author_id: string;
  style_id: string;
  original_image_url: string;
  stylized_image_url?: string | null;
  description?: string | null;
};

export type ArtworkFilter = {
  style_slug?: string;
  page?: number;
  limit?: number;
};
