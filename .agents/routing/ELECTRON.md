# Electron 桌面版

本机桌面应用：由 **你电脑上的 Node** 读 `skillsRoot` 路径，可用系统文件夹对话框选本地目录（如 `E:\...\skills`），**不上传文件**。

## 开发运行

```bash
cd E:\code\frontend-local\.agents\routing
npm install
npm run build          # 构建 panel/dist
npm run electron:dev   # 启动 Electron + 内嵌 server
```

配置与路由 MD 默认写在：

`%APPDATA%/skill-routing/local-config.json`（及同目录 `SKILL_ROUTING.md` 副本）

## 打包 Windows 安装包

```bash
npm run build
npm run electron:dist
```

产物在 `release/` 目录。

## 与线上版的区别

| | 浏览器 → 线上 | Electron 桌面 |
|--|----------------|---------------|
| 读 Skill 仓库 | 仅服务器目录 | **本机任意路径** |
| 系统选文件夹 | Linux 上不可用 | Windows 原生对话框 |
| 配置位置 | 服务器 `local-config.json` | 用户目录 `userData` |

线上画板仍用于远程查看/改路由；本地 skill 仓库请用桌面版或本机 `npm run dev`。
