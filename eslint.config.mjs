import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "build/**",
      "out/**",
      "node_modules/**",
      "node_npm/**",
      "node_system/**",
      "dev-server*.log",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
