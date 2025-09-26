import {
    defineConfig,
    globalIgnores,
} from "eslint/config";

import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import js from "@eslint/js";

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",

        parserOptions: {
            project: ["./tsconfig.json", "./tsconfig.jest.json"],
        },

        globals: {
            ...globals.node,
            ...globals.jest,
        },
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "^_",
            "caughtErrorsIgnorePattern": "^_",
            "varsIgnorePattern": "^_",
        }],

        "no-console": ["warn", {
            allow: ["warn", "error"],
        }],
    },

    ignores: ["**/dist", "**/node_modules", "**/coverage",".releaserc.js"],
}, globalIgnores(["**/dist", "**/node_modules", "**/coverage"]), globalIgnores([
    "**/dist",
    "**/node_modules",
    "**/coverage",
    "**/*.min.js",
    "**/jest.config.js",
])]);
