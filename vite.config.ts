import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
    }),
  ],
  server: {
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.trycloudflare.com', 'ddba4ebca75d9c92-69-196-89-210.serveousercontent.com'],
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});

