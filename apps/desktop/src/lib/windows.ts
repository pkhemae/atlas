import { currentMonitor, LogicalPosition } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const DOCK_WIDTH = 224;
const DOCK_MARGIN = 24;
const DOCK_TOP = 48;

/**
 * Places the dock at the top-right of the current monitor and shows it.
 */
export async function showDock() {
  const dock = await WebviewWindow.getByLabel("dock");
  if (!dock) return;

  const monitor = await currentMonitor();
  if (monitor) {
    const scale = monitor.scaleFactor;
    const x =
      monitor.position.x / scale +
      monitor.size.width / scale -
      DOCK_WIDTH -
      DOCK_MARGIN;
    const y = monitor.position.y / scale + DOCK_TOP;
    await dock.setPosition(new LogicalPosition(x, y));
  }

  await dock.show();
}

export async function hideMain() {
  const main = await WebviewWindow.getByLabel("main");
  await main?.hide();
}

export async function showMainHideDock() {
  const main = await WebviewWindow.getByLabel("main");
  await main?.show();
  await main?.setFocus();
  const dock = await WebviewWindow.getByLabel("dock");
  await dock?.hide();
}
