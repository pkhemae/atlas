use keyring::Entry;
use tauri::Manager;

// The auth token lives in the OS keychain (macOS Keychain, Windows
// Credential Manager, Secret Service on Linux) — never in a plain file.
const KEYCHAIN_SERVICE: &str = "com.atlas.desktop";
const KEYCHAIN_ACCOUNT: &str = "auth-token";

fn keychain_entry() -> Result<Entry, String> {
    Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT).map_err(|e| e.to_string())
}

// async: keyring calls block (and may show a keychain prompt) — they must
// stay off the webview's main thread
#[tauri::command]
async fn save_auth_token(token: String) -> Result<(), String> {
    keychain_entry()?
        .set_password(&token)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_auth_token() -> Result<Option<String>, String> {
    match keychain_entry()?.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn delete_auth_token() -> Result<(), String> {
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

    match window.to_panel::<DockPanel>() {
        Ok(panel) => {
            panel.set_level(PanelLevel::Floating.value());
            panel.set_style_mask(StyleMask::empty().nonactivating_panel().into());
            panel.set_collection_behavior(
                CollectionBehavior::new()
                    .can_join_all_spaces()
                    .full_screen_auxiliary()
                    .into(),
            );
        }
        // a silent failure would quietly regress the over-fullscreen dock
        Err(error) => eprintln!("dock: NSPanel conversion failed: {error:?}"),
    }
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // single-instance must be the first registered plugin: a second launch
    // would otherwise spawn a second dock panel racing the first
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app)
        }))
        .setup(|_app| {
            #[cfg(target_os = "macos")]
            match _app.get_webview_window("dock") {
                Some(dock) => make_dock_fullscreen_capable(&dock),
                None => eprintln!("dock: window not found — fullscreen overlay disabled"),
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_auth_token,
            get_auth_token,
            delete_auth_token
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, _event| {
            // re-clicking the Dock icon must always bring the app back —
            // without this, closing the main window leaves a live process
            // with no reachable UI (the hidden dock keeps it alive)
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Reopen { .. } = _event {
                show_main_window(_app);
            }
        });
}
