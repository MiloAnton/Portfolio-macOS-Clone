import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Même dossier de sortie que CRA pour ne pas casser le déploiement.
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    fakeTimers: {
      // Même périmètre que Jest : sans cette liste, Vitest mocke aussi
      // rAF/immediates et getTimerCount compte les timers internes de React.
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
    },
  },
});
