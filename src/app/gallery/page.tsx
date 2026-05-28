"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getArtworks } from "@/actions/getArtworks";
import type { Artwork } from "@/types/database";

const FILTERS = [
  { label: "Recientes", slug: "" },
  { label: "Expresionismo", slug: "expresionismo-barranquillero" },
  { label: "Abstracto", slug: "abstracto-moderno" },
  { label: "Cubismo", slug: "cubismo-digital" },
  { label: "Pop Art", slug: "pop-art-tropical" },
];

function GallerySkeleton() {
  return (
    <div className="columns-2 gap-3 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid bg-brand-grey rounded-2xl animate-pulse"
          style={{ height: `${180 + (i % 3) * 60}px` }}
        />
      ))}
    </div>
  );
}

function ArtworkCard({ artwork, onShare }: { artwork: Artwork; onShare: (a: Artwork) => void }) {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = artwork.stylized_image_url || artwork.original_image_url;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="break-inside-avoid mb-3"
    >
      <div className="relative rounded-2xl overflow-hidden bg-brand-grey group">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" style={{ minHeight: "220px" }} />
        )}
        <img
          src={imageUrl}
          alt={artwork.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
          <h3 className="text-white text-sm font-semibold leading-tight">{artwork.title}</h3>
          <p className="text-white/70 text-xs mt-0.5">{artwork.author?.name}</p>
        </div>
        <button
          onClick={() => onShare(artwork)}
          className="absolute top-2 right-2 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
          aria-label="Compartir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const filterRef = useRef("");

  const fetchArtworks = useCallback(async (filterSlug: string, pageNum: number, append: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const result = await getArtworks({
      style_slug: filterSlug || undefined,
      page: pageNum,
      limit: 12,
    });

    if (result.success) {
      setArtworks((prev) => (append ? [...prev, ...result.data.artworks] : result.data.artworks));
      setHasMore(result.data.hasMore);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  const handleFilterChange = useCallback((slug: string) => {
    setActiveFilter(slug);
    filterRef.current = slug;
    pageRef.current = 1;
    fetchArtworks(slug, 1, false);
  }, [fetchArtworks]);

  useEffect(() => {
    filterRef.current = "";
    pageRef.current = 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArtworks("", 1, false);
  }, [fetchArtworks]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
          fetchArtworks(filterRef.current, nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, fetchArtworks]);

  const handleShare = async (artwork: Artwork) => {
    const shareData = {
      title: artwork.title,
      text: `"${artwork.title}" por ${artwork.author?.name} - Galería MAMB`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.text);
    }
  };

  return (
    <main className="flex flex-col min-h-screen px-4 pt-8">
      <h1 className="text-2xl font-bold text-brand-blue mb-2 px-2">Galería Virtual</h1>
      <p className="text-sm text-gray-500 mb-5 px-2">
        Explora las obras de la comunidad MAMB
      </p>

      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
        {FILTERS.map((filter) => (
          <button
            key={filter.slug}
            onClick={() => handleFilterChange(filter.slug)}
            className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap snap-start transition-all active:scale-95 ${
              activeFilter === filter.slug
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "bg-brand-grey text-gray-600"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : (
        <AnimatePresence mode="popLayout">
          {artworks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-400 text-sm">
                No hay obras aún. ¡Sé el primero en subir!
              </p>
            </motion.div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} onShare={handleShare} />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {loadingMore && (
        <div className="columns-2 gap-3 space-y-3 mt-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="break-inside-avoid bg-brand-grey rounded-2xl animate-pulse h-48" />
          ))}
        </div>
      )}

      {hasMore && !loading && <div ref={sentinelRef} className="h-4" />}
    </main>
  );
}
