import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      injectRegister: "inline",
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 30000000
      }
    }),
  ]
});