# 分享报告架构 Registry · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**工程：** `E:\code\H5\`  
**范围：** 架构结构 only（不含各报告章节业务内容）

## 1. 目标

在 H5 分享课后报告链路落地 **Registry + Template + Shell + Family OG**，使后续 A2/A3/… 扩展以配置与模板复用为主，避免「每类型复制整目录 + 多处 path 硬编码」。

## 2. 目标架构

```
src/pages/share/
  reports/
    registry.ts          # Variant 单一事实来源
    routes.ts            # 由 registry 生成 vue-router 条目
    ShareReportShell.vue # 共用壳（或等价 composable + 薄壳）
  templates/             # 或保留现有 analysisTeaching* 作 template 实现，逐步迁入
    …                    # 每个 template：拉数后的渲染入口
html/
  analysis-teaching-a.html   # A family OG 壳
  analysis-teaching-b.html   # B family OG 壳
```

### 2.1 Registry（Variant）

每个 variant 至少包含：

| 字段 | 说明 |
|------|------|
| `id` | 如 `a1` `b1` `b2` |
| `path` | `/analysis-teaching-{id}` |
| `name` | Route name，如 `ReportA1` |
| `family` | `a` \| `b` \| … → 决定 OG HTML / Nginx |
| `template` | 指向渲染实现的 key |
| `share` | `{ title, desc, image }`（JSSDK + OG 同源） |
| `meta.noAuth` | 保持 `true` |

**路由：** 由 `registry` 生成并挂到 `src/router`，禁止再为每个 variant 手写散落条目（迁移期可过渡，交付时须收敛）。

### 2.2 Template

- **语义：** 渲染引擎，不跟 URL 编号一一强制同名
- **复用：** 新 variant 若可复用已有引擎 → 只登记 registry
- **新建：** 仅当渲染结构/入口无法复用时新增 template 目录
- **本规格不规定** 各 template 内部章节如何实现（内联或 Blocks 均可）；只要求：**Shell 与 Template 边界清晰**，Shell 不含章节业务

### 2.3 Shell

统一负责：

1. 读 `route.query.code`
2. 调 `getShareReport(token)`
3. loading / 失效态
4. 按当前 variant 的 `share` 初始化微信分享（及 SPA 内 OG 兜底若已有工具）
5. 将规范化后的 payload 交给当前 template 入口

### 2.4 Family OG / Vite / Nginx

| 层 | 规则 |
|----|------|
| **HTML** | 每 family 一份；壳内按 pathname 解析 variant id，用 **与 registry 同源** 的 share meta 写 OG（构建注入或运行时脚本读常量表） |
| **Nginx** | 保留 `^/analysis-teaching-a`、`^/analysis-teaching-b` 等 **family 前缀**；新 family 才加 location + HTML |
| **Vite build.input** | 按 family HTML 入口，不按每个 variant 增加 input |
| **Vite dev middleware** | 映射 **registry 中全部 path** → 对应 family HTML（消除仅匹配无编号 path 的不一致） |
| **根 index.html 兜底脚本** | 收敛为读同一 meta 表，禁止第三套手写 A/B 分支长期并存 |

**独立 HTML 条件：** 新 family，或 OG 页面骨架与现有 family 完全不同。同 family 内不同 variant → **不**新建 HTML，用 path 分支。

## 3. 迁移策略（本需求交付范围）

分两阶段，可同 plan 内拆 Task，但验收以架构闭环为准：

### Phase A — 行为不变的结构落地（必做）

1. 新增 `registry`，登记现有 `a1` / `b1` / `b2`（及既有 share 元数据）
2. 路由改为 registry 驱动
3. 抽 Shell，现有三页改为「Shell + 现有页面作 template 入口」（允许薄包装，不要求重写 B2 内容）
4. 对齐 Vite middleware +（可选本阶段）OG 脚本与 registry 同源

### Phase B — 清理与扩展约定（必做文档化；代码按风险取舍）

1. 约定：新增同 template variant 的 checklist（只改 registry）
2. 约定：新增 template / family 的 checklist
3. 删除或标明「非 registry 的重复 path 列表」；未使用的复制模板文件不在本需求强制清理（可列为 follow-up）

## 4. 非目标

- 各报告章节文案、目录结构、样式还原
- 后端 `reportContent` schema 改造
- 强制统一所有 template 为同一 Blocks 组件体系

## 5. 风险与兼容

- 旧链接 `/analysis-teaching-a`、`/analysis-teaching-b`（无编号）：**redirect → `/analysis-teaching-a1`、`/analysis-teaching-b1`**（保留 query）
- Nginx 前缀会使 `a2` 命中 A family HTML：依赖壳内 variant 分支，**禁止**假设静态 meta 恒为 a1

## 6. 交付物：使用说明（必做）

面向后续同事，在 H5 仓落盘一份**架构使用说明**（建议路径：`E:\code\H5\docs\share-reports-architecture.md`，或 `src/pages/share/reports/README.md`），至少包含：

1. 三层概念：Variant / Template / Shell / Family OG
2. 目录与关键文件索引（registry、routes、Shell、templates、html、nginx、vite）
3. **如何新增同 Template 的 Variant**（checklist）
4. **如何新增 Template**（checklist）
5. **如何新增 Family**（新 OG HTML + Nginx + Vite input）
6. 旧链接兼容策略说明（见 §5）
7. 明确「本说明不负责报告章节内容怎么写」

Harness 仓可在 archive 中链到该文件。

## 7. 验收标准

- [x] 存在 `registry`，且 `a1`/`b1`/`b2` 均登记；路由由 registry 生成
- [x] 存在共用 Shell（或等价 composable）；三页不再各自复制「拉数+过期+wx」主流程（允许薄委托）
- [x] Template 边界清晰：章节渲染不在 Shell 内
- [x] Vite dev 对 registry 内全部 path 指向正确 family HTML
- [x] Family OG：同 family 共用 HTML；variant share 与 registry 一致（脚本或构建注入）
- [x] Nginx 仍按 family；文档/注释说明新 family vs 新 variant 的扩展方式
- [x] 已落盘「使用说明」且 checklist 可独立照做（§6）
- [x] 本文「非目标」未被迫扩大为业务改版
