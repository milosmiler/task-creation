import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**"]
    },
    {
        files: ["**/*.{js,mjs,cjs,vue}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    js.configs.recommended,
    ...pluginVue.configs["flat/essential"],
    {
        rules: {
            "no-console": "off",
            "vue/multi-word-component-names": "off"
        }
    }
];
