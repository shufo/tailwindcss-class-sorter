#!/usr/bin/env node

const esbuild = require("esbuild");
const env = process.env.NODE_ENV;
const buildForProd = env === "production";

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require("esbuild-node-externals");

esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    outfile: "dist/main.js",
    bundle: true,
    minify: buildForProd ? true : false,
    platform: "node",
    sourcemap: true,
    target: "node14",
    plugins: [nodeExternalsPlugin()],
    external: ["prettier-plugin-tailwindcss"],
    watch:
      process.env.NODE_ENV === "production"
        ? false
        : {
          onRebuild(error, result) {
            if (error) console.error("watch build failed:", error);
            else console.log("watch build succeeded:", result);
          },
        },
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
