import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: true,
    assetsDir: "",
  },
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
    proxy: {
      "^/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
