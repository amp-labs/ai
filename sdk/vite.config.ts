import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import dts from "vite-plugin-dts";

export default defineConfig({
  define: {
    'process.env': {
      AMPERSAND_SENTRY_DSN: process.env.AMPERSAND_SENTRY_DSN, // build time env var
    },
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: "./dist",
    lib: {
      entry: {
        mastra: "./lib/adapters/mastra.ts",
        mcp: "./lib/adapters/mcp.ts",
        aisdk: "./lib/adapters/aisdk.ts",
        config: "./lib/config.ts",
      },
      formats: ["cjs", "es"],
      fileName: (format, entryName) =>
        entryName === "index" ? `index.${format}` : `${entryName}/index.${format}`,
    },
    rollupOptions: {
      external: [
        "express",
        "dotenv",
        "zod",
        "trieve-ts-sdk",
        "axios",
        "dashify",
        "mintlify-validation",
        "mintlify-openapi-parser",
        "ai",
        "@mastra/core",
        "@amp-labs/sdk-node-platform",
        "@amp-labs/sdk-node-write",
        "@modelcontextprotocol/sdk",
        "@sentry/node",
      ],
    },
    sourcemap: true,
    target: "node16",
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
});
