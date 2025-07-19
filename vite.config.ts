import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

const resolve = {
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
    "react-reconciler": "preact-reconciler",
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve,
});
