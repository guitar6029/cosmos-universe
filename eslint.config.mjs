import eslintConfigPrettier from "eslint-config-prettier/flat";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    ignores: [
      ".nuxt/**",
      ".output/**",
      "dist/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
      "studio/**",
      "workers/**",
    ],
  },
  eslintConfigPrettier,
  {
    rules: {
      // Prettier owns Vue attribute wrapping according to printWidth.
      "vue/first-attribute-linebreak": "off",
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        { registeredComponentsOnly: false },
      ],
      "vue/custom-event-name-casing": ["error", "camelCase"],
      "vue/prop-name-casing": ["error", "camelCase"],
      "vue/v-on-event-hyphenation": ["error", "always", { autofix: true }],
    },
  },
);
