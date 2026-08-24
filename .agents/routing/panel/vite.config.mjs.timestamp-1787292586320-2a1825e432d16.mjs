// vite.config.mjs
import { defineConfig } from "file:///E:/code/frontend-local/.agents/routing/panel/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/code/frontend-local/.agents/routing/panel/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
var __vite_injected_original_import_meta_url = "file:///E:/code/frontend-local/.agents/routing/panel/vite.config.mjs";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var routerUrl = pathToFileURL(path.join(__dirname, "..", "router.mjs")).href;
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
      }
    }
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcY29kZVxcXFxmcm9udGVuZC1sb2NhbFxcXFwuYWdlbnRzXFxcXHJvdXRpbmdcXFxccGFuZWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGNvZGVcXFxcZnJvbnRlbmQtbG9jYWxcXFxcLmFnZW50c1xcXFxyb3V0aW5nXFxcXHBhbmVsXFxcXHZpdGUuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovY29kZS9mcm9udGVuZC1sb2NhbC8uYWdlbnRzL3JvdXRpbmcvcGFuZWwvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKVxuY29uc3Qgcm91dGVyVXJsID0gcGF0aFRvRmlsZVVSTChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAncm91dGVyLm1qcycpKS5ocmVmXG5cbi8vIFx1NjcyQ1x1NTczMFx1NjU4N1x1NEVGNlx1Njg2NVx1RkYxQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1OEJGQlx1NEUwRFx1NEU4Nlx1NjcyQ1x1NTczMFx1NjU4N1x1NEVGNlx1RkYwQ1x1NTkwRFx1NzUyOCByb3V0ZXIubWpzIFx1NzY4NCBsb2FkR3JhcGgvc2F2ZUdyYXBoIFx1OEJGQlx1NTE5OSBTS0lMTF9ST1VUSU5HLm1kXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAge1xuICAgICAgbmFtZTogJ3NraWxsLXJvdXRpbmctYXBpJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgbGV0IHJvdXRlck1vZFxuICAgICAgICBhc3luYyBmdW5jdGlvbiBnZXRSb3V0ZXIoKSB7XG4gICAgICAgICAgaWYgKCFyb3V0ZXJNb2QpIHJvdXRlck1vZCA9IGF3YWl0IGltcG9ydChyb3V0ZXJVcmwpXG4gICAgICAgICAgcmV0dXJuIHJvdXRlck1vZFxuICAgICAgICB9XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvZ3JhcGgnLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgICAgICAgICAgICBjb25zdCB7IGxvYWRHcmFwaCB9ID0gYXdhaXQgZ2V0Um91dGVyKClcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShsb2FkR3JhcGgoKSkpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgICAgICAgICBsZXQgYm9keSA9ICcnXG4gICAgICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgcmVxKSBib2R5ICs9IGNodW5rXG4gICAgICAgICAgICAgIGNvbnN0IGdyYXBoID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgICAgICAgICBjb25zdCB7IHNhdmVHcmFwaCB9ID0gYXdhaXQgZ2V0Um91dGVyKClcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShzYXZlR3JhcGgoZ3JhcGgpKSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA1XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBvazogZmFsc2UsIGVycm9yczogWydcdTRFQzVcdTY1MkZcdTYzMDEgR0VUL1BPU1QnXSB9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMFxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IG9rOiBmYWxzZSwgZXJyb3JzOiBbU3RyaW5nKGUpXSB9KSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVSxTQUFTLG9CQUFvQjtBQUNqVyxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlLHFCQUFxQjtBQUM3QyxPQUFPLFVBQVU7QUFIMkwsSUFBTSwyQ0FBMkM7QUFLN1AsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFDN0QsSUFBTSxZQUFZLGNBQWMsS0FBSyxLQUFLLFdBQVcsTUFBTSxZQUFZLENBQUMsRUFBRTtBQUcxRSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFDdEIsWUFBSTtBQUNKLHVCQUFlLFlBQVk7QUFDekIsY0FBSSxDQUFDLFVBQVcsYUFBWSxNQUFNLE9BQU87QUFDekMsaUJBQU87QUFBQSxRQUNUO0FBQ0EsZUFBTyxZQUFZLElBQUksY0FBYyxPQUFPLEtBQUssUUFBUTtBQUN2RCxjQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxjQUFJO0FBQ0YsZ0JBQUksSUFBSSxXQUFXLE9BQU87QUFDeEIsb0JBQU0sRUFBRSxVQUFVLElBQUksTUFBTSxVQUFVO0FBQ3RDLGtCQUFJLElBQUksS0FBSyxVQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQUEsWUFDckMsV0FBVyxJQUFJLFdBQVcsUUFBUTtBQUNoQyxrQkFBSSxPQUFPO0FBQ1gsK0JBQWlCLFNBQVMsSUFBSyxTQUFRO0FBQ3ZDLG9CQUFNLFFBQVEsS0FBSyxNQUFNLElBQUk7QUFDN0Isb0JBQU0sRUFBRSxVQUFVLElBQUksTUFBTSxVQUFVO0FBQ3RDLGtCQUFJLElBQUksS0FBSyxVQUFVLFVBQVUsS0FBSyxDQUFDLENBQUM7QUFBQSxZQUMxQyxPQUFPO0FBQ0wsa0JBQUksYUFBYTtBQUNqQixrQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTyxRQUFRLENBQUMsNkJBQWMsRUFBRSxDQUFDLENBQUM7QUFBQSxZQUNqRTtBQUFBLFVBQ0YsU0FBUyxHQUFHO0FBQ1YsZ0JBQUksYUFBYTtBQUNqQixnQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQSxVQUM1RDtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
