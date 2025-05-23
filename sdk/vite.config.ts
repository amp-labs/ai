import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import dts from "vite-plugin-dts";

export default defineConfig({
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
      ],
    },
    sourcemap: true,
    target: "node16",
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
});
