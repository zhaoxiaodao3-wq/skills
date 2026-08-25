---
name: superpowers-demand-workflow
description: >-
  Superpowers 需求开发工作流：版本化目录（requirements/archive/specs/plans）、
  建需求模块、brainstorming 写 spec、writing-plans 写计划、交付归档。
  在新项目初始化 Superpowers、新建需求目录、原始需求落地、梳理开发规格与任务计划时
  必须使用本技能。即使用户只说「新建需求」「建个功能目录」「superpowers 流程」也应触发。
---

# Superpowers 需求开发工作流

将「原始需求 → 开发规格 → 执行计划 → 代码 → 归档」标准化为可复用目录结构。

## 何时使用

- 新项目首次接入 Superpowers 工作流
- 新建业务需求模块（feature / ui-style / api-adapter / fix）
- 用户给出原始需求，需要走 brainstorming / writing-plans
- 需求交付后需要归档

## 目录约定（核心）

```
docs/superpowers/
├── current-version.txt          # 当前版本，如 v1.0.0
├── SUPERPOWERS_RULES.md         # AI 前置规则（项目内）
├── GUIDE.md                     # 团队指南（可选）
└── v1.0.0/
    ├── feature/
    ├── ui-style/
    ├── api-adapter/
    └── fix/
        └── {中文模块名}/
            ├── requirements/  # 原始需求
            ├── archive/         # 历史与交付归档
            ├── specs/           # brainstorming 开发规格
            └── plans/           # writing-plans 任务计划
```

- **版本号**：`v主.次.修订` 三位（如 `v1.2.0`）；`v1.2` 自动视为 `v1.2.0`
- **分类**：`feature` | `ui-style` | `api-adapter` | `fix`
- **禁止**手动 `mkdir` 建模块骨架，必须用脚本

## 新项目引导（Bootstrap）

目标项目尚无 `docs/superpowers/` 时，从本技能目录执行安装：

**Windows（项目根目录）：**
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<技能路径>/scripts/bootstrap.ps1"
```

**macOS/Linux：**
```bash
bash "<技能路径>/scripts/bootstrap.sh"
```

安装内容：
1. 复制 `scripts/create-demand.*`、`init-version.*`、`lib/resolve-superpowers-version.sh` 到项目 `scripts/`
2. 创建 `docs/superpowers/SUPERPOWERS_RULES.md`、`GUIDE.md`、`current-version.txt`（已存在则跳过）
3. 初始化 `v1.0.0/` 四类空目录

安装后建议在项目 `.cursorrules` 加入：
```
执行 brainstorming、writing-plans 或新建需求文档前，读取 docs/superpowers/SUPERPOWERS_RULES.md。
```

## 端到端流程

```
① bootstrap（仅新项目一次）
② create-demand              建模块目录
③ 原始需求 → requirements/
④ brainstorming              → specs/01-dev-spec.md
⑤ writing-plans              → plans/01-dev-plan.md
⑤½ skill routing             → 读 SKILL_ROUTING.md + router --annotate，写入 plan
⑥ 按计划开发                  → 源码（遵循 plan 内 skill 标注）
⑦ 交付归档                    → archive/vN-delivered/
```

**开发类任务用户入口：** `superpowers-harness-run`（或 `/harness`）自动串联 ②～⑦ 与 Harness 门禁。  
**入口后先分档：** 轻量 / 标准 / 全量（见 `HARNESS_RULES.md` §3）；轻量可不强制完整 spec/plan；标准/全量须 `READY_TO_DEV` 才改 `src/`。  
**官方 skill：** brainstorming / writing-plans / SDD 等以插件为准，不落仓库副本。

### ① 建模块目录

优先运行脚本（幂等，不覆盖已有文件）：

```bash
./scripts/create-demand.sh --type <type> --name "<中文模块名>"
```

Windows 双击 `scripts\create-demand.bat`，或：
```cmd
scripts\create-demand.bat --type feature --name "登录注册功能"
```

### ② 写入原始需求

将产品/Figma/口头需求整理为 md，放入：
```
{模块}/requirements/figma-xxx.md
```

### ③ brainstorming → dev-spec

读取 `requirements/` 与相关代码/设计，产出：
```
{模块}/specs/01-dev-spec.md
```

spec 头部必须包含：
```markdown
**Requirement:** [requirements/xxx.md](../requirements/xxx.md)
```

**UI/Figma 类 spec 额外要求：** 类型为 `ui-style`，或 `feature` 且 requirements 含 Figma 链接时，spec 须含 `## 样式对照（Figma）`（字号/色/间距等对照表 + 节点）。详见 `HARNESS_RULES.md` 与 `superpowers-harness-run` Step B。

### ④ writing-plans → dev-plan

基于 `specs/01-dev-spec.md`，产出原子任务：
```
{模块}/plans/01-dev-plan.md
```

plan 头部必须包含：
```markdown
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)
```

**Skill 路由（writing-plans 收尾 · 强制）：**

1. 读 `.agents/routing/SKILL_ROUTING.md`
2. `node .agents/routing/router.mjs --annotate {模块}/plans/01-dev-plan.md`
3. 将建议 skill 写入各 Task（详见 `HARNESS_RULES.md` §5）

### ⑤ 开发与归档

- 按 `plans/` 逐项实现
- 大改前：旧 spec/plan → `archive/vN-{slug}/`
- 验收后：快照 → `archive/vN-delivered/validation-report.md`

## 版本管理

**新建大版本**（Windows 双击 `scripts\init-version.bat`）：
```bash
./scripts/create-demand.sh --init-version --version v1.1.0
```

更新 `docs/superpowers/current-version.txt` 或创建 `current` 软链接指向新版本。

旧版本目录上线后冻结，禁止新增模块。

## AI 执行检查清单

处理需求相关任务前：

- [ ] 读取项目 `docs/superpowers/SUPERPOWERS_RULES.md`（不存在则先 bootstrap）
- [ ] 确认模块目录已存在（否则运行 create-demand）
- [ ] 确认当前阶段：requirements / spec / plan / skill routing / 开发 / 归档
- [ ] 文档写入正确子目录，不混放
- [ ] 不覆盖已有文件（归档旧版再写新版）

## 文件命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 原始需求 | 描述性名称 | `requirements/figma-login-page.md` |
| 开发规格 | `01-dev-spec.md` | `specs/01-dev-spec.md` |
| 执行计划 | `01-dev-plan.md` | `plans/01-dev-plan.md` |

正文语言：简体中文。

## 与 Superpowers 技能衔接

| 阶段 | 调用技能 |
|------|----------|
| 梳理方案 | `brainstorming` |
| 拆分任务 | `writing-plans` |
| 执行开发 | `executing-plans` 或直接按 plan 开发 |

本技能管**目录与文档落位**；brainstorming / writing-plans 管**内容生成**。

## 与 Harness 衔接

开发类任务**用户入口**为 `superpowers-harness-run`（或 `/harness`）；本技能提供目录与文档落位规范，由 harness-run 内部调用。
不得在未完成 spec/plan 时引导修改 `src/`。门禁见 `docs/superpowers/HARNESS_RULES.md`。

## 对话模板

```
请按 Superpowers 工作流处理：
- 分类：ui-style
- 模块名：新页面ui测试
- 阶段：brainstorming（写 dev-spec）
- 原始需求：requirements/figma-mcp还原页面.md
```

## 详细参考

- 完整 AI 规则（与项目 `docs/superpowers/SUPERPOWERS_RULES.md` 对齐）：[references/SUPERPOWERS_RULES.md](references/SUPERPOWERS_RULES.md)
- 团队落地指南（与项目 `docs/superpowers/GUIDE.md` 对齐）：[references/GUIDE.md](references/GUIDE.md)

**维护约定**：修改项目内规则文档后，须同步更新本技能 `references/` 下同名文件，确保 bootstrap 安装到新项目时规则一致。

## 常见问题

**Q: 能否把 spec 和原始需求放同一文件？**  
A: 不要。`requirements/` 保留输入真相；`specs/` 是面向开发的整理结果。

**Q: 脚本在哪？**  
A: 本技能 `scripts/` 目录；bootstrap 后复制到项目 `scripts/`。

**Q: 没有 docs/superpowers？**  
A: 先执行 bootstrap，再 create-demand。
