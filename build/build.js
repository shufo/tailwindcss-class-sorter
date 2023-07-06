#!/usr/bin/env node

import esbuild from "esbuild";
import path from "path";

const env = process.env.NODE_ENV;
const buildForProd = env === "production";

// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from "esbuild-node-externals";

esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    outfile: process.env.ESM_BUILD ? "dist/main.js" : "dist/main.cjs",
    bundle: true,
    minify: buildForProd ? true : false,
    platform: "node",
    sourcemap: true,
    target: "esnext",
    format: process.env.ESM_BUILD ? "esm" : "cjs",
    plugins: [nodeExternalsPlugin()],
    external: ["prettier-plugin-tailwindcss"],
    define: {
      "import.meta.url": "import_meta_url",
    },
    inject: [
      path.resolve("build", "import-meta-url.js"),
    ],
    banner: {
      js: process.env.ESM_BUILD ? `
        import path from 'path';
        import { fileURLToPath } from 'url';
        import { createRequire as topLevelCreateRequire } from 'module';
        const require = topLevelCreateRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        ` : ``,
    }
  })
  .then(() => {
    console.log("===========================================");
    if (buildForProd) {
      console.log(`${new Date().toLocaleString()}: build succeeded.`);
      return;
    }
    console.log(`${new Date().toLocaleString()}: watching...`);
  })
  .catch(() => process.exit(1));
