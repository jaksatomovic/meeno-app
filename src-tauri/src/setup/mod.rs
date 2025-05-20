use tauri::{App, WebviewWindow};

#[cfg(target_os = "macos")]
mod mac;

#[cfg(target_os = "linux")]
mod linux;

#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "macos")]
pub use mac::*;

#[cfg(target_os = "windows")]
pub use windows::*;

#[cfg(target_os = "linux")]
pub use linux::*;

pub fn default(app: &mut App, main_window: WebviewWindow, settings_window: WebviewWindow) {
    // Development mode automatically opens the console: https://tauri.app/develop/debug
    #[cfg(all(dev, debug_assertions))]
    main_window.open_devtools();

    platform(app, main_window.clone(), settings_window.clone());
}
