import path from "path";
import fs from "fs";
import { sortClasses } from "../src/main";
import util from "./support/util";

describe("sorter test", () => {
    const fixturesDir = path.resolve(__dirname, "fixtures");
    const fixtureDirEntries = fs.readdirSync(fixturesDir, {
        withFileTypes: true,
    });

    const fixtures = fixtureDirEntries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);

    fixtures.forEach((fixture) => {
        test.concurrent(`can sort ${fixture}`, function () {
            const content = fs
                .readFileSync(path.resolve(fixturesDir, fixture))
                .toString("utf-8");

            const unformatted = util.unformattedContent(content);
            const result = sortClasses(unformatted);
            const expected = util.formattedContent(content);

            expect(result).toEqual(expected);
        });
    });
});

describe("config test", () => {
    const fixturesDir = path.resolve(
        __dirname,
        "fixtures/withConfigFile/basic"
    );
    const fixtureDirEntries = fs.readdirSync(fixturesDir, {
        withFileTypes: true,
    });

    const fixtures = fixtureDirEntries
        .filter((entry) => entry.isFile())
        .filter((entry) => entry.name.includes("spec"))
        .map((entry) => entry.name);

    fixtures.forEach((fixture) => {
        test.concurrent(`can sort ${fixture}`, function () {
            const content = fs
                .readFileSync(path.resolve(fixturesDir, fixture))
                .toString("utf-8");

            const configPath = path.resolve(
                __dirname,
                "fixtures/withConfigFile/basic/tailwind.config.example.js"
            );
            const unformatted = util.unformattedContent(content);
            const result = sortClasses(unformatted, {
                tailwindConfigPath: configPath,
            });
            const expected = util.formattedContent(content);

            expect(result).toEqual(expected);
        });
    });
});

describe("config option test", () => {
    test("it should throws an error if file specified by config path does not exists", () => {
        const configPath = path.resolve(
            __dirname,
            "fixtures/withConfigFile/basic/tailwind.config.not.exists.js"
        );
        expect(() => {
            sortClasses("foo", {
                tailwindConfigPath: configPath,
            });
        }).toThrowError("tailwind config could not be found");
    });

    test("it should throw error if both config path and config object specified", () => {
        const configPath = path.resolve(
            __dirname,
            "fixtures/withConfigFile/basic/tailwind.config.example.js"
        );
        expect(() => {
            sortClasses("foo", {
                tailwindConfigPath: configPath,
                tailwindConfig: { content: ["no-ope"], theme: {} },
            });
        }).toThrowError();
    });
});
