import { invoke } from "@tauri-apps/api/core";

// Thin wrapper over the Rust sampling command (see src-tauri/src/lib.rs).

export interface FrontmostApp {
  name: string;
  bundleId: string | null;
}

export async function frontmostApp(): Promise<FrontmostApp | null> {
  return (await invoke<FrontmostApp | null>("frontmost_app")) ?? null;
}
