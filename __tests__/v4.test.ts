import path from "path";
import fs from "fs";
// The Tailwind CSS v4 sorter runs in a worker that only exists in the build
import { sortClasses } from "../dist/main.js";
import util from "./support/util";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("tailwind v4 test", () => {
    const fixturesDir = path.resolve(__dirname, "fixtures/v4");
    const stylesheetPath = path.resolve(fixturesDir, "app.css");
    const fixtureDirEntries = fs.readdirSync(fixturesDir, {
        withFileTypes: true,
    });

    const fixtures = fixtureDirEntries
        .filter((entry) => entry.isFile())
        .filter((entry) => entry.name.includes("spec"))
        .map((entry) => entry.name);

    fixtures.forEach((fixture) => {
        test(`can sort ${fixture}`, function () {
            const content = fs
                .readFileSync(path.resolve(fixturesDir, fixture))
                .toString("utf-8");

            const unformatted = util.unformattedContent(content);
            const result = sortClasses(unformatted, {
                tailwindConfigPath: stylesheetPath,
            });
            const expected = util.formattedContent(content);

            expect(result).toEqual(expected);
        });
    });

    test("it should throws an error if stylesheet specified by config path does not exists", () => {
        const missingStylesheetPath = path.resolve(fixturesDir, "missing.css");

        expect(() => {
            sortClasses("foo", {
                tailwindConfigPath: missingStylesheetPath,
            });
        }).toThrowError("tailwind stylesheet could not be found");
    });
});
