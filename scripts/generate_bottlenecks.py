#!/usr/bin/env python3
"""
Pre-calculate style bottlenecks for MAMB styles.
Uses the Magenta style prediction model to generate 100-dimensional vectors
for each style's reference image.
"""

import os
import json
import requests
from pathlib import Path
import numpy as np
import tensorflow as tf
from PIL import Image
from io import BytesIO

STYLES = {
    "expresionismo-barranquillero": {
        "name": "Expresionismo Barranquillero",
        "url": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=512",
    },
    "abstracto-moderno": {
        "name": "Abstracto Moderno",
        "url": "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=512",
    },
    "cubismo-digital": {
        "name": "Cubismo Digital",
        "url": "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=512",
    },
    "pop-art-tropical": {
        "name": "Pop Art Tropical",
        "url": "https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=512",
    },
}

MODEL_PATH = Path(__file__).parent / "models" / "style_predict.tflite"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "models" / "bottlenecks"


def load_and_preprocess_image(url: str, target_size: int = 256) -> np.ndarray:
    """Download image and preprocess for style prediction."""
    print(f"  Downloading from {url[:80]}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; MAMB-StyleTransfer/1.0)"
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    
    img = Image.open(BytesIO(response.content)).convert("RGB")
    
    # Central crop to square
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim))
    
    # Resize to target size
    img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    # Convert to numpy array and normalize to [0, 1]
    img_array = np.array(img, dtype=np.float32) / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


def run_style_prediction(interpreter, style_image: np.ndarray) -> np.ndarray:
    """Run style prediction model and return bottleneck."""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    interpreter.resize_tensor_input(input_details[0]["index"], style_image.shape)
    interpreter.allocate_tensors()
    interpreter.set_tensor(input_details[0]["index"], style_image)
    interpreter.invoke()
    
    bottleneck = interpreter.get_tensor(output_details[0]["index"])
    return bottleneck


def main():
    print(f"Loading model from {MODEL_PATH}...")
    interpreter = tf.lite.Interpreter(model_path=str(MODEL_PATH))
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"\nProcessing {len(STYLES)} styles...\n")
    
    for slug, style_info in STYLES.items():
        print(f"[{style_info['name']}] ({slug})")
        
        try:
            style_image = load_and_preprocess_image(style_info["url"])
            print(f"  Image shape: {style_image.shape}")
            
            bottleneck = run_style_prediction(interpreter, style_image)
            print(f"  Bottleneck shape: {bottleneck.shape}")
            
            output_path = OUTPUT_DIR / f"{slug}.json"
            with open(output_path, "w") as f:
                json.dump({
                    "slug": slug,
                    "name": style_info["name"],
                    "bottleneck": bottleneck[0].tolist(),
                }, f)
            
            print(f"  Saved to {output_path}\n")
            
        except Exception as e:
            print(f"  ERROR: {e}\n")
    
    print("Done!")


if __name__ == "__main__":
    main()
