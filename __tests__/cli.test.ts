import path from "path";
import fs from "fs";
import { sortClasses } from "../src/main";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("prettier plugin test", () => {
    const fixturesDir = path.resolve(__dirname, "fixtures/prettier");
    const fixtureDirEntries = fs.readdirSync(fixturesDir, {
        withFileTypes: true,
    });

    const fixtures = fixtureDirEntries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);

    fixtures.forEach((fixture) => {
        test.concurrent(
            `output is same with prettier plugin: ${fixture}`,
            async function () {
                const content = fs
                    .readFileSync(path.resolve(fixturesDir, fixture))
                    .toString("utf-8");

                const result = content.replace(/class="(.*?)"/gi, (_, p1) => {
                    return `class="${sortClasses(p1)}"`;
                });

                const expected = await spawnSync(
                    path.resolve(
                        __dirname,
                        "../",
                        "node_modules",
                        ".bin",
                        "prettier"
                    ),
                    ["__tests__/fixtures/prettier/basic.html"],
                    { stdio: "pipe", shell: true }
                ).stdout.toString("utf-8");

                expect(result).toEqual(expected);
            }
        );
    });
});
