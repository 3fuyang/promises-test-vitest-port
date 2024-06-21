import globals from "globals"
import pluginJs from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import jsdoc from "eslint-plugin-jsdoc"

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  jsdoc.configs["flat/recommended"],
  {
    rules: {
      "prefer-arrow-callback": "error",
      "object-shorthand": "error",
      "jsdoc/require-jsdoc": "off",
    },
  },
]
