#!/usr/bin/env node

import esbuild from "esbuild";
import path from "path";

const env = process.env.NODE_ENV;
const buildForProd = env === "production";

// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from "esbuild-node-externals";

const mainBuild = esbuild.build({
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
  });

// The Tailwind CSS v4 worker is loaded by path at runtime (see src/v4.ts),
// so it is built as a standalone ES module for both the CJS and ESM builds
const workerBuild = esbuild.build({
    entryPoints: ["./src/worker.ts"],
    outfile: "dist/worker.js",
    bundle: true,
    minify: buildForProd ? true : false,
    platform: "node",
    sourcemap: true,
    target: "esnext",
    format: "esm",
    plugins: [nodeExternalsPlugin()],
  });

Promise.all([mainBuild, workerBuild])
  .then(() => {
    console.log("===========================================");
    if (buildForProd) {
      console.log(`${new Date().toLocaleString()}: build succeeded.`);
      return;
    }
    console.log(`${new Date().toLocaleString()}: watching...`);
  })
  .catch(() => process.exit(1));
