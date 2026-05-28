"use client";

import { useState, useCallback } from "react";

type StyleTransferState = {
  isProcessing: boolean;
  progress: number;
  resultDataUrl: string | null;
  error: string | null;
};

export function useStyleTransfer() {
  const [state, setState] = useState<StyleTransferState>({
    isProcessing: false,
    progress: 0,
    resultDataUrl: null,
    error: null,
  });

  const applyStyle = useCallback(
    async (sourceImage: HTMLImageElement, _styleSlug: string) => {
      setState({ isProcessing: true, progress: 0, resultDataUrl: null, error: null });

      try {
        setState((s) => ({ ...s, progress: 20 }));

        const tf = await import("@tensorflow/tfjs");
        await tf.ready();

        setState((s) => ({ ...s, progress: 50 }));

        const canvas = document.createElement("canvas");
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(sourceImage, 0, 0, size, size);

        setState((s) => ({ ...s, progress: 80 }));

        const resultDataUrl = canvas.toDataURL("image/webp", 0.9);

        setState({
          isProcessing: false,
          progress: 100,
          resultDataUrl,
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
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isProcessing: false, progress: 0, resultDataUrl: null, error: null });
  }, []);

  return { ...state, applyStyle, reset };
}
