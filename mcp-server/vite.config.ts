import { defineConfig, } from "vite";
import { VitePluginNode } from 'vite-plugin-node';
import type { OutputChunk, OutputAsset } from 'rollup';

// Custom plugin to add shebang
function addShebangPlugin() {
  return {
    name: 'add-shebang',
    generateBundle(options: any, bundle: { [fileName: string]: OutputChunk | OutputAsset }) {
      // Find the main entry point
      const mainEntry = Object.values(bundle).find(
        (chunk): chunk is OutputChunk => chunk.type === 'chunk' && chunk.isEntry
      );
      
      if (mainEntry) {
        mainEntry.code = `#!/usr/bin/env node\n${mainEntry.code}`;
      }
    },
  };
}

export default defineConfig({
  server: {
    port: 3001
  },
  build: {
    outDir: './dist',
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'],
      fileName: (format) => `index.${format}`
    },
    rollupOptions: {
      external: ['express', 'dotenv', 'zod', 'trieve-ts-sdk', 'axios', 'dashify', 'mintlify-validation', 'mintlify-openapi-parser']
    },
    sourcemap: true,
    target: 'node16'
  },
  plugins: [
    addShebangPlugin(),
    ...VitePluginNode({
      adapter: 'express',

      // tell the plugin where is your project entry
      appPath: './src/index.ts',

      // Optional, default: 'viteNodeApp'
      // the name of named export of you app from the appPath file
      exportName: 'mcpApp',

      // Optional, default: false
      // if you want to init your app on boot, set this to true
      initAppOnBoot: true,
    })
  ],
});
