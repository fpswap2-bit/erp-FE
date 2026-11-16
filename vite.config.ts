import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Define proxy settings so they can be reused
const backendProxy = {
    "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        headers: { Host: "surabhierp.local" },
    },
    "/private": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        headers: { Host: "surabhierp.local" },
    },
    "/files": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        headers: { Host: "surabhierp.local" },
    },
};

export default defineConfig({
    plugins: [react(), tailwindcss()],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    // Dev server proxy
    server: {
        proxy: backendProxy,
    },
    // Production preview proxy
    preview: {
        proxy: backendProxy,
    },
});
