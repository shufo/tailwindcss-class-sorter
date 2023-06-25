import path from "path";
import { runAsWorker } from "synckit";

runAsWorker(async (modulePath) => {
    return await import(modulePath)
        .then((m) => m.default)
        .catch((err) => {
            if (
                err.code === "MODULE_NOT_FOUND" &&
                err.moduleName === path.resolve(modulePath)
            ) {
                throw new Error(
                    "tailwind config could not be found at: " + modulePath 
                );
            }

            throw err;
        });
});
