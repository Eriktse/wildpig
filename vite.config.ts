import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"
import path from "node:path";

const __dirname = import.meta.dirname;

export default defineConfig({
    plugins: [react()],
    root: "public",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "#": path.resolve(__dirname, "./"),
        },
    },
    server: {
        port: 3000,
        hmr: {
            port: 3001,
            clientPort: 3001,
        },
        cors: true,
    }
})