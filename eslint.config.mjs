import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default defineConfig([
  globalIgnores([
    "reports/**/*",
    "runs/**/*",
    "**/node_modules",
    "**/lib",
    "**/build",
    "**/dist",
  ]),
  eslintPluginPrettierRecommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["**/babel.config.js", "**/react-native.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "prettier/prettier": "error",
    },
  },
]);
