import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseUrl = env.BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error(
      'BASE_URL is missing. Copy .env.example to .env and set BASE_URL to your API URL.',
    )
  }

  const proxyConfig: Record<string, { target: string; changeOrigin: boolean; secure: boolean }> =
    {}

  if (baseUrl.startsWith('http')) {
    const url = new URL(baseUrl)
    const proxyPath = url.pathname.replace(/\/$/, '') || '/api/v1'
    proxyConfig[proxyPath] = {
      target: url.origin,
      changeOrigin: true,
      secure: true,
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    // Expose BASE_URL from `.env` without clobbering Vite's import.meta.env.BASE_URL (app base path).
    define: {
      'import.meta.env.APP_API_BASE_URL': JSON.stringify(baseUrl),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replaceAll('\\', '/')

            if (normalizedId.includes('/node_modules/')) {
              if (
                normalizedId.includes('/react/') ||
                normalizedId.includes('/react-dom/') ||
                normalizedId.includes('/react-router/') ||
                normalizedId.includes('/react-router-dom/')
              ) {
                return 'vendor-react'
              }

              if (
                normalizedId.includes('/i18next/') ||
                normalizedId.includes('/react-i18next/') ||
                normalizedId.includes('/i18next-browser-languagedetector/')
              ) {
                return 'vendor-i18n'
              }

              if (normalizedId.includes('/framer-motion/')) {
                return 'vendor-motion'
              }

              if (normalizedId.includes('/lucide-react/')) {
                return 'vendor-icons'
              }
            }
          },
        },
      },
    },
    server: {
      allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'],
      proxy: proxyConfig,
    },
  }
})
