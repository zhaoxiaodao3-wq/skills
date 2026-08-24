// vite.config.mjs
import { defineConfig } from "file:///E:/code/frontend-local/.agents/routing/panel/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/code/frontend-local/.agents/routing/panel/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { readdirSync, statSync } from "node:fs";
var __vite_injected_original_import_meta_url = "file:///E:/code/frontend-local/.agents/routing/panel/vite.config.mjs";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var routerUrl = pathToFileURL(path.join(__dirname, "..", "router.mjs")).href;
var SKILLS_DIR = path.join(__dirname, "..", "..", "skills");
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    {
      name: "skill-routing-api",
      configureServer(server) {
        let routerMod;
        async function getRouter() {
          if (!routerMod) routerMod = await import(routerUrl);
          return routerMod;
        }
        server.middlewares.use("/api/graph", async (req, res) => {
          res.setHeader("Content-Type", "application/json");
          try {
            if (req.method === "GET") {
              const { loadGraph } = await getRouter();
              res.end(JSON.stringify(loadGraph()));
            } else if (req.method === "POST") {
              let body = "";
              for await (const chunk of req) body += chunk;
              const graph = JSON.parse(body);
              const { saveGraph } = await getRouter();
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
        server.middlewares.use("/api/list-dir", async (req, res) => {
          res.setHeader("Content-Type", "application/json");
          try {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end(JSON.stringify({ ok: false, errors: ["\u4EC5\u652F\u6301 POST"] }));
              return;
            }
            let body = "";
            for await (const chunk of req) body += chunk;
            let p;
            try {
              p = JSON.parse(body || "{}").path;
            } catch {
              p = void 0;
            }
            const target = p && typeof p === "string" ? path.resolve(p) : SKILLS_DIR;
            if (!statSync(target).isDirectory()) throw new Error("\u4E0D\u662F\u6587\u4EF6\u5939\uFF1A" + target);
            const dirs = readdirSync(target, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort((a, b) => a.localeCompare(b));
            res.end(JSON.stringify({ ok: true, path: target, parent: path.dirname(target), dirs }));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcY29kZVxcXFxmcm9udGVuZC1sb2NhbFxcXFwuYWdlbnRzXFxcXHJvdXRpbmdcXFxccGFuZWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGNvZGVcXFxcZnJvbnRlbmQtbG9jYWxcXFxcLmFnZW50c1xcXFxyb3V0aW5nXFxcXHBhbmVsXFxcXHZpdGUuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovY29kZS9mcm9udGVuZC1sb2NhbC8uYWdlbnRzL3JvdXRpbmcvcGFuZWwvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgcmVhZGRpclN5bmMsIHN0YXRTeW5jIH0gZnJvbSAnbm9kZTpmcydcblxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSlcbmNvbnN0IHJvdXRlclVybCA9IHBhdGhUb0ZpbGVVUkwocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ3JvdXRlci5tanMnKSkuaHJlZlxuY29uc3QgU0tJTExTX0RJUiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICcuLicsICdza2lsbHMnKVxuXG4vLyBcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdTY4NjVcdUZGMUFcdTZENEZcdTg5QzhcdTU2NjhcdThCRkJcdTRFMERcdTRFODZcdTY3MkNcdTU3MzBcdTY1ODdcdTRFRjZcdUZGMENcdTU5MERcdTc1Mjggcm91dGVyLm1qcyBcdTc2ODQgbG9hZEdyYXBoL3NhdmVHcmFwaCBcdThCRkJcdTUxOTkgU0tJTExfUk9VVElORy5tZFxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSgpLFxuICAgIHtcbiAgICAgIG5hbWU6ICdza2lsbC1yb3V0aW5nLWFwaScsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIGxldCByb3V0ZXJNb2RcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gZ2V0Um91dGVyKCkge1xuICAgICAgICAgIGlmICghcm91dGVyTW9kKSByb3V0ZXJNb2QgPSBhd2FpdCBpbXBvcnQocm91dGVyVXJsKVxuICAgICAgICAgIHJldHVybiByb3V0ZXJNb2RcbiAgICAgICAgfVxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2dyYXBoJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICAgICAgY29uc3QgeyBsb2FkR3JhcGggfSA9IGF3YWl0IGdldFJvdXRlcigpXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkobG9hZEdyYXBoKCkpKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgICAgICAgbGV0IGJvZHkgPSAnJ1xuICAgICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlcSkgYm9keSArPSBjaHVua1xuICAgICAgICAgICAgICBjb25zdCBncmFwaCA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgICAgICAgICAgY29uc3QgeyBzYXZlR3JhcGggfSA9IGF3YWl0IGdldFJvdXRlcigpXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoc2F2ZUdyYXBoKGdyYXBoKSkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNVxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgb2s6IGZhbHNlLCBlcnJvcnM6IFsnXHU0RUM1XHU2NTJGXHU2MzAxIEdFVC9QT1NUJ10gfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDBcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBvazogZmFsc2UsIGVycm9yczogW1N0cmluZyhlKV0gfSkpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvLyBcdThERUZcdTVGODRcdTkwMDlcdTYyRTlcdUZGMUFcdTUyMTdcdTUxRkFcdTYzMDdcdTVCOUFcdThERUZcdTVGODRcdTRFMEJcdTc2ODRcdTMwMTBcdTVCNTBcdTY1ODdcdTRFRjZcdTU5MzlcdTU0MERcdTMwMTFcdUZGMDhcdTUzRUFcdThCRkJcdTc2RUVcdTVGNTVcdTU0MERcdUZGMENcdTRFMERcdThCRkIvXHU0RTBEXHU0RTBBXHU0RjIwXHU0RUZCXHU0RjU1XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHVGRjA5XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvbGlzdC1kaXInLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDVcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IG9rOiBmYWxzZSwgZXJyb3JzOiBbJ1x1NEVDNVx1NjUyRlx1NjMwMSBQT1NUJ10gfSkpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGJvZHkgPSAnJ1xuICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXEpIGJvZHkgKz0gY2h1bmtcbiAgICAgICAgICAgIGxldCBwXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBwID0gSlNPTi5wYXJzZShib2R5IHx8ICd7fScpLnBhdGhcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBwID0gdW5kZWZpbmVkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBwICYmIHR5cGVvZiBwID09PSAnc3RyaW5nJyA/IHBhdGgucmVzb2x2ZShwKSA6IFNLSUxMU19ESVJcbiAgICAgICAgICAgIGlmICghc3RhdFN5bmModGFyZ2V0KS5pc0RpcmVjdG9yeSgpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjYyRlx1NjU4N1x1NEVGNlx1NTkzOVx1RkYxQScgKyB0YXJnZXQpXG4gICAgICAgICAgICBjb25zdCBkaXJzID0gcmVhZGRpclN5bmModGFyZ2V0LCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSlcbiAgICAgICAgICAgICAgLmZpbHRlcigoZSkgPT4gZS5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAubWFwKChlKSA9PiBlLm5hbWUpXG4gICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYikpXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgb2s6IHRydWUsIHBhdGg6IHRhcmdldCwgcGFyZW50OiBwYXRoLmRpcm5hbWUodGFyZ2V0KSwgZGlycyB9KSlcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMFxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IG9rOiBmYWxzZSwgZXJyb3JzOiBbU3RyaW5nKGUpXSB9KSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVSxTQUFTLG9CQUFvQjtBQUNqVyxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlLHFCQUFxQjtBQUM3QyxPQUFPLFVBQVU7QUFDakIsU0FBUyxhQUFhLGdCQUFnQjtBQUpzSyxJQUFNLDJDQUEyQztBQU03UCxJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUM3RCxJQUFNLFlBQVksY0FBYyxLQUFLLEtBQUssV0FBVyxNQUFNLFlBQVksQ0FBQyxFQUFFO0FBQzFFLElBQU0sYUFBYSxLQUFLLEtBQUssV0FBVyxNQUFNLE1BQU0sUUFBUTtBQUc1RCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFDdEIsWUFBSTtBQUNKLHVCQUFlLFlBQVk7QUFDekIsY0FBSSxDQUFDLFVBQVcsYUFBWSxNQUFNLE9BQU87QUFDekMsaUJBQU87QUFBQSxRQUNUO0FBQ0EsZUFBTyxZQUFZLElBQUksY0FBYyxPQUFPLEtBQUssUUFBUTtBQUN2RCxjQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxjQUFJO0FBQ0YsZ0JBQUksSUFBSSxXQUFXLE9BQU87QUFDeEIsb0JBQU0sRUFBRSxVQUFVLElBQUksTUFBTSxVQUFVO0FBQ3RDLGtCQUFJLElBQUksS0FBSyxVQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQUEsWUFDckMsV0FBVyxJQUFJLFdBQVcsUUFBUTtBQUNoQyxrQkFBSSxPQUFPO0FBQ1gsK0JBQWlCLFNBQVMsSUFBSyxTQUFRO0FBQ3ZDLG9CQUFNLFFBQVEsS0FBSyxNQUFNLElBQUk7QUFDN0Isb0JBQU0sRUFBRSxVQUFVLElBQUksTUFBTSxVQUFVO0FBQ3RDLGtCQUFJLElBQUksS0FBSyxVQUFVLFVBQVUsS0FBSyxDQUFDLENBQUM7QUFBQSxZQUMxQyxPQUFPO0FBQ0wsa0JBQUksYUFBYTtBQUNqQixrQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTyxRQUFRLENBQUMsNkJBQWMsRUFBRSxDQUFDLENBQUM7QUFBQSxZQUNqRTtBQUFBLFVBQ0YsU0FBUyxHQUFHO0FBQ1YsZ0JBQUksYUFBYTtBQUNqQixnQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQSxVQUM1RDtBQUFBLFFBQ0YsQ0FBQztBQUVELGVBQU8sWUFBWSxJQUFJLGlCQUFpQixPQUFPLEtBQUssUUFBUTtBQUMxRCxjQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxjQUFJO0FBQ0YsZ0JBQUksSUFBSSxXQUFXLFFBQVE7QUFDekIsa0JBQUksYUFBYTtBQUNqQixrQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTyxRQUFRLENBQUMseUJBQVUsRUFBRSxDQUFDLENBQUM7QUFDM0Q7QUFBQSxZQUNGO0FBQ0EsZ0JBQUksT0FBTztBQUNYLDZCQUFpQixTQUFTLElBQUssU0FBUTtBQUN2QyxnQkFBSTtBQUNKLGdCQUFJO0FBQ0Ysa0JBQUksS0FBSyxNQUFNLFFBQVEsSUFBSSxFQUFFO0FBQUEsWUFDL0IsUUFBUTtBQUNOLGtCQUFJO0FBQUEsWUFDTjtBQUNBLGtCQUFNLFNBQVMsS0FBSyxPQUFPLE1BQU0sV0FBVyxLQUFLLFFBQVEsQ0FBQyxJQUFJO0FBQzlELGdCQUFJLENBQUMsU0FBUyxNQUFNLEVBQUUsWUFBWSxFQUFHLE9BQU0sSUFBSSxNQUFNLHlDQUFXLE1BQU07QUFDdEUsa0JBQU0sT0FBTyxZQUFZLFFBQVEsRUFBRSxlQUFlLEtBQUssQ0FBQyxFQUNyRCxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxFQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFDakIsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLGdCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsSUFBSSxNQUFNLE1BQU0sUUFBUSxRQUFRLEtBQUssUUFBUSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFBQSxVQUN4RixTQUFTLEdBQUc7QUFDVixnQkFBSSxhQUFhO0FBQ2pCLGdCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFBLFVBQzVEO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
