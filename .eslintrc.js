module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "import",
    "promise",
    "n"
  ],
  extends: [
    "standard",                 // JS 规则
    "plugin:react/recommended", // React 规则
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript"  // 解决 TS import 解析问题
  ],
  rules: {
    // --- 基础项目常用规则 ---
    "react/react-in-jsx-scope": "off", // Vite + React 18 不需要 React import
    "import/no-unresolved": "off",     // 若你使用路径别名，可开启并配置
    "@typescript-eslint/no-unused-vars": ["warn"],

    // --- 如果你使用 tailwind，可开启 class 排序 ---
    // "tailwindcss/classnames-order": "warn",
  }
}
