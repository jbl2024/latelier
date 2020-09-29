module.exports = {
  extends: ["@meteorjs/eslint-config-meteor", "plugin:vue/recommended"],
  rules: {
    "object-shorthand": "off",
    "vue/no-unused-vars": "off",
    "import/no-unresolved": "off",
    "no-confusing-arrow": "off",
    "no-param-reassign": "off",
    "import/no-absolute-path": "off",
    "import/prefer-default-export": "off",
    "import/no-cycle": "off",
    "no-undef": "off",
    "no-underscore-dangle": "off",
    "quotes": ["error", "double"],
    "comma-dangle": ["error", "never"],
    "no-plusplus": [2, { allowForLoopAfterthoughts: true }],
    "object-curly-newline": ["error", { "consistent": true }],
    "vue/max-attributes-per-line": ["error", {
      "singleline": 8,
      "multiline": {
        "max": 8,
        "allowFirstLine": true
      }
    }],
    "vue/no-v-html": "off" 
  },
  overrides: [
    {
      files: ["*.test.js", "*.spec.js"],
      rules: {
        "no-unused-expressions": "off"
      }
    }
  ],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "babel-eslint",
    "sourceType": "module",
    "allowImportExportEverywhere": true,
    "codeFrame": false
  }
};
