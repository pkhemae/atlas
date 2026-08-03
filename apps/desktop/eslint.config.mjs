import { config } from "@atlas/eslint-config/react";

export default [
  ...config,
  {
    ignores: ["src-tauri/target/**", "src-tauri/gen/**"],
  },
];
