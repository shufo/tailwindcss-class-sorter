import type { Config } from "tailwindcss/types/config";

export interface IOption {
    /**
     * Tailwind CSS v3: path to the JS config file.
     * Tailwind CSS v4: path to the CSS entry point (requires prettier-plugin-tailwindcss >= 0.8.0).
     */
    tailwindConfigPath?: string;
    tailwindConfig?: Config;
}
