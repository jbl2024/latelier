module.exports = {
  extends: [
    "@meteorjs/eslint-config-meteor",
    "airbnb-base",
    "plugin:vue/recommended"
  ],
  rules: {
    "vue/no-unused-vars": "off",
    "import/no-unresolved": "off",
    "no-confusing-arrow": "off",
    "no-param-reassign": "off",
    "import/no-absolute-path": "off",
    "quotes": ["error", "double"],
    "comma-dangle": ["error", "never"]
  }
};
