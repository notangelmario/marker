import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  root: resolve(__dirname, "src"),
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
        main: resolve(__dirname, "src", "pages", "index.html"),
        "markdown-preview": resolve(__dirname, "src", "pages", "markdown-preview.html"),
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