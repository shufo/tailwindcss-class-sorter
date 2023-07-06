import setupContextUtil from "tailwindcss/lib/lib/setupContextUtils.js";
import generateRules from "tailwindcss/lib/lib/generateRules.js";
import resolveConfig from "tailwindcss/resolveConfig.js";
import loadConfig from "tailwindcss/loadConfig.js";
import type { Config } from "tailwindcss/types/config";
import escalade from "escalade/sync";
import { IOption } from "./options";
import objectHash from "object-hash";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tailwindConfig: Config = {
    content: [],
    theme: {},
};

const contextMap = new Map();
const __defaultConfig__ = "tailwind.config.js";

function bigSign(bigIntValue: number) {
    const left: any = bigIntValue > 0n;
    const right: any = bigIntValue < 0n;

    return left - right;
}

function prefixCandidate(context, selector) {
    const prefix = context.tailwindConfig.prefix;

    return typeof prefix === "function" ? prefix(selector) : prefix + selector;
}

function getClassOrderPolyfill(classes, context) {
    const parasiteUtilities = new Set([
        prefixCandidate(context, "group"),

        prefixCandidate(context, "peer"),
    ]);

    const classNamesWithOrder: Array<Array<string>> = [];

    for (const className of classes) {
        let order =
            generateRules(new Set([className]), context).sort(([a], [z]) =>
                bigSign(z - a)
            )[0]?.[0] ?? null;

        if (order === null && parasiteUtilities.has(className)) {
            order = context.layerOrder.components;
        }

        classNamesWithOrder.push([className, order]);
    }

    return classNamesWithOrder;
}

export function sortClasses(classStr: string, options: IOption = {}): string {
    const tailwindConfigPath = escalade(__dirname, (dir, names) => {
        if (names.includes(__defaultConfig__)) {
            return __defaultConfig__;
        }
    });

    tailwindConfig.content = ["no-op"];

    if (tailwindConfigPath) {
        tailwindConfig = requireConfig(tailwindConfigPath);
    }

    if (options.tailwindConfig && options.tailwindConfigPath) {
        throw new Error(
            "You can not specify tailwinfConfig or tailwinfConfigPath. Please specify either one."
        );
    }

    if (options.tailwindConfigPath) {
        tailwindConfig = requireConfig(options.tailwindConfigPath);
    }

    if (options.tailwindConfig) {
        tailwindConfig = options.tailwindConfig;
    }

    const hash = objectHash(tailwindConfig, { ignoreUnknown: true });

    let context;

    const existing = contextMap.get(hash);

    if (existing && existing.hash === hash) {
        context = existing.context;
    } else {
        context = setupContextUtil.createContext(resolveConfig(tailwindConfig));

        contextMap.set(hash, { context, hash });
    }

    const parts: string[] = classStr

        .split(/\s+/)

        .filter((x) => x !== "" && x !== "|");

    const unknownClassNames: string[] = [];

    const knownClassNamesWithOrder = context.getClassOrder
        ? context.getClassOrder(parts)
        : getClassOrderPolyfill(parts, context);

    const knownClassNames = knownClassNamesWithOrder

        .sort(([, a]: any, [, z]: any) => {
            if (a === z) return 0;

            if (a === null) return -1;

            if (z === null) return 1;

            return bigSign(a - z);
        })

        .map(([className]) => className);

    return [...unknownClassNames, ...knownClassNames].join(" ");
}

function requireConfig(configPath: string) {
    if (!fs.existsSync(configPath)) {
        throw new Error("tailwind config could not be found at: " + path);
    }

    try {
        return loadConfig(configPath);
    } catch (err: any) {
        if (
            err.code === "MODULE_NOT_FOUND" &&
            err.moduleName === path.resolve(configPath)
        ) {
            throw new Error(
                "tailwind config could not be found at: " + configPath
            );
        }

        throw err;
    }
}
