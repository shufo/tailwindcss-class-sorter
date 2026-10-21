import { createSyncFn } from "synckit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SyncSorter = (classStr: string, stylesheetPath: string) => string;

// Created on first use so that Tailwind CSS v3 users never spawn a worker
let syncSorter: SyncSorter | undefined;

/**
 * Sort classes with Tailwind CSS v4, using the given CSS entry point.
 *
 * The Tailwind CSS v4 sorter can only be loaded asynchronously, while
 * sortClasses() is synchronous: the sorting runs in a worker and this
 * function blocks until it answers.
 */
export function sortClassesV4(
    classStr: string,
    stylesheetPath: string
): string {
    if (!syncSorter) {
        syncSorter = createSyncFn(path.resolve(__dirname, "worker.js"));
    }

    return syncSorter(classStr, path.resolve(stylesheetPath));
}
