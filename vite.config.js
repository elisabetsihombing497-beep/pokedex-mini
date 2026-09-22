import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pokedex-mini/', // sesuaikan jika nama repositori di GitHub berbeda
  plugins: [react()],
})