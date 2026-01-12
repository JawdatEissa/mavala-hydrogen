// vite.config.ts
import { vitePlugin as remix } from "file:///C:/Users/Incre/OneDrive/Desktop/courses/Mavala_Project/mavala-hydrogen/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///C:/Users/Incre/OneDrive/Desktop/courses/Mavala_Project/mavala-hydrogen/node_modules/vite/dist/node/index.js";
import { vercelPreset } from "file:///C:/Users/Incre/OneDrive/Desktop/courses/Mavala_Project/mavala-hydrogen/node_modules/@vercel/remix/vite.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Incre\\OneDrive\\Desktop\\courses\\Mavala_Project\\mavala-hydrogen";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true
      }
    })
  ],
  server: {
    allowedHosts: [".ngrok-free.dev", ".ngrok.io", ".trycloudflare.com", "ddba4ebca75d9c92-69-196-89-210.serveousercontent.com"]
  },
  publicDir: "public",
  resolve: {
    alias: {
      "~": path.resolve(__vite_injected_original_dirname, "./app")
    }
  },
  css: {
    postcss: "./postcss.config.js"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxJbmNyZVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGNvdXJzZXNcXFxcTWF2YWxhX1Byb2plY3RcXFxcbWF2YWxhLWh5ZHJvZ2VuXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxJbmNyZVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGNvdXJzZXNcXFxcTWF2YWxhX1Byb2plY3RcXFxcbWF2YWxhLWh5ZHJvZ2VuXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9JbmNyZS9PbmVEcml2ZS9EZXNrdG9wL2NvdXJzZXMvTWF2YWxhX1Byb2plY3QvbWF2YWxhLWh5ZHJvZ2VuL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peCB9IGZyb20gJ0ByZW1peC1ydW4vZGV2JztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgdmVyY2VsUHJlc2V0IH0gZnJvbSAnQHZlcmNlbC9yZW1peC92aXRlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVtaXgoe1xuICAgICAgcHJlc2V0czogW3ZlcmNlbFByZXNldCgpXSxcbiAgICAgIGZ1dHVyZToge1xuICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgdjNfcmVsYXRpdmVTcGxhdFBhdGg6IHRydWUsXG4gICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXG4gICAgICAgIHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcbiAgICAgICAgdjNfc2luZ2xlRmV0Y2g6IHRydWUsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBhbGxvd2VkSG9zdHM6IFsnLm5ncm9rLWZyZWUuZGV2JywgJy5uZ3Jvay5pbycsICcudHJ5Y2xvdWRmbGFyZS5jb20nLCAnZGRiYTRlYmNhNzVkOWM5Mi02OS0xOTYtODktMjEwLnNlcnZlb3VzZXJjb250ZW50LmNvbSddLFxuICB9LFxuICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICd+JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vYXBwJyksXG4gICAgfSxcbiAgfSxcbiAgY3NzOiB7XG4gICAgcG9zdGNzczogJy4vcG9zdGNzcy5jb25maWcuanMnLFxuICB9LFxufSk7XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1osU0FBUyxjQUFjLGFBQWE7QUFDeGIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFBQSxNQUN4QixRQUFRO0FBQUEsUUFDTixtQkFBbUI7QUFBQSxRQUNuQixzQkFBc0I7QUFBQSxRQUN0QixxQkFBcUI7QUFBQSxRQUNyQix1QkFBdUI7QUFBQSxRQUN2QixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGNBQWMsQ0FBQyxtQkFBbUIsYUFBYSxzQkFBc0Isc0RBQXNEO0FBQUEsRUFDN0g7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxFQUNYO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
