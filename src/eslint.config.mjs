import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import parser from "vue-eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [...compat.extends(
  "eslint:recommended",
  "plugin:@typescript-eslint/eslint-recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:vue/vue3-recommended",
), {
  plugins: {
    "@typescript-eslint": typescriptEslint,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.amd,
      ...globals.node,
    },

    parser: parser,
    ecmaVersion: 2020,
    sourceType: "module",

    parserOptions: {
      parser: "@typescript-eslint/parser",

      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    "vue/no-setup-props-destructure": "off",
    "no-useless-escape": "warn",
    "no-prototype-builtins": "warn",
    "vue/no-unused-vars": "warn",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-var-requires": 0,
    "vue/max-attributes-per-line": ["error", {
      singleline: 2,

      multiline: {
        max: 1,
      },
    }],
    "vue/first-attribute-linebreak": ["error", {
      singleline: "beside",
      multiline: "beside",
    }],
    "vue/require-default-prop": "off",
    "vue/no-v-html": "off",
    "vue/no-v-text-v-html-on-component": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "vue/no-unused-components": "warn",
    "vue/multi-word-component-names": "off",
    "vue/prop-name-casing": "off",
  },
},
{
  files: ["**/*.ts", "**/*.vue"],
  rules: {
    "no-undef": "off",
  },
}];
