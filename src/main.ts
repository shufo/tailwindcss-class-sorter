import { createContext } from "tailwindcss/lib/lib/setupContextUtils";
import { generateRules } from "tailwindcss/lib/lib/generateRules";
import resolveConfig from "tailwindcss/resolveConfig";
import type { Config } from "tailwindcss/types/config";
import escalade from "escalade/sync";
import { IOption } from "./options";
import objectHash from "object-hash";
import path from "path";

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

export function sortClasses(classStr: string, options: IOption = {}): string {
    const tailwindConfigPath = escalade(__dirname, (dir, names) => {
        if (names.includes(__defaultConfig__)) {
            return __defaultConfig__;
        }
    });

    tailwindConfig.content = ["no-op"];
    if (tailwindConfigPath) {
        tailwindConfig = require(tailwindConfigPath);
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
        context = createContext(resolveConfig(tailwindConfig));
        contextMap.set(hash, { context, hash });
    }

    const parts: string[] = classStr
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const unknownClassNames: string[] = [];
    const knownClassNamesWithOrder: (string | number)[][] = [];

    for (const className of parts) {
        let order: number | null;

        const ruleOrder = generateRules(new Set([className]), context).sort(
            ([a], [z]) => bigSign(z - a)
        )[0];

        if (ruleOrder) {
            order = ruleOrder[0];
        } else {
            order = null;
        }

        if (order) {
            knownClassNamesWithOrder.push([className, order]);
        } else {
            unknownClassNames.push(className);
        }
    }

    const knownClassNames = knownClassNamesWithOrder
        .sort(([, a]: any, [, z]: any) => (a === z ? 0 : bigSign(a - z)))
        .map(([className]) => className);

    return [...unknownClassNames, ...knownClassNames].join(" ");
}

function requireConfig(configPath: string) {
    try {
        return require(configPath);
    } catch (err: any) {
        if (
            err.code === "MODULE_NOT_FOUND" &&
            err.moduleName === path.resolve(configPath)
        ) {
            throw new Error("tailwind config could not be found at: " + path);
        }

        throw err;
    }
}
