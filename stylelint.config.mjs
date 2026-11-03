/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-recommended", "stylelint-config-recommended-vue"],
  reportDescriptionlessDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "config",
          "custom-variant",
          "plugin",
          "reference",
          "source",
          "theme",
          "utility",
          "variant",
        ],
      },
    ],
    "declaration-block-no-redundant-longhand-properties": true,
    "declaration-no-important": true,
    // Scoped Vue styles use :deep() and :global() to target rendered child component markup.
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["deep", "global"] }],
    // Component state selectors intentionally rely on source order; review specificity case by case.
    "no-descending-specificity": null,
  },
};
