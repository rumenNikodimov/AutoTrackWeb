import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'pwa-192.svg', 'pwa-512.svg'],
      manifest: {
        name: 'AutoTrack iOS',
        short_name: 'AutoTrack',
        description: 'Vehicle service history, reminders, and mileage tracking.',
        theme_color: '#0f172a',
        background_color: '#0b1220',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/vehicles',
        scope: '/',
        icons: [
          {
            src: '/pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
      host: true,
  }
})
