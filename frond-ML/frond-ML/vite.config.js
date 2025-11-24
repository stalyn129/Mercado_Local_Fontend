import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Esto permite que rutas como /vendedor, /admin, /loginmodal NO se rompan
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
});
