import vinext from "vinext";
import { defineConfig } from "vite";
// This portfolio is fully static: no server bindings, sign-in, or backend.
export default defineConfig({ plugins: [vinext()] });
