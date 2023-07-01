import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Module from "node:module";

global.require = Module.createRequire(import.meta.url);
