import { invoke } from "@tauri-apps/api/core";

// Thin wrappers over the Rust keychain commands (see src-tauri/src/lib.rs).

export async function saveAuthToken(token: string): Promise<void> {
  await invoke("save_auth_token", { token });
}

export async function getAuthToken(): Promise<string | null> {
  return (await invoke<string | null>("get_auth_token")) ?? null;
}

export async function deleteAuthToken(): Promise<void> {
  await invoke("delete_auth_token");
}
