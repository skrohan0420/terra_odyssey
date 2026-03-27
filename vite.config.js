import { defineConfig } from "vite";

function normalizeId(id) {
  return id.split("\\").join("/");
}

function manualChunks(id) {
  const normalizedId = normalizeId(id);

  if (normalizedId.includes("/node_modules/three/")) {
    return "three-vendor";
  }

  if (normalizedId.includes("/node_modules/stats.js/")) {
    return "debug-vendor";
  }

  if (normalizedId.includes("/src/engine/debug/")) {
    return "debug-tools";
  }

  if (normalizedId.includes("/src/gameplay/map/")) {
    return "world-map";
  }

  return undefined;
}

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    port: 5050
  },
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  }
});
