# 工作流目录规范与自动化创建 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 Superpowers 四层嵌套目录规范，提供三套自动化创建方案（AI 模板、Shell/Bat 脚本、create-demand-dir 技能），并改造 opsx 技能将产物重定向到嵌套 `openspec/` 路径。

**Architecture:** 共享 `resolve-current-version` 逻辑解析 `current` 软链接或 `current-version.txt` 回退；`create-demand.sh` 为单一真相实现，`.bat` 调用 PowerShell 复用同逻辑；`create-demand-dir` 技能封装规范校验；opsx 技能在 Step 1 调用目录创建后，用 `openspec instructions` 取模板但写入嵌套路径。

**Tech Stack:** Bash、Windows Batch/PowerShell、OpenSpec CLI 1.3.0、Markdown 技能文件

**Contract:** `docs/superpowers/v1.0/feature/工作流目录规范/openspec/specs/01-workflow-directory-design.md`

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `scripts/lib/resolve-superpowers-version.sh` | 解析 current 软链接 / txt 回退 |
| `scripts/create-demand.sh` | 跨平台主脚本（macOS/Linux/Git Bash） |
| `scripts/create-demand.bat` | Windows 入口，调用 PowerShell 实现 |
| `scripts/create-demand.ps1` | Windows 核心逻辑（与 sh 行为一致） |
| `docs/superpowers/SUPERPOWERS_RULES.md` | AI 前置规则 |
| `docs/superpowers/GUIDE.md` | 团队落地指南 |
| `.agents/skills/create-demand-dir/SKILL.md` | 目录创建技能 |
| `.agents/skills/openspec-propose/SKILL.md` | propose 重定向改造 |
| `.agents/skills/openspec-explore/SKILL.md` | explore 重定向改造 |
| `.agents/skills/openspec-archive-change/SKILL.md` | archive 重定向改造 |
| `.agents/skills/openspec-apply-change/SKILL.md` | apply 读 plans 改造 |
| `.cursor/commands/opsx-propose.md` | Cursor 命令同步 |
| `.cursor/commands/opsx-explore.md` | Cursor 命令同步 |
| `.cursor/commands/opsx-archive.md` | Cursor 命令同步 |
| `.cursor/commands/opsx-apply.md` | Cursor 命令同步 |
| `openspec/schemas/superpowers-nested/schema.yaml` | 预留 Schema（升级 OpenSpec 后启用） |
| `openspec/schemas/superpowers-nested/README.md` | Schema 启用说明 |
| `.cursorrules` | 追加 SUPERPOWERS_RULES 绑定 |

不修改：存量 `docs/superpowers/specs/`、`docs/superpowers/plans/` 下历史文件；根 `openspec/changes/split-autonomous-classroom-response-page/` 存量变更。

---

### Task 1: 版本解析库 + Shell 主脚本

**Files:**
- Create: `scripts/lib/resolve-superpowers-version.sh`
- Create: `scripts/create-demand.sh`

- [ ] **Step 1: 创建版本解析库**

```bash
#!/usr/bin/env bash
# scripts/lib/resolve-superpowers-version.sh
# 用法: source 后调用 resolve_superpowers_version <docs/superpowers 绝对或相对路径>

resolve_superpowers_version() {
  local base="${1:?base dir required}"
  base="${base%/}"

  if [[ -L "$base/current" ]]; then
    local target
    target="$(readlink "$base/current")"
    target="${target#./}"
    printf '%s' "$target"
    return 0
  fi

  if [[ -f "$base/current-version.txt" ]]; then
    tr -d '\r\n' < "$base/current-version.txt"
    return 0
  fi

  printf '%s' "v1.0"
}
```

- [ ] **Step 2: 创建 create-demand.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SUPERPOWERS_BASE="$PROJECT_ROOT/docs/superpowers"

VALID_TYPES=(feature ui-style api-adapter fix)

source "$SCRIPT_DIR/lib/resolve-superpowers-version.sh"

usage() {
  cat <<'EOF'
用法:
  ./scripts/create-demand.sh --type <feature|ui-style|api-adapter|fix> --name "<中文模块名>"
  ./scripts/create-demand.sh --init-version [--version v1.0]

选项:
  --type           业务分类（必填，除非 --init-version）
  --name           中文业务模块名（必填，除非 --init-version）
  --version        版本目录，默认解析 current
  --init-version   仅初始化版本骨架（四大分类空目录）
  -h, --help       显示帮助
EOF
}

is_valid_type() {
  local t="$1"
  for v in "${VALID_TYPES[@]}"; do
    [[ "$v" == "$t" ]] && return 0
  done
  return 1
}

mkdir_if_missing() {
  local dir="$1"
  if [[ -d "$dir" ]]; then
    echo "  已存在，跳过: $dir"
  else
    mkdir -p "$dir"
    echo "  已创建: $dir"
  fi
}

init_version_skeleton() {
  local version="$1"
  local version_dir="$SUPERPOWERS_BASE/$version"
  echo "初始化版本骨架: $version_dir"
  for t in "${VALID_TYPES[@]}"; do
    mkdir_if_missing "$version_dir/$t"
  done
}

create_module_dirs() {
  local version="$1"
  local type="$2"
  local name="$3"
  local module_root="$SUPERPOWERS_BASE/$version/$type/$name"

  echo "创建模块目录: $module_root"
  mkdir_if_missing "$module_root/openspec/specs"
  mkdir_if_missing "$module_root/specs"
  mkdir_if_missing "$module_root/plans"

  case "$type" in
    feature)
      mkdir_if_missing "$module_root/openspec/changes"
      mkdir_if_missing "$module_root/openspec/archive"
      ;;
    ui-style|api-adapter)
      # 仅 specs；changes/archive 变更时按需创建
      ;;
    fix)
      # 轻量模式：可不创建 openspec，但默认仍建 openspec/specs 便于升级
      mkdir_if_missing "$module_root/openspec/specs"
      ;;
  esac

  echo ""
  echo "完成。模块根目录:"
  echo "  $module_root"
}

TYPE=""
NAME=""
VERSION=""
INIT_VERSION=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type) TYPE="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --version) VERSION="$2"; shift 2 ;;
    --init-version) INIT_VERSION=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1"; usage; exit 1 ;;
  esac
done

if [[ $INIT_VERSION -eq 1 ]]; then
  VERSION="${VERSION:-$(resolve_superpowers_version "$SUPERPOWERS_BASE")}"
  init_version_skeleton "$VERSION"
  exit 0
fi

if [[ -z "$TYPE" || -z "$NAME" ]]; then
  echo "错误: --type 和 --name 为必填"
  usage
  exit 1
fi

if ! is_valid_type "$TYPE"; then
  echo "错误: 非法分类 '$TYPE'。允许: ${VALID_TYPES[*]}"
  exit 1
fi

VERSION="${VERSION:-$(resolve_superpowers_version "$SUPERPOWERS_BASE")}"
init_version_skeleton "$VERSION"
create_module_dirs "$VERSION" "$TYPE" "$NAME"
```

- [ ] **Step 3: 添加可执行权限**

```bash
chmod +x scripts/create-demand.sh scripts/lib/resolve-superpowers-version.sh
```

- [ ] **Step 4: 验证脚本（首次创建）**

```bash
./scripts/create-demand.sh --type feature --name "测试模块"
```

Expected: 输出包含 `docs/superpowers/v1.0/feature/测试模块/openspec/specs` 等路径

- [ ] **Step 5: 验证幂等（二次运行）**

```bash
./scripts/create-demand.sh --type feature --name "测试模块"
```

Expected: 全部显示「已存在，跳过」，退出码 0

- [ ] **Step 6: 验证非法 type**

```bash
./scripts/create-demand.sh --type invalid --name "x"
```

Expected: 退出码 1，打印允许枚举

---

### Task 2: Windows Bat + PowerShell 脚本

**Files:**
- Create: `scripts/create-demand.ps1`
- Create: `scripts/create-demand.bat`

- [ ] **Step 1: 创建 PowerShell 实现**

```powershell
# scripts/create-demand.ps1
param(
    [string]$Type,
    [string]$Name,
    [string]$Version,
    [switch]$InitVersion,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ValidTypes = @("feature", "ui-style", "api-adapter", "fix")
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SuperpowersBase = Join-Path $ProjectRoot "docs\superpowers"

function Get-SuperpowersVersion {
    $currentLink = Join-Path $SuperpowersBase "current"
    $currentTxt = Join-Path $SuperpowersBase "current-version.txt"

    if (Test-Path $currentLink) {
        $item = Get-Item $currentLink -Force
        if ($item.LinkType) {
            $target = $item.Target
            if ($target -is [array]) { $target = $target[0] }
            return ($target -replace '^\./', '')
        }
    }
    if (Test-Path $currentTxt) {
        return (Get-Content $currentTxt -Raw).Trim()
    }
    return "v1.0"
}

function Ensure-Dir([string]$Path) {
    if (Test-Path $Path) {
        Write-Host "  已存在，跳过: $Path"
    } else {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
        Write-Host "  已创建: $Path"
    }
}

function Init-VersionSkeleton([string]$Ver) {
    $versionDir = Join-Path $SuperpowersBase $Ver
    Write-Host "初始化版本骨架: $versionDir"
    foreach ($t in $ValidTypes) {
        Ensure-Dir (Join-Path $versionDir $t)
    }
}

function New-ModuleDirs([string]$Ver, [string]$Type, [string]$ModuleName) {
    $moduleRoot = Join-Path $SuperpowersBase "$Ver\$Type\$ModuleName"
    Write-Host "创建模块目录: $moduleRoot"
    Ensure-Dir (Join-Path $moduleRoot "openspec\specs")
    Ensure-Dir (Join-Path $moduleRoot "specs")
    Ensure-Dir (Join-Path $moduleRoot "plans")

    switch ($Type) {
        "feature" {
            Ensure-Dir (Join-Path $moduleRoot "openspec\changes")
            Ensure-Dir (Join-Path $moduleRoot "openspec\archive")
        }
        "fix" { }
        default { }
    }

    Write-Host ""
    Write-Host "完成。模块根目录:"
    Write-Host "  $moduleRoot"
}

if ($Help) {
    Write-Host @"
用法:
  scripts\create-demand.bat --type feature --name "登录注册功能"
  scripts\create-demand.bat --init-version [--version v1.0]
"@
    exit 0
}

if ($InitVersion) {
    $ver = if ($Version) { $Version } else { Get-SuperpowersVersion }
    Init-VersionSkeleton $ver
    exit 0
}

if (-not $Type -or -not $Name) {
    Write-Error "错误: --type 和 --name 为必填"
}

if ($ValidTypes -notcontains $Type) {
    Write-Error "错误: 非法分类 '$Type'。允许: $($ValidTypes -join ', ')"
}

$ver = if ($Version) { $Version } else { Get-SuperpowersVersion }
Init-VersionSkeleton $ver
New-ModuleDirs $ver $Type $Name
```

- [ ] **Step 2: 创建 Bat 入口**

```bat
@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-demand.ps1" %*
exit /b %ERRORLEVEL%
```

- [ ] **Step 3: 验证 Windows 脚本**

```cmd
scripts\create-demand.bat --type fix --name "登录Token过期修复"
```

Expected: 创建 `docs\superpowers\v1.0\fix\登录Token过期修复\` 下 specs、plans、openspec\specs

---

### Task 3: SUPERPOWERS_RULES.md

**Files:**
- Create: `docs/superpowers/SUPERPOWERS_RULES.md`

- [ ] **Step 1: 写入 AI 前置规则**

内容须包含以下强制条款（写入完整文件，非纲要）：

1. 执行任何 Superpowers/OpenSpec 工作流前必读本文件
2. 新需求路径：`docs/superpowers/current/{type}/{中文模块}/`
3. 禁止写入旧扁平 `docs/superpowers/specs/`、`plans/`（无版本号路径）
4. 新增需求先调用 `create-demand-dir` 或 `scripts/create-demand.sh`
5. openspec 产物 → `openspec/`；开发规格 → `specs/`；计划 → `plans/`
6. 禁止在 openspec 内放 plans 或代码
7. 文件命名：`{序号}-{英文描述}.md`
8. fix 轻量判定（≤3 文件、无新 API、无跨模块）可跳过 openspec
9. AI 对话创建模板（复制块，来自 design spec §7.1）
10. 内外层规格不一致时以 `openspec/specs/` 为准

- [ ] **Step 2: 确认文件可被 Read 工具读取**

Run: 用 Read 工具打开 `docs/superpowers/SUPERPOWERS_RULES.md`
Expected: 全文中文，无 TBD

---

### Task 4: GUIDE.md 团队落地指南

**Files:**
- Create: `docs/superpowers/GUIDE.md`

- [ ] **Step 1: 写入指南**

章节：
1. 快速开始（三步：建目录 → opsx:propose → brainstorming）
2. 目录结构图解（ASCII 树）
3. 版本切换操作
4. current 软链接各平台创建命令
5. 分类选择与裁剪规则表
6. 归档操作（版本级 + 需求级）
7. 风险规避（Git quotepath、中文路径、Windows 软链接）
8. 三套自动化方案使用场景对比
9. 常见问题 FAQ（来自 design spec §9.2）

---

### Task 5: create-demand-dir 技能

**Files:**
- Create: `.agents/skills/create-demand-dir/SKILL.md`

- [ ] **Step 1: 创建技能文件**

```markdown
---
name: create-demand-dir
description: 按 Superpowers 四层目录规范幂等创建需求目录。在 brainstorming、opsx:propose、opsx:explore 之前调用。传入 --type 和 --name。
---

# create-demand-dir

## 何时使用

- 新建业务需求模块前
- brainstorming / opsx 命令执行前
- 用户说「新建需求」「初始化目录」「create demand」

## 输入

| 参数 | 必填 | 说明 |
|------|------|------|
| type | 是 | feature / ui-style / api-adapter / fix |
| name | 是 | 中文业务模块名 |
| version | 否 | 默认解析 current |

## 执行步骤

1. 读取 `docs/superpowers/SUPERPOWERS_RULES.md` 确认规范
2. 运行脚本（优先）：
   ```bash
   ./scripts/create-demand.sh --type <type> --name "<name>"
   ```
   Windows: `scripts\create-demand.bat --type <type> --name "<name>"`
3. 若脚本不可用，手动幂等创建目录（禁止覆盖已有文件）：
   - 解析版本：`current` 软链接 → 失败读 `current-version.txt` → 默认 v1.0
   - 路径：`docs/superpowers/{version}/{type}/{name}/`
   - 必建：`openspec/specs/`、`specs/`、`plans/`
   - feature 额外：`openspec/changes/`、`openspec/archive/`
4. 回报创建的完整路径清单

## 校验规则

- type 不在四分类枚举 → 拒绝并列出合法值
- 模块目录已存在 → 成功，不覆盖
- 禁止写入 `docs/superpowers/specs/`（旧扁平路径）

## 输出

```
已创建/已存在模块:
  docs/superpowers/v1.0/feature/登录注册功能/
    openspec/specs/
    openspec/changes/   (feature only)
    openspec/archive/   (feature only)
    specs/
    plans/
```
```

- [ ] **Step 2: 同步到 `.cursor/skills/create-demand-dir/SKILL.md`**

复制相同内容（项目多 IDE 技能目录保持一致）。

---

### Task 6: 改造 openspec-propose 技能

**Files:**
- Modify: `.agents/skills/openspec-propose/SKILL.md`
- Modify: `.cursor/commands/opsx-propose.md`

- [ ] **Step 1: 在 Step 1 之前插入目录创建**

在原有 Step 1 前新增：

```markdown
0. **解析入参并创建目录**
   - 从用户输入解析 `--type <分类>` 和 `--name "<中文模块名>"`
   - 若未提供，用 AskQuestion 询问（type 四选一 + 模块名）
   - 调用 create-demand-dir 技能（或运行 create-demand.sh）
   - 记录 `MODULE_ROOT=docs/superpowers/current/{type}/{name}`（解析 current 后的实际路径）
   - 从模块名推导 kebab-slug 作为 change 名（如「登录注册功能」→ `login-register`）
```

- [ ] **Step 2: 修改产物写入规则**

在 Artifact Creation Guidelines 追加：

```markdown
**输出路径重定向（强制）：**

| artifact | 写入路径 |
|----------|----------|
| proposal + specs 合并 | `{MODULE_ROOT}/openspec/specs/01-{slug}-contract.md` |
| design | 合并进 contract 或 `{MODULE_ROOT}/openspec/specs/02-{slug}-design.md` |
| tasks | `{MODULE_ROOT}/plans/01-{slug}-plan.md`（禁止写入 openspec/） |

- 使用 `openspec instructions` 获取 template 和 instruction，但忽略 CLI 返回的 outputPath
- `openspec new change` 仍可用于临时工作区，但正式产物只写 MODULE_ROOT
```

- [ ] **Step 3: 同步 `.cursor/commands/opsx-propose.md`**

与 `.agents/skills/openspec-propose/SKILL.md` 保持相同改动。

---

### Task 7: 改造 explore / archive / apply 技能

**Files:**
- Modify: `.agents/skills/openspec-explore/SKILL.md`
- Modify: `.agents/skills/openspec-archive-change/SKILL.md`
- Modify: `.agents/skills/openspec-apply-change/SKILL.md`
- Modify: `.cursor/commands/opsx-explore.md`
- Modify: `.cursor/commands/opsx-archive.md`
- Modify: `.cursor/commands/opsx-apply.md`

- [ ] **Step 1: explore 重定向**

追加规则：
- 执行前先 create-demand-dir
- 探索纪要写入 `{MODULE_ROOT}/openspec/specs/00-explore-notes.md`
- 禁止只写入根 `openspec/changes/`

- [ ] **Step 2: archive 重定向**

追加规则：
- 将当前 `openspec/specs/` 旧版移入 `{MODULE_ROOT}/openspec/archive/vN-{slug}/`
- Delta 存入 `{MODULE_ROOT}/openspec/changes/YYYYMMDD-{slug}.md`
- 根 `openspec/changes/archive/` 仅清理临时工作区，不作正式归档

- [ ] **Step 3: apply 重定向**

追加规则：
- 读取 `{MODULE_ROOT}/plans/01-{slug}-plan.md` 作为任务来源
- 禁止修改 `{MODULE_ROOT}/openspec/` 下文件

- [ ] **Step 4: 同步 .cursor/commands 下三个文件**

---

### Task 8: 预留 superpowers-nested Schema

**Files:**
- Create: `openspec/schemas/superpowers-nested/schema.yaml`
- Create: `openspec/schemas/superpowers-nested/README.md`
- Create: `openspec/schemas/superpowers-nested/templates/contract.md`
- Create: `openspec/schemas/superpowers-nested/templates/plan.md`

- [ ] **Step 1: 创建 schema.yaml**

```yaml
name: superpowers-nested
version: 1
description: Superpowers 四层嵌套目录输出（需 OpenSpec >= 1.4 folder 字段）

# 当前 OpenSpec 1.3.0 不支持 folder 字段，本 schema 为预留。
# 升级后取消注释 folder 行并运行 openspec schema validate superpowers-nested

artifacts:
  - id: contract
    generates: "01-{change}-contract.md"
    # folder: "docs/superpowers/current/{type}/{module}/openspec/specs"
    template: contract.md
    description: 需求契约
    requires: []

  - id: dev-plan
    generates: "01-{change}-plan.md"
    # folder: "docs/superpowers/current/{type}/{module}/plans"
    template: plan.md
    description: 开发计划
    requires: [contract]

apply:
  requires: [dev-plan]
  tracks: "01-{change}-plan.md"
```

- [ ] **Step 2: 创建 README 说明升级路径**

- [ ] **Step 3: 创建最小模板文件**

`templates/contract.md`:
```markdown
## Why

## What Changes

## Acceptance Criteria
```

`templates/plan.md`:
```markdown
# Implementation Plan

**Contract:** ../openspec/specs/01-{change}-contract.md

## Tasks
```

---

### Task 9: 绑定 .cursorrules

**Files:**
- Modify: `.cursorrules`

- [ ] **Step 1: 追加规则**

在 `.cursorrules` 末尾追加：

```markdown
## Superpowers 工作流

执行 brainstorming、writing-plans、opsx 命令或新建需求文档前，必须先读取 `docs/superpowers/SUPERPOWERS_RULES.md` 并遵循四层目录规范。新增需求禁止写入 `docs/superpowers/specs/` 等旧扁平路径。
```

---

### Task 10: 外层开发规格（本模块）

**Files:**
- Create: `docs/superpowers/v1.0/feature/工作流目录规范/specs/01-dev-spec.md`

- [ ] **Step 1: 从 openspec contract 适配开发规格**

写入简明开发 spec，头部包含：

```markdown
**Contract:** ../openspec/specs/01-workflow-directory-design.md

## 实施范围

9 项交付物，见 contract §10。本 plan 覆盖全部。
```

（本 plan 文件即对应 `plans/01-workflow-directory-plan.md`）

---

### Task 11: 端到端验收

**Files:**
- Test only（不提交测试模块到 git，或验收后删除）

- [ ] **Step 1: 版本解析验收**

```bash
source scripts/lib/resolve-superpowers-version.sh
resolve_superpowers_version docs/superpowers
```

Expected: `v1.0`

- [ ] **Step 2: 脚本创建验收**

```bash
./scripts/create-demand.sh --type feature --name "验收测试模块"
ls -la docs/superpowers/v1.0/feature/验收测试模块/
```

Expected: 存在 openspec/specs、openspec/changes、openspec/archive、specs、plans

- [ ] **Step 3: 存量未污染验收**

```bash
git status docs/superpowers/specs/
```

Expected: 无 modified 文件

- [ ] **Step 4: 规则文件存在验收**

```bash
test -f docs/superpowers/SUPERPOWERS_RULES.md && test -f docs/superpowers/GUIDE.md && echo PASS
```

Expected: PASS

- [ ] **Step 5: 清理验收测试模块（可选）**

```bash
rm -rf "docs/superpowers/v1.0/feature/验收测试模块"
```

- [ ] **Step 6: 勾选 design spec 验收标准**

更新 `01-workflow-directory-design.md` §11 验收清单为已完成项（实施完成后）。

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §2 目录架构 | Task 1, 2, 5 |
| §5.5 opsx 重定向 | Task 6, 7 |
| §7 三套自动化 | Task 1, 2, 5 + SUPERPOWERS_RULES 模板 |
| §8 AI 约定 | Task 3, 9 |
| §5.6 Schema 预留 | Task 8 |
| §6 风险规避 | Task 3 GUIDE + RULES |
| §10 交付清单 9 项 | Task 1-10 |
| §11 验收标准 | Task 11 |

---

## 执行顺序建议

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10 → Task 11
```

Task 1-2 可并行；Task 6-7 依赖 Task 5；Task 11 最后执行。
