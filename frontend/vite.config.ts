// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import path from "path"

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   server: {
//     port: 5173,
//   },
// })

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      }
    }
  },
  esbuild: {
    // Ignore TypeScript errors during build
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/models": path.resolve(__dirname, "./src/Models"),
      "@/Models": path.resolve(__dirname, "./src/Models"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080', // Only used in dev
      '/prompts': 'http://localhost:8080', // add this if needed
    },
  },
})