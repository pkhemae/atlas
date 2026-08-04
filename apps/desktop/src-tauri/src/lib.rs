use keyring::Entry;

// The auth token lives in the OS keychain (macOS Keychain, Windows
// Credential Manager, Secret Service on Linux) — never in a plain file.
const KEYCHAIN_SERVICE: &str = "com.atlas.desktop";
const KEYCHAIN_ACCOUNT: &str = "auth-token";

fn keychain_entry() -> Result<Entry, String> {
    Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_auth_token(token: String) -> Result<(), String> {
    keychain_entry()?
        .set_password(&token)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_auth_token() -> Result<Option<String>, String> {
    match keychain_entry()?.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn delete_auth_token() -> Result<(), String> {
    match keychain_entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

/// The dock must float over every Space, including fullscreen apps.
/// `visibleOnAllWorkspaces` only sets canJoinAllSpaces; the
/// fullScreenAuxiliary bit and the elevated window level need raw AppKit.
#[cfg(target_os = "macos")]
fn make_dock_fullscreen_capable(window: &tauri::WebviewWindow) {
    use objc2::msg_send;
    use objc2::runtime::AnyObject;

    // NSWindowCollectionBehavior: canJoinAllSpaces | fullScreenAuxiliary
    const COLLECTION_BEHAVIOR: usize = (1 << 0) | (1 << 8);
    // NSStatusWindowLevel — above fullscreen app content
    const LEVEL: isize = 25;

    if let Ok(ns_window) = window.ns_window() {
        let ns_window = ns_window as *mut AnyObject;
        unsafe {
            let _: () = msg_send![ns_window, setCollectionBehavior: COLLECTION_BEHAVIOR];
            let _: () = msg_send![ns_window, setLevel: LEVEL];
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            #[cfg(target_os = "macos")]
            {
                use tauri::Manager;
                if let Some(dock) = _app.get_webview_window("dock") {
                    make_dock_fullscreen_capable(&dock);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_auth_token,
            get_auth_token,
            delete_auth_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
