import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack(config, { isServer }) {
    // onnxruntime-web exports "./webgpu" with "node: null" — webpack picks up the
    // node condition and rejects it even for client bundles. Alias directly to the
    // physical file to bypass the broken exports field.
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-web/webgpu': isServer
        ? false
        : resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort.min.js'),
    };
    
    return config;
  },
};

export default nextConfig;
