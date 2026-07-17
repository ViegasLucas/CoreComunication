import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' })
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Vendor splitting: separa dependências pesadas em chunks cacheáveis
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React — muda raramente entre deploys
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react';
            }
            // Firebase Auth — SDK pesado
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Recharts — só necessário nos dashboards
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Componentes UI Radix — compartilhados entre views
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Markdown rendering — usado no dashboard do líder
            if (id.includes('react-markdown') || id.includes('remark-') || id.includes('unified') || id.includes('mdast') || id.includes('micromark') || id.includes('hast')) {
              return 'vendor-markdown';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // Lucide icons
            if (id.includes('lucide')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },
})

