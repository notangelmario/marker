import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      devOptions: {
        enabled: false // Enable install on dev mode
      },
      injectRegister: null,
      registerType: "prompt",
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 30000000
      }
    }),
  ]
});