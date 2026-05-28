"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage, fileToDataUrl } from "@/lib/imageUtils";
import { useStyleTransfer } from "@/hooks/useStyleTransfer";
import { createArtwork } from "@/actions/createArtwork";
import { getStyles } from "@/actions/getArtworks";
import type { Style } from "@/types/database";

const STEPS = ["Imagen", "Info", "Estilo", "Preview"] as const;
type Step = (typeof STEPS)[number];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [step, setStep] = useState<Step>("Imagen");
  const [direction, setDirection] = useState(0);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [styles, setStyles] = useState<Style[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  const { isProcessing, progress, resultDataUrl, error: styleError, applyStyle, reset: resetStyle } = useStyleTransfer();

  const stepIndex = STEPS.indexOf(step);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep(STEPS[stepIndex + 1]);
  }, [stepIndex]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep(STEPS[stepIndex - 1]);
  }, [stepIndex]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    setOriginalFile(compressed);
    const preview = await fileToDataUrl(compressed);
    setOriginalPreview(preview);
    setStep("Info");
    setDirection(1);
  };

  const handleInfoNext = async () => {
    if (!title.trim() || !authorName.trim()) return;
    const stylesData = await getStyles();
    setStyles(stylesData);
    goNext();
  };

  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    if (imgRef.current) {
      const style = styles.find((s) => s.id === styleId);
      await applyStyle(imgRef.current, style?.slug || "");
    }
    setDirection(1);
    setStep("Preview");
  };

  const handleSubmit = async () => {
    if (!originalFile || !selectedStyle) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let stylizedFile: File | undefined;
      if (resultDataUrl) {
        const res = await fetch(resultDataUrl);
        const blob = await res.blob();
        stylizedFile = new File([blob], "stylized.webp", { type: "image/webp" });
      }

      const result = await createArtwork(
        { title, authorName, styleId: selectedStyle, description },
        originalFile,
        stylizedFile
      );

      if (result.success) {
        router.push("/gallery");
      } else {
        setSubmitError(result.error);
      }
    } catch {
      setSubmitError("Error inesperado. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen px-6 pt-8">
      <h1 className="text-2xl font-bold text-brand-blue mb-2">Crea tu Arte</h1>

      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? "bg-brand-blue" : "bg-gray-200"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          {step === "Imagen" && (
            <motion.div
              key="step-image"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-500 mb-4">
                Toma una foto o selecciona desde tu galería
              </p>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-5 bg-brand-blue text-white rounded-2xl font-medium text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Tomar Foto
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-5 bg-brand-grey text-gray-700 rounded-2xl font-medium text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                Elegir de Galería
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </motion.div>
          )}

          {step === "Info" && (
            <motion.div
              key="step-info"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {originalPreview && (
                <div className="rounded-2xl overflow-hidden mb-4">
                  <img src={originalPreview} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Título de la obra
                </label>
                <input
                  type="text"
                  inputMode="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Atardecer en el Caribe"
                  className="w-full px-4 py-3.5 bg-brand-grey rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Tu nombre
                </label>
                <input
                  type="text"
                  inputMode="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej: María López"
                  className="w-full px-4 py-3.5 bg-brand-grey rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cuéntanos sobre tu obra..."
                  rows={3}
                  className="w-full px-4 py-3.5 bg-brand-grey rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow resize-none"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={goPrev}
                  className="flex-1 py-3.5 bg-brand-grey text-gray-600 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  Atrás
                </button>
                <button
                  onClick={handleInfoNext}
                  disabled={!title.trim() || !authorName.trim()}
                  className="flex-1 py-3.5 bg-brand-blue text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
                >
                  Siguiente
                </button>
              </div>
            </motion.div>
          )}

          {step === "Estilo" && (
            <motion.div
              key="step-style"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-500">
                Elige un estilo artístico para tu obra
              </p>

              <img ref={imgRef} src={originalPreview || ""} alt="" className="hidden" />

              <div className="grid grid-cols-2 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className={`p-4 rounded-2xl text-left transition-all active:scale-[0.97] ${
                      selectedStyle === style.id
                        ? "bg-brand-blue text-white ring-2 ring-brand-blue"
                        : "bg-brand-grey text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{style.name}</span>
                    {style.description && (
                      <p className={`text-xs mt-1 ${selectedStyle === style.id ? "text-white/70" : "text-gray-400"}`}>
                        {style.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={goPrev}
                className="w-full py-3.5 bg-brand-grey text-gray-600 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform mt-4"
              >
                Atrás
              </button>
            </motion.div>
          )}

          {step === "Preview" && (
            <motion.div
              key="step-preview"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {isProcessing && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    Aplicando estilo con IA...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isProcessing && resultDataUrl && originalPreview && (
                <div>
                  <p className="text-xs text-gray-400 text-center mb-3">
                    Desliza para comparar
                  </p>
                  <div className="relative rounded-2xl overflow-hidden aspect-square select-none">
                    <img
                      src={resultDataUrl}
                      alt="Estilizada"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ minWidth: `${100 / (sliderPos / 100)}%` }}
                      />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3 4 7l4 4" />
                          <path d="M16 3l4 4-4 4" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    />
                  </div>

                  <div className="flex justify-center gap-4 mt-3">
                    <span className="text-xs text-gray-400 bg-brand-grey px-3 py-1 rounded-full">Original</span>
                    <span className="text-xs text-brand-blue bg-blue-50 px-3 py-1 rounded-full font-medium">IA</span>
                  </div>
                </div>
              )}

              {styleError && (
                <p className="text-sm text-red-500 text-center">{styleError}</p>
              )}

              {submitError && (
                <p className="text-sm text-red-500 text-center">{submitError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    resetStyle();
                    setSelectedStyle("");
                    goPrev();
                  }}
                  className="flex-1 py-3.5 bg-brand-grey text-gray-600 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  Cambiar Estilo
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isProcessing || !resultDataUrl}
                  className="flex-1 py-3.5 bg-brand-blue text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
                >
                  {isSubmitting ? "Subiendo..." : "Publicar Obra"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
