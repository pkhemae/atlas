import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { config as baseConfig } from "./base.js";

const reactHooksRecommended =
  reactHooks.configs?.flat?.recommended ?? reactHooks.configs["recommended-latest"];

/**
 * Shared ESLint configuration for React workspaces.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  ...(Array.isArray(reactHooksRecommended) ? reactHooksRecommended : [reactHooksRecommended]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
