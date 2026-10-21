import { runAsWorker } from "synckit";
import { createRequire } from "module";
import fs from "fs";
import { pathToFileURL } from "url";

const __sorterModule__ = "prettier-plugin-tailwindcss/sorter";

type Sorter = {
    sortClassAttributes(classes: string[]): string[];
};

// Loading a stylesheet is costly: keep one sorter per stylesheet
const sorters = new Map<string, Promise<Sorter>>();

/**
 * prettier-plugin-tailwindcss is resolved from the stylesheet location, like
 * tailwindcss itself: classes are sorted by the same plugin version as the
 * rest of the project.
 */
async function loadSorter(stylesheetPath: string): Promise<Sorter> {
    if (!fs.existsSync(stylesheetPath)) {
        throw new Error(
            "tailwind stylesheet could not be found at: " + stylesheetPath
        );
    }

    let sorterModulePath: string;

    try {
        sorterModulePath =
            createRequire(stylesheetPath).resolve(__sorterModule__);
    } catch {
        throw new Error(
            "prettier-plugin-tailwindcss >= 0.8.0 is required to sort Tailwind CSS v4 classes, but it could not be resolved from: " +
                stylesheetPath
        );
    }

    const { createSorter } = await import(pathToFileURL(sorterModulePath).href);

    // Like the Tailwind CSS v3 sorter, keep duplicated classes: template
    // syntax (Blade, Twig…) can legitimately repeat inside a class attribute
    return createSorter({
        filepath: stylesheetPath,
        stylesheetPath,
        preserveDuplicates: true,
    });
}

function getSorter(stylesheetPath: string): Promise<Sorter> {
    if (!sorters.has(stylesheetPath)) {
        sorters.set(stylesheetPath, loadSorter(stylesheetPath));
    }

    return sorters.get(stylesheetPath) as Promise<Sorter>;
}

runAsWorker(async (classStr: string, stylesheetPath: string) => {
    const sorter = await getSorter(stylesheetPath);
    const [sorted] = sorter.sortClassAttributes([classStr]);

    return sorted;
});
