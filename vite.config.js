import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 これを追加！

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 これも追加！
  ],

  server: {
    watch: {
      usePolling: true, // WSL環境などでファイルの変更を強制的に監視する設定
    }
  },
  base: 'https://nuidress-k1m6.vercel.app/',
})