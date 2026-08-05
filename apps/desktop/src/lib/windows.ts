import { currentMonitor, LogicalPosition } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const DOCK_WIDTH = 208; // keep in sync with tauri.conf.json windows[dock].width
const DOCK_TOP = 16;

/**
 * Places the dock horizontally centered near the top of the current
 * monitor's work area (below the menu bar) and shows it. Returns false
 * when the dock window doesn't exist — callers must NOT hide the main
 * window in that case, or the app ends up with no visible window.
 */
export async function showDock(): Promise<boolean> {
  const dock = await WebviewWindow.getByLabel("dock");
  if (!dock) return false;

  const monitor = await currentMonitor();
  if (monitor) {
    const scale = monitor.scaleFactor;
    const area = monitor.workArea ?? {
      position: monitor.position,
      size: monitor.size,
    };
    const x =
      area.position.x / scale + (area.size.width / scale - DOCK_WIDTH) / 2;
    const y = area.position.y / scale + DOCK_TOP;
    await dock.setPosition(new LogicalPosition(x, y));
  }

  await dock.show();
  return true;
}

export async function hideMain() {
  const main = await WebviewWindow.getByLabel("main");
  await main?.hide();
}

export async function hideDock() {
  const dock = await WebviewWindow.getByLabel("dock");
  await dock?.hide();
}

export async function showMain() {
  const main = await WebviewWindow.getByLabel("main");
  await main?.show();
  await main?.setFocus();
}
