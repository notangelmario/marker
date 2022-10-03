import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import monacoEditorPlugin from "vite-plugin-monaco-editor";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({ registerType: 'autoUpdate' }),
    
    // This plugins solves some errors
    // but the author messed up the types
    //@ts-ignore
    monacoEditorPlugin.default({
      languageWorkers: ['editorWorkerService']
    })
  ]
})