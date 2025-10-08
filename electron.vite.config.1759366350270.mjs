// electron.vite.config.ts
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
var __electron_vite_injected_dirname = "E:\\GITHUB\\mimiRpa";
var aliases = {
  "@/app": resolve(__electron_vite_injected_dirname, "app"),
  "@/electron": resolve(__electron_vite_injected_dirname, "electron"),
  "@/lib": resolve(__electron_vite_injected_dirname, "lib"),
  "@/resources": resolve(__electron_vite_injected_dirname, "resources")
};
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__electron_vite_injected_dirname, "electron/main/main.ts")
        }
      }
    },
    resolve: {
      alias: aliases
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__electron_vite_injected_dirname, "electron/preload/preload.ts")
        }
      }
    },
    resolve: {
      alias: aliases
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: "./app",
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "app/index.html")
        }
      }
    },
    resolve: {
      alias: aliases
    },
    plugins: [tailwindcss(), react()]
  }
});
export {
  electron_vite_config_default as default
};
