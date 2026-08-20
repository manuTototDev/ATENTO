import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config temporal solo para pruebas locales en este sandbox: redirige el cache
// de Vite a /tmp porque el mount del proyecto no permite borrar archivos.
// No afecta al proyecto real; puede eliminarse sin problema.
export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/vite-cache-frontend',
  server: { host: '0.0.0.0' },
})
