import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Cấu hình plugin React rõ ràng hơn
      jsxRuntime: "automatic",
      // Tắt Fast Refresh nếu nó gây ra vấn đề
      fastRefresh: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add preprocessor options if needed
    },
    modules: {
      // Default behavior for CSS modules
      localsConvention: "camelCase",
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
  build: {
    // Ensure sourcemaps are generated
    sourcemap: true,
  },
  // Thêm tùy chọn để tránh lỗi preamble
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
