import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        fs: {
            allow: ['../../', 'node_modules'],
        },
        // These headers are required for multi-threading logic to work
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        }
    },
});
