import { createContext } from "tailwindcss/lib/lib/setupContextUtils";
import { generateRules } from "tailwindcss/lib/lib/generateRules";
import resolveConfig from "tailwindcss/resolveConfig";
import type { TailwindConfig } from "tailwindcss/tailwind-config";
import escalade from "escalade/sync";
import { IOption } from "./options";

let tailwindConfig: TailwindConfig = {
    theme: {},
};

const __defaultConfig__ = "tailwind.config.js";

const tailwindConfigPath = escalade(__dirname, (dir, names) => {
    if (names.includes(__defaultConfig__)) {
        return __defaultConfig__;
    }
});

tailwindConfig.content = ["no-op"];
if (tailwindConfigPath) {
    tailwindConfig = require(tailwindConfigPath);
}

function bigSign(bigIntValue: number) {
    const left: any = bigIntValue > 0n;
    const right: any = bigIntValue < 0n;
    return left - right;
}

export function sortClasses(classStr: string, options: IOption = {}): string {
    if (options.tailwindConfig && options.tailwindConfigPath) {
        throw new Error(
            "You can not specify tailwinfConfig or tailwinfConfigPath. Please specify either one."
        );
    }

    if (options.tailwindConfigPath) {
        tailwindConfig = require(options.tailwindConfigPath);
    }

    if (options.tailwindConfig) {
        tailwindConfig = options.tailwindConfig;
    }

    const context = createContext(resolveConfig(tailwindConfig));

    const parts: string[] = classStr
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const unknownClassNames: string[] = [];
    const knownClassNamesWithOrder: (string | number)[][] = [];

    for (const className of parts) {
        const order: number =
            generateRules(new Set([className]), context).sort(([a], [z]) =>
                bigSign(z - a)
            )[0]?.[0] ?? null;

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
