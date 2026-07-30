import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1', 'stu-24feef-clinic-appointment-and-kwve.onrender.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1', 'stu-24feef-clinic-appointment-and-kwve.onrender.com'],
  },
})

