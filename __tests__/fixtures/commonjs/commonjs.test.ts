import path from "path";
import fs from "fs";
import { performance } from "perf_hooks";
import { sortClasses } from "../../../src/main";
import util from "../../support/util";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("commonjs test", () => {
    test("commonjs type tailwind config test", () => {
        const content = fs
            .readFileSync(path.resolve(__dirname, "./basic.spec"))
            .toString("utf-8");

        const unformatted = util.unformattedContent(content);
        const tailwindConfigPath = path.resolve(
            __dirname,
            "tailwind.config.example.js"
        );
        const result = sortClasses(unformatted, { tailwindConfigPath });
        const expected = util.formattedContent(content);

        expect(result).toEqual(expected);
    });
});
