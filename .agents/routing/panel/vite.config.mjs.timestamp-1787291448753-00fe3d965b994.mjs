// vite.config.mjs
import { defineConfig } from "file:///E:/code/frontend-local/.agents/routing/panel/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/code/frontend-local/.agents/routing/panel/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
var __vite_injected_original_import_meta_url = "file:///E:/code/frontend-local/.agents/routing/panel/vite.config.mjs";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    {
      name: "skill-routing-api",
      configureServer(server) {
        server.middlewares.use("/api/graph", async (req, res) => {
          const routerUrl = pathToFileURL(path.join(__dirname, "..", "router.mjs")).href;
          res.setHeader("Content-Type", "application/json");
          try {
            if (req.method === "GET") {
              const { loadGraph } = await import(routerUrl);
              res.end(JSON.stringify(loadGraph()));
            } else if (req.method === "POST") {
              let body = "";
              for await (const chunk of req) body += chunk;
              const graph = JSON.parse(body);
              const { saveGraph } = await import(routerUrl);
              res.end(JSON.stringify(saveGraph(graph)));
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ ok: false, errors: ["\u4EC5\u652F\u6301 GET/POST"] }));
            }
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, errors: [String(e)] }));
          }
        });
      }
    }
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcY29kZVxcXFxmcm9udGVuZC1sb2NhbFxcXFwuYWdlbnRzXFxcXHJvdXRpbmdcXFxccGFuZWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGNvZGVcXFxcZnJvbnRlbmQtbG9jYWxcXFxcLmFnZW50c1xcXFxyb3V0aW5nXFxcXHBhbmVsXFxcXHZpdGUuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovY29kZS9mcm9udGVuZC1sb2NhbC8uYWdlbnRzL3JvdXRpbmcvcGFuZWwvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKVxuXG4vLyBcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTY4NjVcdUZGMUFcdTZENEZcdTg5QzhcdTU2NjhcdThCRkJcdTRFMERcdTRFODZcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdUZGMENcdThGRDlcdTkxQ0NcdTU5MERcdTc1Mjggcm91dGVyLm1qcyBcdTc2ODQgbG9hZEdyYXBoKCkgXHU4QkZCXHU1M0Q2IFNLSUxMX1JPVVRJTkcubWRcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICB7XG4gICAgICBuYW1lOiAnc2tpbGwtcm91dGluZy1hcGknLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2dyYXBoJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgY29uc3Qgcm91dGVyVXJsID0gcGF0aFRvRmlsZVVSTChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAncm91dGVyLm1qcycpKS5ocmVmXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICAgICAgY29uc3QgeyBsb2FkR3JhcGggfSA9IGF3YWl0IGltcG9ydChyb3V0ZXJVcmwpXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkobG9hZEdyYXBoKCkpKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgICAgICAgbGV0IGJvZHkgPSAnJ1xuICAgICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlcSkgYm9keSArPSBjaHVua1xuICAgICAgICAgICAgICBjb25zdCBncmFwaCA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgICAgICAgICAgY29uc3QgeyBzYXZlR3JhcGggfSA9IGF3YWl0IGltcG9ydChyb3V0ZXJVcmwpXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoc2F2ZUdyYXBoKGdyYXBoKSkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNVxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgb2s6IGZhbHNlLCBlcnJvcnM6IFsnXHU0RUM1XHU2NTJGXHU2MzAxIEdFVC9QT1NUJ10gfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDBcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBvazogZmFsc2UsIGVycm9yczogW1N0cmluZyhlKV0gfSkpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1UsU0FBUyxvQkFBb0I7QUFDalcsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZSxxQkFBcUI7QUFDN0MsT0FBTyxVQUFVO0FBSDJMLElBQU0sMkNBQTJDO0FBSzdQLElBQU0sWUFBWSxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBRzdELElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixnQkFBZ0IsUUFBUTtBQUN0QixlQUFPLFlBQVksSUFBSSxjQUFjLE9BQU8sS0FBSyxRQUFRO0FBQ3ZELGdCQUFNLFlBQVksY0FBYyxLQUFLLEtBQUssV0FBVyxNQUFNLFlBQVksQ0FBQyxFQUFFO0FBQzFFLGNBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELGNBQUk7QUFDRixnQkFBSSxJQUFJLFdBQVcsT0FBTztBQUN4QixvQkFBTSxFQUFFLFVBQVUsSUFBSSxNQUFNLE9BQU87QUFDbkMsa0JBQUksSUFBSSxLQUFLLFVBQVUsVUFBVSxDQUFDLENBQUM7QUFBQSxZQUNyQyxXQUFXLElBQUksV0FBVyxRQUFRO0FBQ2hDLGtCQUFJLE9BQU87QUFDWCwrQkFBaUIsU0FBUyxJQUFLLFNBQVE7QUFDdkMsb0JBQU0sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUM3QixvQkFBTSxFQUFFLFVBQVUsSUFBSSxNQUFNLE9BQU87QUFDbkMsa0JBQUksSUFBSSxLQUFLLFVBQVUsVUFBVSxLQUFLLENBQUMsQ0FBQztBQUFBLFlBQzFDLE9BQU87QUFDTCxrQkFBSSxhQUFhO0FBQ2pCLGtCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsSUFBSSxPQUFPLFFBQVEsQ0FBQyw2QkFBYyxFQUFFLENBQUMsQ0FBQztBQUFBLFlBQ2pFO0FBQUEsVUFDRixTQUFTLEdBQUc7QUFDVixnQkFBSSxhQUFhO0FBQ2pCLGdCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFBLFVBQzVEO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
