import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "./tflite_web_api_client": false,
      "../tflite_web_api_client": false,
    };
    return config;
  },
};

export default nextConfig;
