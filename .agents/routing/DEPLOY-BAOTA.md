# Skill 路由画板 — 宝塔部署详细步骤

适用：宝塔面板（Linux）+ 已确认「Nginx + Node API + 站点密码访问」。

推荐目录（下文均按此写）：

```text
/www/wwwroot/skill-routing/
├── server.mjs
├── router.mjs
├── package.json
├── SKILL_ROUTING.md
├── local-config.json          # 上线后在服务器生成/修改
├── skill-routing.schema.json
├── panel/
│   └── dist/                  # 前端构建产物（必有）
│   └── scripts/               # 可上传；Linux 用不上 ps1
└── （旁路）/www/wwwroot/skill-routing-skills/   # 建议 skills 单独目录
```

---

## 〇、本机准备（Windows 开发机）

在 `E:\code\frontend-local\.agents\routing` 执行：

```powershell
cd E:\code\frontend-local\.agents\routing\panel
npm install
npm run build
```

确认存在：`panel\dist\index.html`。

打包上传内容（可打 zip）：

- `server.mjs`、`router.mjs`、`package.json`
- `SKILL_ROUTING.md`、`skill-routing.schema.json`（可选 schema）
- `panel/dist/` 整个目录
- 你的 `skills` 仓库目录（或服务器上另建空目录再配路径）
- **不要**上传本机 `local-config.json`（路径是 Windows 的）；到服务器再写

---

## 一、宝塔：创建网站

1. 登录宝塔 → **网站** → **添加站点**
2. 域名：填你的域名（或先用 IP 测试，后面再绑域名）
3. 根目录：选 `/www/wwwroot/skill-routing`（没有就新建）
4. PHP：选 **纯静态**（不需要 PHP）
5. 创建完成后，用宝塔 **文件** 把上面准备的文件上传到该目录（保持结构）

建议 skills 目录：

```text
/www/wwwroot/skill-routing-skills/
```

把本机 `E:\code\frontend-local\.agents\skills` 内容同步上去（或先空着，上线后再配）。

---

## 二、服务器写 local-config.json

在 `/www/wwwroot/skill-routing/local-config.json` 新建：

```json
{
  "routingMdPath": "/www/wwwroot/skill-routing/SKILL_ROUTING.md",
  "skillsRoot": "/www/wwwroot/skill-routing-skills",
  "updatedAt": "2026-08-21"
}
```

路径必须是**服务器上的绝对路径**，且 MD 里要有 `SKILL_GRAPH_START/END` 机器块。

---

## 三、安装 Node 并用 PM2 启动 API+静态

1. 宝塔 → **软件商店** → 安装 **PM2管理器**（或 Node 版本管理 + PM2）
2. 确保 Node ≥ 18
3. SSH 或宝塔终端进入目录：

```bash
cd /www/wwwroot/skill-routing
# 生产服务零依赖，无需 npm install（除非你改用了其它包）
PORT=5174 node server.mjs
```

先手动跑一下，浏览器访问不通没关系；看终端是否打印：

```text
[skill-routing] http://127.0.0.1:5174
```

另开 SSH 测健康检查：

```bash
curl -s http://127.0.0.1:5174/api/health
```

应返回 `"ok":true`。

4. Ctrl+C 停掉后，用 PM2 常驻：

**方式 A — 宝塔 PM2 界面**

- 添加项目  
- 启动文件：`/www/wwwroot/skill-routing/server.mjs`  
- 运行目录：`/www/wwwroot/skill-routing`  
- 名称：`skill-routing`  
- 端口：`5174`（若界面有该项）

**方式 B — 命令行**

```bash
cd /www/wwwroot/skill-routing
pm2 start server.mjs --name skill-routing --env PORT=5174
# 若 PM2 传 env 不便：
PORT=5174 pm2 start server.mjs --name skill-routing
pm2 save
pm2 startup
```

确认：

```bash
pm2 status
curl -s http://127.0.0.1:5174/api/health
```

---

## 四、Nginx 反代整站到 Node（推荐）

因为 `server.mjs` **同时提供** `/api` 和 `panel/dist` 静态页，宝塔站点最简单做法是：**整站反代到 5174**。

1. 网站 → 你的站点 → **设置** → **反向代理** → **添加反向代理**
2. 代理名称：`skill-routing`
3. 目标 URL：`http://127.0.0.1:5174`
4. 发送域名：`$host`（默认即可）
5. 提交后，用域名访问首页应能打开画板

若你坚持「Nginx 自己托管静态、只反代 /api」：

1. 网站根目录指到 `/www/wwwroot/skill-routing/panel/dist`
2. 反向代理路径填 `/api`，目标 `http://127.0.0.1:5174`
3. 并启动服务时加环境变量关闭静态（避免混用）：

```bash
STATIC_DIR= PORT=5174 pm2 start server.mjs --name skill-routing
```

（一般**不必**拆，整站反代更省事。）

---

## 五、开启密码访问（方案 A）

1. 网站 → 设置 → **密码访问**（有的版本叫「基本认证」「访问限制」）
2. 开启 → 设置用户名、密码
3. 保存后，浏览器打开站点会先弹出账号密码框

这样即可防止路人改你的路由图谱。

可选加强：

- 宝塔 **防火墙 / 安全** 只放行 80/443
- 不要把 5174 对公网开放（只监听 127.0.0.1，本仓库 `server.mjs` 已绑定 `127.0.0.1`）

---

## 六、首次打开画板时的配置

1. 浏览器访问你的域名，输入宝塔密码访问账号
2. 若已写好服务器上的 `local-config.json`，应直接出图谱
3. 若仍空态：点设置，手填  
   - 路由文件：`/www/wwwroot/skill-routing/SKILL_ROUTING.md`  
   - Skill 仓库：`/www/wwwroot/skill-routing-skills`
4. **系统选择文件/夹** 在 Linux 上不可用 → 用手填或「面板浏览」
5. **Skill 仓库默认**读服务器 `local-config.json` 的 `skillsRoot`；用户可在「设置」里开启自定义路径（仅当前浏览器 localStorage，**不会**改服务器配置）。「恢复线上默认」可清除覆盖

---

## 七、更新发布流程

本机改完前端或路由后：

```powershell
cd E:\code\frontend-local\.agents\routing\panel
npm run build
```

上传覆盖服务器：

- `panel/dist/`（前端有改动时）
- `server.mjs` / `router.mjs`（后端有改动时）
- `SKILL_ROUTING.md`（若在本机改了图谱；注意别覆盖掉服务器上别人的新编辑）

然后：

```bash
pm2 restart skill-routing
```

---

## 八、常见问题

| 现象 | 处理 |
|------|------|
| 502 Bad Gateway | PM2 没起来；`pm2 logs skill-routing`；确认 5174 在听 |
| 页面开了但加载失败 | `curl 127.0.0.1:5174/api/health`；看 local-config 路径是否 Linux 路径 |
| 保存失败 | 目录权限：`chown -R www:www /www/wwwroot/skill-routing`（用户以宝塔实际运行为准；PM2 若用 root 则注意文件属主） |
| 只有空白页 | `panel/dist` 没上传或 STATIC_DIR 不对 |
| 想关公网直连端口 | 确认未在安全组放行 5174；server 已绑 127.0.0.1 |

---

## 九、本地快速验证生产服务（可选）

```powershell
cd E:\code\frontend-local\.agents\routing\panel
npm run build
cd ..
$env:PORT=5174; node server.mjs
```

浏览器打开 `http://127.0.0.1:5174/` ，应与线上一致（本机仍可用系统选夹）。
