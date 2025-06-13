/// <reference types="vite/client" />

declare global {
  interface Window {
    __TAURI__: {
      core: {
        invoke: typeof import("@tauri-apps/api/core").invoke;
      };
      [key: string]: unknown;
    };
  }
}

export {};
