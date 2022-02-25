import path from "path";
import fs from "fs";
import { sortClasses } from "../src/main";
import util from "./support/util";

describe("replace test", () => {
    const fixturesDir = path.resolve(__dirname, "fixtures/html");
    const fixtureDirEntries = fs.readdirSync(fixturesDir, {
        withFileTypes: true,
    });

    const fixtures = fixtureDirEntries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);

    fixtures.forEach((fixture) => {
        test.concurrent(`can sort classes in file ${fixture}`, function () {
            const content = fs
                .readFileSync(path.resolve(fixturesDir, fixture))
                .toString("utf-8");

            const unformatted = util.unformattedContent(content);
            const result = unformatted.replace(/class="(.*?)"/gi, (_, p1) => {
                return `class="${sortClasses(p1)}"`;
            });
            const expected = util.formattedContent(content);

            expect(result).toEqual(expected);
        });
    });
});
