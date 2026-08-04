use keyring::Entry;
#[cfg(target_os = "macos")]
use tauri::Manager;

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

#[cfg(target_os = "macos")]
tauri_nspanel::tauri_panel! {
    panel!(DockPanel {
        config: {
            can_become_key_window: true,
            is_floating_panel: true
        }
    })
}

/// The dock must float over every Space, including fullscreen apps. A plain
/// NSWindow cannot join a fullscreen Space (tauri-apps/tauri#11488), so the
/// window becomes a non-activating NSPanel: it floats over fullscreen apps
/// and its controls never steal focus from them. The class swap keeps the
/// regular window API working from JS (show/hide/setPosition).
#[cfg(target_os = "macos")]
fn make_dock_fullscreen_capable(window: &tauri::WebviewWindow) {
    use tauri_nspanel::{CollectionBehavior, PanelLevel, StyleMask, WebviewWindowExt};

    if let Ok(panel) = window.to_panel::<DockPanel>() {
        panel.set_level(PanelLevel::Floating.value());
        panel.set_style_mask(StyleMask::empty().nonactivating_panel().into());
        panel.set_collection_behavior(
            CollectionBehavior::new()
                .can_join_all_spaces()
                .full_screen_auxiliary()
                .into(),
        );
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_opener::init());

    #[cfg(target_os = "macos")]
    let builder = builder.plugin(tauri_nspanel::init());

    builder
        .setup(|_app| {
            #[cfg(target_os = "macos")]
            if let Some(dock) = _app.get_webview_window("dock") {
                make_dock_fullscreen_capable(&dock);
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
