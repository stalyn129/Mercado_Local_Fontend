import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,            // permite conexiones externas
    port: 5173,
    strictPort: true,

    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },

    // Esto SÍ reemplaza historyApiFallback
    fs: {
      strict: false,
    },
  },
});
