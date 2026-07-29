# OpenSpec + Superpowers 四层目录规范与自动化创建设计

> **状态**：已评审锁定  
> **版本**：v1.0  
> **分类**：feature  
> **模块**：工作流目录规范  
> **最后更新**：2026-07-01

---

## 1. 背景与目标

### 1.1 背景

前端项目采用「OpenSpec + Superpowers」双工具联动的 AI 开发工作流。存量文档位于扁平结构 `docs/superpowers/{specs,plans,archive,reports}/`，约 90+ 篇，**保持不动**。新需求全部写入四层嵌套结构。

### 1.2 核心目标

1. **两层归档**：版本级整体冻结 + 需求级规格历史归档
2. **职责分离**：OpenSpec 纯需求域（`openspec/`）与 Superpowers 开发域（`specs/`、`plans/`）互不污染
3. **平滑引入**：保留「版本 → 分类 → 业务模块」分层，不推翻存量
4. **自动化创建**：禁止手动 `mkdir`；固定骨架自动生成，业务模块按需新增

### 1.3 已锁定决策

| 项 | 决策 |
|----|------|
| OpenSpec 根目录 | 降级为 CLI 工具区；正式真相源在嵌套 `openspec/` |
| 初始版本 | `current → v1.0`（团队自行切换） |
| opsx 改造策略 | 现阶段技能重定向；升级 OpenSpec ≥1.4 后迁移 Schema `folder:` 字段 |
| 存量文档 | 旧扁平目录只读，新需求禁止写入 |
| tasks 产物 | 路由到外层 `plans/`，不进 openspec |

---

## 2. 目录架构

### 2.1 完整目录树

```
docs/superpowers/
├── current -> ./v1.0              # 软链接；Windows 无权限时见 §6.3 回退方案
├── SUPERPOWERS_RULES.md             # AI 前置规则（实施阶段产出）
├── GUIDE.md                         # 团队落地指南（实施阶段产出）
├── specs/                           # 【存量】旧扁平结构，只读
├── plans/                           # 【存量】旧扁平结构，只读
├── archive/                         # 【存量】旧扁平结构，只读
├── reports/                         # 【存量】旧扁平结构，只读
├── v1.0/                            # current 指向的活跃版本
│   ├── feature/
│   │   └── {中文业务模块}/
│   │       ├── openspec/            # 需求治理域（唯一真相源）
│   │       │   ├── specs/           # 【必选】当前生效契约
│   │       │   ├── changes/         # 【可选】Delta Spec
│   │       │   └── archive/         # 【可选】需求级历史
│   │       ├── specs/               # Superpowers 开发规格
│   │       └── plans/               # Superpowers 执行计划
│   ├── ui-style/
│   ├── api-adapter/
│   └── fix/
└── v2.x/                            # 上线后整体冻结的历史版本

openspec/                            # CLI 工具区（非正式归档）
├── config.yaml
├── schemas/
│   └── superpowers-nested/          # 预留：升级 OpenSpec 后启用
└── changes/
    └── {kebab-temp}/                # 临时工作区，评审锁定后可清理
```

### 2.2 四层释义

| 层 | 命名 | 说明 |
|----|------|------|
| L1 版本 | `v主.次` 小写英文 | 迭代上线后整体冻结；`current` 软链接指向活跃版本 |
| L2 分类 | `feature` / `ui-style` / `api-adapter` / `fix` | 固定四类，禁止自定义 |
| L3 模块 | 中文名称 | 如「登录注册功能」「首页视觉重构」 |
| L4 职责 | `openspec/`、`specs/`、`plans/` | 平级，职责严格分离 |

### 2.3 `current` 软链接规范

**创建（macOS/Linux）：**

```bash
cd docs/superpowers
ln -sfn v1.0 current
```

**创建（Windows，需开发者模式或管理员）：**

```cmd
cd docs\superpowers
mklink /D current v1.0
```

**版本切换流程：**

1. 团队公告新版本号（如 `v1.1`）
2. 复制或初始化 `v1.1/` 四层骨架（`create-demand` 脚本自动完成）
3. 更新 `current` 指向 `v1.1`
4. 旧版本 `v1.0/` 在上线后标记为冻结，禁止新增模块

**版本整体归档：** 整个 `vX.X/` 目录只读，不再接受新模块或修改。

### 2.4 openspec 内部三目录

| 目录 | 作用 | 创建时机 |
|------|------|----------|
| `specs/` | 当前生效的正式需求契约、验收标准 | 模块初始化时必选 |
| `changes/` | Delta Spec 增量变更记录 | 发生需求变更时创建 |
| `archive/` | 原始草稿、旧版规格、交付快照 | feature 初始化时预建；其他按需 |

### 2.5 分类裁剪规则

| 分类 | openspec 子目录 | 流程 |
|------|----------------|------|
| `feature` | specs + changes + archive | 完整 OpenSpec → brainstorming → writing-plans |
| `ui-style` / `api-adapter` | specs（changes/archive 按需） | 同上，变更时补充 |
| `fix` | 仅 specs 或跳过 openspec | 轻量：直接 brainstorming → specs + plans |

**轻量 fix 判定标准（满足全部）：**

- 影响范围 ≤ 3 个文件
- 无新 API 契约
- 无跨模块依赖

---

## 3. 命名规范

### 3.1 目录命名

| 层级 | 规则 | 示例 |
|------|------|------|
| 版本 | 英文小写 `v主.次` | `v1.0`、`v2.1` |
| 分类 | 固定英文枚举 | `feature` |
| 模块 | 中文，直观可读 | `登录注册功能` |
| L4 目录 | 固定英文小写 | `openspec`、`specs`、`plans` |

### 3.2 文件命名

- 格式：`{序号}-{英文描述}.md`（序号两位数字）
- 正文语言：简体中文
- 示例：`01-login-contract.md`、`02-dev-spec.md`、`01-dev-plan.md`

### 3.3 文档内引用路径

- **模块内**：相对路径，如 `../specs/01-dev-spec.md`
- **跨模块**：从 `docs/superpowers/` 起的完整路径
- **禁止**：硬编码 `current` 字面路径（版本切换后会失效）；脚本/技能通过解析 `current` 获取实际版本

---

## 4. 两层归档机制

### 4.1 版本级归档（外层）

| 项 | 说明 |
|----|------|
| 触发 | 迭代上线稳定后 |
| 操作 | 冻结整个 `vX.X/` 目录，更新 `current` 指向新版本 |
| 效果 | 历史版本完整保留，可追溯该版本全部需求 |

### 4.2 需求级归档（内层）

| 项 | 说明 |
|----|------|
| 触发 | 规格评审锁定、增量变更生效前、交付验收后 |
| 操作 | 旧版移入 `openspec/archive/vN-{描述}/`；`specs/` 只保留当前生效版 |
| 子目录命名 | `v1-init`（初始定版）、`v2-add-phone`（变更版本）、`v3-delivered`（交付快照） |

### 4.3 验收报告（原 `reports/`）

新流程中验收报告写入：

```
{模块}/openspec/archive/vN-delivered/validation-report.md
```

存量 `docs/superpowers/reports/` 保持不动。

---

## 5. 双工具联动工作流

### 5.1 阶段 1：需求立项（OpenSpec 主导）

```
create-demand-dir → /opsx:explore → /opsx:propose → 评审锁定 → openspec/specs 生效
```

1. **目录自动初始化**：传入 type + 中文模块名
2. **需求探索**：`/opsx:explore` → `openspec/specs/00-explore-notes.md`
3. **规格提案**：`/opsx:propose` → `openspec/specs/01-{slug}-contract.md`
4. **评审锁定**：确认后草稿移入 `archive/v1-init/`，正式版留 `specs/`

### 5.2 阶段 2：工程拆解（Superpowers 主导）

```
读取 openspec/specs → brainstorming → 外层 specs/ → writing-plans → plans/
```

- **禁止**：未锁定 openspec 规格前进入开发
- **tasks.md 路由**：CLI 临时产物写入 `plans/01-{slug}-plan.md`，不进 openspec

### 5.3 阶段 3：验证验收

1. `/opsx:verify` — 代码 vs openspec/specs 一致性
2. `verification-before-completion` — 测试、构建、Lint
3. `/opsx:archive` — 交付快照存入 `openspec/archive/`
4. `finishing-a-development-branch` — 分支收尾

### 5.4 阶段 4：增量变更

1. 自动创建 `openspec/changes/`（若不存在）
2. 写入 Delta Spec：`changes/YYYYMMDD-{描述}.md`
3. 旧版移入 `archive/vN-{描述}/`
4. 评审后更新 `openspec/specs/`，同步外层 `specs/`
5. 新分支走完整 Superpowers 开发流程

### 5.5 opsx 技能重定向（现阶段）

**新入参格式：**

```
/opsx:propose --type feature --name "登录注册功能" [需求描述]
```

**执行顺序：**

1. `create-demand-dir` 幂等建目录
2. `openspec new change <kebab-slug>` — 临时工作区
3. `openspec instructions <artifact> --json` — 取模板与规范
4. **忽略 CLI outputPath**，写入嵌套路径
5. `tasks` → `plans/01-{slug}-plan.md`
6. 评审锁定后可选清理 `openspec/changes/<slug>/`

| 命令 | 输出目标 |
|------|----------|
| `/opsx:explore` | `openspec/specs/00-explore-notes.md` |
| `/opsx:propose` | `openspec/specs/01-*-contract.md` |
| `/opsx:archive` | 旧版 → `openspec/archive/vN-{slug}/` |
| `/opsx:apply` | 读 `plans/`，不改 openspec |

### 5.6 Schema 预留（OpenSpec ≥1.4）

```yaml
# openspec/schemas/superpowers-nested/schema.yaml（预留）
name: superpowers-nested
version: 1
description: Superpowers 四层嵌套目录输出

artifacts:
  - id: contract
    generates: "01-{change}-contract.md"
    folder: "docs/superpowers/current/{type}/{module}/openspec/specs"
    template: contract.md
    requires: []

  - id: dev-plan
    generates: "01-{change}-plan.md"
    folder: "docs/superpowers/current/{type}/{module}/plans"
    template: plan.md
    requires: [contract]

apply:
  requires: [dev-plan]
  tracks: "01-{change}-plan.md"
```

`{type}`、`{module}` 由 change metadata（`.openspec.yaml`）注入。升级后技能从手动重定向迁移到 CLI 原生 `folder`。

---

## 6. 风险与规避

### 6.1 中文路径

| 风险来源 | 规避 |
|----------|------|
| Git 显示转义 | `git config core.quotepath false` |
| 终端乱码 | PowerShell 设 `$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8` |
| 脚本参数 | Shell/Bat 均用 UTF-8 编码；Bat 头部 `chcp 65001` |
| CI 遍历 | 使用 `find`/`Get-ChildItem -Encoding UTF8`；避免 ASCII-only glob |

Superpowers / OpenSpec 本身对中文路径无硬性限制；风险主要来自系统终端、Git 配置、脚本编码。

### 6.2 深层嵌套与 AI 索引

- Superpowers 无读取层数硬上限，但上下文窗口有限
- **规避**：`SUPERPOWERS_RULES.md` 规定搜索范围为 `docs/superpowers/current/`；模块内用相对路径
- 单模块文件数建议 ≤ 20；超出时拆分子模块

### 6.3 `current` 软链接跨平台

| 平台 | 方案 |
|------|------|
| macOS/Linux | `ln -sfn v1.0 current` |
| Windows | `mklink /D`（需开发者模式） |
| **回退** | 创建 `current-version.txt` 内容为 `v1.0`；脚本优先读软链接，失败读 txt |

Git 提交软链接：Git for Windows 默认可提交 symlink；团队成员 clone 后需相同权限创建链接，或运行 `scripts/create-demand.sh --init-version` 修复。

### 6.4 内外层规格不一致

- **单一真相源**：`openspec/specs/` 为准
- **排查**：对比 `openspec/specs/01-*-contract.md` 与 `specs/01-dev-spec.md` 头部 `**Contract:**` 链接
- **同步规则**：openspec 变更后必须同步外层 specs；plans 头部注明 spec 链接

### 6.5 存量兼容

- 旧扁平 `docs/superpowers/{specs,plans,archive,reports}/` 只读
- 新需求 **禁止** 写入旧路径
- AI 执行前读取 `SUPERPOWERS_RULES.md`，校验目标路径含 `vX.X/` 四层结构

---

## 7. 三套自动化创建方案

### 7.1 方案 1：AI 对话创建（日常推荐）

**指令模板（复制发给 AI）：**

```
请按 Superpowers 目录规范初始化需求目录：
- 版本：current（解析为实际版本目录）
- 分类：feature
- 模块名：登录注册功能

要求：
1. 幂等创建完整四层骨架
2. feature 类附带 openspec/changes、openspec/archive
3. 不覆盖已有文件
4. 完成后回报创建的路径清单
```

### 7.2 方案 2：跨平台脚本（团队/CI）

**入参：**

```bash
# macOS/Linux
./scripts/create-demand.sh --type feature --name "登录注册功能"
./scripts/create-demand.sh --type fix --name "登录Token过期修复" --version v1.0

# Windows
scripts\create-demand.bat --type feature --name "登录注册功能"
```

**参数说明：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `--type` | 是 | `feature` / `ui-style` / `api-adapter` / `fix` |
| `--name` | 是 | 中文业务模块名 |
| `--version` | 否 | 默认解析 `current` 软链接 |
| `--init-version` | 否 | 仅初始化版本骨架（四大分类空目录） |

**错误拦截：**

- 非法 type → 退出码 1，打印允许枚举
- 模块目录已存在 → 退出码 0，提示已存在不覆盖
- `current` 无法解析 → 尝试 `current-version.txt` 回退

### 7.3 方案 3：create-demand-dir 技能（长期标准化）

- 路径：`.agents/skills/create-demand-dir/SKILL.md`
- 触发：brainstorming、opsx:propose、opsx:explore 执行前自动调用
- 能力：目录规范校验、非法分类拦截、按 type 裁剪 openspec 子目录
- 接入：在 opsx 技能 Step 1 增加「先 invoke create-demand-dir」

### 7.4 统一规则

1. 固定骨架（版本 + 四大分类）首次自动生成，后续复用
2. 业务模块完全灵活，按需新增
3. changes/archive 首次不强制，变更时自动补充
4. 所有方案幂等，已有目录/文件完全保留

---

## 8. AI 执行约定（SUPERPOWERS_RULES.md 纲要）

实施阶段将产出完整 `docs/superpowers/SUPERPOWERS_RULES.md`，核心条款：

1. **每次执行前必读**本规则文件
2. **新增需求**：先 `create-demand-dir`，再写文档
3. **路径定位**：`docs/superpowers/current/{type}/{module}/`
4. **文件生成**：openspec 产物进 `openspec/`，开发规格进 `specs/`，计划进 `plans/`
5. **禁止**：手动 mkdir、写入旧扁平目录、在 openspec 内放 plans
6. **轻量判定**：fix 类且满足 §2.5 条件可跳过 openspec
7. **项目绑定**：`.cursorrules` 追加「执行 Superpowers 工作流前读取 SUPERPOWERS_RULES.md」

---

## 9. 补充分析

### 9.1 OpenSpec vs 原生 brainstorming 选型

| 场景 | 推荐 |
|------|------|
| 新功能、跨模块、有验收标准 | OpenSpec 全流程 |
| UI 改版、接口对接 | OpenSpec specs + 按需 changes |
| 简单 Bug、文案调整 | 原生 brainstorming，跳过 openspec |
| 后续复杂度升级 | AI 自动补充 openspec 目录与归档 |

### 9.2 常见问题

| 问题 | 处理 |
|------|------|
| 目录重复创建 | 所有方案先 `test -d` / `Test-Path`，存在则跳过 |
| current 切换后路径变化 | 脚本动态解析 current，不硬编码版本号 |
| 旧存量引用断裂 | 旧文档内链保持原路径；新文档用新路径 |
| opsx 与嵌套路径不一致 | 以本 spec §5.5 重定向规则为准 |

---

## 10. 实施交付清单

| # | 交付物 | 路径 |
|---|--------|------|
| 1 | 团队落地指南 | `docs/superpowers/GUIDE.md` |
| 2 | AI 前置规则 | `docs/superpowers/SUPERPOWERS_RULES.md` |
| 3 | Shell 脚本 | `scripts/create-demand.sh` |
| 4 | Bat 脚本 | `scripts/create-demand.bat` |
| 5 | 目录创建技能 | `.agents/skills/create-demand-dir/SKILL.md` |
| 6 | opsx 技能改造 | `.cursor/commands/opsx-*.md`、`.agents/skills/openspec-*/SKILL.md` |
| 7 | 预留 Schema | `openspec/schemas/superpowers-nested/` |
| 8 | current 回退 | `docs/superpowers/current-version.txt` |
| 9 | 本设计 spec | 当前文件 |

---

## 11. 验收标准

- [x] `current` 可解析到 `v1.0`（软链接或 txt 回退）
- [x] `create-demand.sh` / `.bat` 可幂等创建四层目录
- [x] `create-demand-dir` 技能可拦截非法 type
- [x] `/opsx:propose --type feature --name "测试模块"` 产物写入嵌套 openspec/specs
- [x] tasks 产物写入外层 plans/，不进 openspec
- [x] 存量 `docs/superpowers/specs/` 下文件未被修改
- [x] `SUPERPOWERS_RULES.md` 可被 AI 正确读取并遵循
