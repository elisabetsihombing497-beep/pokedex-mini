import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pokedex-mini/', // sesuaikan jika nama repositori di GitHub berbeda
  plugins: [react()],
})