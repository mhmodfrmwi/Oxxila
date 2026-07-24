import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    proxy: {
      '/api/v1': {
        target: 'https://oxxila-api-01ced6342147.herokuapp.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
