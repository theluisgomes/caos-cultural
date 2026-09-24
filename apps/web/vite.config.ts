import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    // Monorepo: `.env.local` lives at the repo root, not apps/web.
    const envDir = path.resolve(__dirname, '../..');
    const env = loadEnv(mode, envDir, '');
    return {
      envDir,
      server: {
        port: 5174,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['manifest.webmanifest'],
          manifest: {
            name: 'CAOS Cultural',
            short_name: 'CAOS',
            theme_color: '#f43f5e',
            background_color: '#09090b',
            display: 'standalone',
            lang: 'pt-BR',
            start_url: '/',
          },
          workbox: {
            maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/picsum\.photos\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'images-cache', expiration: { maxEntries: 50 } },
              },
              {
                urlPattern: /^https:\/\/(upload|thumb)\.wikimedia\.org\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'wiki-images-cache', expiration: { maxEntries: 120 } },
              },
              {
                urlPattern: /^https:\/\/live\.staticflickr\.com\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'flickr-images-cache', expiration: { maxEntries: 80 } },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});
