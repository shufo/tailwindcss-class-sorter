import path from "path";
import fs from "fs";
import { performance } from "perf_hooks";
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

    test("it should throws an error if config requires unresolvable module", () => {
        const configPath = path.resolve(
            __dirname,
            "fixtures/withConfigFile/basic/tailwind.config.unresolvable.js"
        );
        expect(() => {
            sortClasses("foo", {
                tailwindConfigPath: configPath,
            });
        }).toThrowError("Cannot find module '@tailwindcss/typo'");
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

    test("do not cache context when `tailwindConfig` option specified", () => {
        const firstConfig = {
            content: [],
            theme: {
                screens: {
                    sm: "0",
                    md: "834px",
                    lg: "1024px",
                    xl: "1200px",
                    xxl: "1440px",
                    xxxl: "1900px",
                },
            },
        };
        const firstResult = sortClasses(
            "md:col-end-12 xl:col-end-10 col-start-2 col-end-11 xxxl:col-end-8",
            {
                tailwindConfig: firstConfig,
            }
        );
        const firstExpected =
            "col-start-2 col-end-11 md:col-end-12 xl:col-end-10 xxxl:col-end-8";

        expect(firstResult).toEqual(firstExpected);

        // change config
        const secondConfig = {
            content: [],
            theme: {
                screens: {
                    sm: "0",
                    md: "834px",
                    lg: "1024px",
                    xl: "1200px",
                    xxl: "1440px",
                },
            },
        };

        // changed config taking effect
        const secondResult = sortClasses(
            "md:col-end-12 xl:col-end-10 col-start-2 col-end-11 xxxl:col-end-8",
            {
                tailwindConfig: secondConfig,
            }
        );
        const secondExpected =
            "xxxl:col-end-8 col-start-2 col-end-11 md:col-end-12 xl:col-end-10";

        expect(secondResult).toEqual(secondExpected);
    });

    test("cache tailwind config object if object is the same", () => {
        const startTime = performance.now();

        for (let i = 0; i < 20; i++) {
            const sorted = sortClasses(
                "xxxl:col-end-10 xxxl:col-end-8 col-start-2 col-end-11 md:col-end-12",
                {
                    tailwindConfig: {
                        content: [],
                        theme: {
                            screens: {
                                sm: "0",
                                md: "834px",
                                lg: "1024px",
                                xl: "1200px",
                                xxl: "1440px",
                                xxxl: "1900px",
                            },
                        },
                    },
                }
            );
        }

        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(1000);
    });
});
