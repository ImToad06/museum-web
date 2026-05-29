"use client";

import { useState, useCallback, useRef } from "react";

type StyleTransferState = {
  isProcessing: boolean;
  progress: number;
  resultDataUrl: string | null;
  error: string | null;
};

type Models = {
  predictor: import("@tensorflow/tfjs").GraphModel;
  transformer: import("@tensorflow/tfjs").GraphModel;
};

const PREDICTOR_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/style/arbitrary/predictor/model.json";
const TRANSFORMER_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/style/arbitrary/transformer/model.json";

const STYLE_FILTERS: Record<string, () => string> = {
  "expresionismo-barranquillero": () => "saturate(2.5) contrast(1.4) sepia(0.3) hue-rotate(-10deg)",
  "abstracto-moderno": () => "saturate(3) contrast(1.6) blur(1px) hue-rotate(30deg)",
  "cubismo-digital": () => "contrast(1.8) brightness(0.9) sepia(0.4) saturate(1.5)",
  "pop-art-tropical": () => "saturate(4) contrast(1.8) brightness(1.1) hue-rotate(15deg)",
};

export function useStyleTransfer() {
  const [state, setState] = useState<StyleTransferState>({
    isProcessing: false,
    progress: 0,
    resultDataUrl: null,
    error: null,
  });

  const modelsRef = useRef<Models | null>(null);
  const tfRef = useRef<typeof import("@tensorflow/tfjs") | null>(null);

  const loadTF = useCallback(async () => {
    if (tfRef.current) return tfRef.current;
    const tf = await import("@tensorflow/tfjs");
    await tf.setBackend("cpu");
    await tf.ready();
    tfRef.current = tf;
    return tf;
  }, []);

  const loadModels = useCallback(async (): Promise<Models> => {
    if (modelsRef.current) return modelsRef.current;
    const tf = await loadTF();
    const [predictor, transformer] = await Promise.all([
      tf.loadGraphModel(PREDICTOR_URL),
      tf.loadGraphModel(TRANSFORMER_URL),
    ]);
    modelsRef.current = { predictor, transformer };
    return modelsRef.current;
  }, [loadTF]);

  const stylizeWithML = useCallback(
    async (
      sourceImage: HTMLImageElement,
      styleImage: HTMLImageElement
    ): Promise<string> => {
      const tf = await loadTF();
      const models = await loadModels();

      const contentCanvas = document.createElement("canvas");
      contentCanvas.width = 256;
      contentCanvas.height = 256;
      const contentCtx = contentCanvas.getContext("2d")!;
      const cSize = Math.min(sourceImage.width, sourceImage.height);
      const cx = (sourceImage.width - cSize) / 2;
      const cy = (sourceImage.height - cSize) / 2;
      contentCtx.drawImage(sourceImage, cx, cy, cSize, cSize, 0, 0, 256, 256);

      const styleCanvas = document.createElement("canvas");
      styleCanvas.width = 256;
      styleCanvas.height = 256;
      const styleCtx = styleCanvas.getContext("2d")!;
      const sSize = Math.min(styleImage.width, styleImage.height);
      const sx = (styleImage.width - sSize) / 2;
      const sy = (styleImage.height - sSize) / 2;
      styleCtx.drawImage(styleImage, sx, sy, sSize, sSize, 0, 0, 256, 256);

      const contentTensor = tf.browser
        .fromPixels(contentCanvas)
        .toFloat()
        .div(tf.scalar(255))
        .expandDims(0);

      const styleTensor = tf.browser
        .fromPixels(styleCanvas)
        .toFloat()
        .div(tf.scalar(255))
        .expandDims(0);

      const bottleneck = models.predictor.predict(styleTensor) as import("@tensorflow/tfjs").Tensor;

      const stylized = models.transformer.predict([
        contentTensor,
        bottleneck,
      ]) as import("@tensorflow/tfjs").Tensor;

      const squeezed = stylized.squeeze().mul(tf.scalar(255)).clipByValue(0, 255);

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = 256;
      outputCanvas.height = 256;
      await tf.browser.toPixels(
        squeezed as Parameters<typeof tf.browser.toPixels>[0],
        outputCanvas
      );

      const result = outputCanvas.toDataURL("image/webp", 0.9);

      contentTensor.dispose();
      styleTensor.dispose();
      bottleneck.dispose();
      stylized.dispose();
      squeezed.dispose();

      return result;
    },
    [loadTF, loadModels]
  );

  const stylizeWithFilters = useCallback(
    (sourceImage: HTMLImageElement, styleSlug: string): string => {
      const filterFn = STYLE_FILTERS[styleSlug];
      const filter = filterFn ? filterFn() : "saturate(1.5) contrast(1.3)";

      const canvas = document.createElement("canvas");
      canvas.width = sourceImage.naturalWidth || sourceImage.width;
      canvas.height = sourceImage.naturalHeight || sourceImage.height;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = filter;
      ctx.drawImage(sourceImage, 0, 0);

      return canvas.toDataURL("image/webp", 0.9);
    },
    []
  );

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  const ensureImageLoaded = useCallback(
    (img: HTMLImageElement): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve(img);
        } else {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Source image not loaded"));
        }
      });
    },
    []
  );

  const applyStyle = useCallback(
    async (sourceImage: HTMLImageElement, styleImageSrc: string, styleSlug?: string) => {
      setState({ isProcessing: true, progress: 0, resultDataUrl: null, error: null });

      try {
        setState((s) => ({ ...s, progress: 10 }));
        const readySource = await ensureImageLoaded(sourceImage);
        const styleImage = await loadImage(styleImageSrc);
        setState((s) => ({ ...s, progress: 30 }));

        let resultDataUrl: string;
        try {
          resultDataUrl = await stylizeWithML(readySource, styleImage);
        } catch (mlError) {
          console.warn("ML style transfer failed, using filters:", mlError);
          resultDataUrl = stylizeWithFilters(readySource, styleSlug || "");
        }

        setState({
          isProcessing: false,
          progress: 100,
          resultDataUrl,
          error: null,
        });
      } catch (error) {
        console.error("Style transfer error:", error);
        try {
          const fallback = stylizeWithFilters(sourceImage, styleSlug || "");
          setState({
            isProcessing: false,
            progress: 100,
            resultDataUrl: fallback,
            error: null,
          });
        } catch {
          setState({
            isProcessing: false,
            progress: 0,
            resultDataUrl: null,
            error: "Error al procesar la imagen. Intenta de nuevo.",
          });
        }
      }
    },
    [ensureImageLoaded, loadImage, stylizeWithML, stylizeWithFilters]
  );

  const reset = useCallback(() => {
    setState({ isProcessing: false, progress: 0, resultDataUrl: null, error: null });
  }, []);

  return { ...state, applyStyle, reset };
}
