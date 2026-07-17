import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: "http://localhost:4173",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    // On teste le build de production, au plus près de ce qui est déployé.
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
