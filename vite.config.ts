import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  plugins: [
    VitePWA({
      devOptions: {
        enabled: false // Enable install on dev mode
      },
      injectRegister: null,
      registerType: "prompt",
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 30000000
      }
    }),
  ],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "markdown-preview": resolve(__dirname, "markdown-preview.html"),
      },
      output: {
        manualChunks: {
          "monaco-editor": ["monaco-editor"],
          marked: ["marked"]
        }
      }
    }
  }
});