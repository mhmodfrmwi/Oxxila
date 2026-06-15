import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
