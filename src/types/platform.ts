import { IAppearanceStore } from "@/stores/appearanceStore";
import { IConnectStore } from "@/stores/connectStore";
import { IShortcutsStore } from "@/stores/shortcutsStore";
import { IStartupStore } from "@/stores/startupStore";
import { AppTheme } from "@/types/index";

export interface EventPayloads {
  "language-changed": {
    language: string;
  };
  "theme-changed": string;
  "tauri://focus": void;
  "endpoint-changed": {
    endpoint: string;
    endpoint_http: string;
    endpoint_websocket: string;
  };
  "auth-changed": {
    auth: Record<string, unknown>;
  };
  "userInfo-changed": {
    userInfo: Record<string, unknown>;
  };
  open_settings: string | "";
  tab_index: string | "";
  login_or_logout: unknown;
  "show-coco": void;
  connector_data_change: void;
  datasourceData_change: void;
  "ws-error": void;
  "ws-message": void;
  [key: `ws-error-${string}`]: {
    error: {
      reason: string;
    };
    status: number;
  };
  [key: `ws-message-${string}`]: string;
  "change-startup-store": IStartupStore;
  "change-shortcuts-store": IShortcutsStore;
  "change-connect-store": IConnectStore;
  "change-appearance-store": IAppearanceStore;
}

// Window operation interface
export interface WindowOperations {
  setWindowSize: (width: number, height: number) => Promise<void>;
  hideWindow: () => Promise<void>;
  showWindow: () => Promise<void>;
  setAlwaysOnTop: (isPinned: boolean) => Promise<void>;
  setShadow(enable: boolean): Promise<void>;
  getWebviewWindow: () => Promise<any>;
  getWindowByLabel: (label: string) => Promise<{
    show: () => Promise<void>;
    setFocus: () => Promise<void>;
    center: () => Promise<void>;
    close: () => Promise<void>;
  } | null>;
  createWindow: (label: string, options: any) => Promise<void>;
  getAllWindows: () => Promise<any[]>;
  getCurrentWindow: () => Promise<any>;
  createWebviewWindow: (label: string, options: any) => Promise<any>;
  listenWindowEvent: (
    event: string,
    callback: (event: any) => void
  ) => Promise<() => void>;
}

// Theme and event related interface
export interface ThemeAndEvents {
  emitEvent: (event: string, payload?: any) => Promise<void>;
  listenEvent: <K extends keyof EventPayloads>(
    event: K,
    callback: (event: { payload: EventPayloads[K] }) => void
  ) => Promise<() => void>;
  setWindowTheme: (theme: string | null) => Promise<void>;
  getWindowTheme: () => Promise<string>;
  onThemeChanged: (
    callback: (payload: { payload: string }) => void
  ) => Promise<void>;
  listenThemeChanged: (
    callback: (theme: AppTheme) => void
  ) => Promise<() => void>;
}

// System operations interface
export interface SystemOperations {
  invokeBackend: <T = unknown>(command: string, args?: any) => Promise<T>;
  convertFileSrc: (path: string) => string;
  checkScreenRecordingPermission: () => Promise<boolean>;
  requestScreenRecordingPermission: () => void;
  getScreenshotableMonitors: () => Promise<any[]>;
  getScreenshotableWindows: () => Promise<any[]>;
  captureMonitorScreenshot: (id: number) => Promise<string>;
  captureWindowScreenshot: (id: number) => Promise<string>;
  getFileMetadata: (path: string) => Promise<any>;
  getFileIcon: (path: string, size: number) => Promise<string>;
  checkUpdate: () => Promise<any>;
  relaunchApp: () => Promise<void>;
  isTauri: () => boolean;
  openExternal: (url: string) => Promise<void>;
  commands: <T>(commandName: string, ...args: any[]) => Promise<T>;
  isWindows10: () => Promise<boolean>;
}

// Base platform adapter interface
export interface BasePlatformAdapter
  extends WindowOperations,
    ThemeAndEvents,
    SystemOperations {}
