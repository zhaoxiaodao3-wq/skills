# Superpowers Harness 门禁体系 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 在现有 `superpowers-demand-workflow` 之上叠加 Harness 层（宽松门禁 + 校验器 + bootstrap 迁移），防止 Agent 跳过 spec/plan 直接改 `src/`。

**Architecture:** 新建 `.agents/skills/superpowers-harness/` 技能包，内含 validators（workflow-gate、doc-structure）、CLI 入口 `validate-harness.mjs`、`bootstrap-harness` 安装脚本。校验器读取 git staged 文件与 `docs/superpowers/{version}/` 模块目录，宽松模式 warning + exit 0，`--strict` 时 exit 1。

**Tech Stack:** Node.js ESM、Vitest、PowerShell/Bash、simple-git-hooks

---

## 文件结构总览

| 文件 | 职责 |
|------|------|
| `validators/lib/resolve-version.js` | 解析 current-version / 软链接 |
| `validators/lib/discover-modules.js` | 扫描四类目录下所有模块 |
| `validators/lib/git-staged.js` | 获取 staged 文件列表 |
| `validators/lib/format-warning.js` | 统一警告格式 |
| `validators/workflow-gate.js` | src/ 改动门禁 |
| `validators/doc-structure.js` | 文档路径与头部链接 |
| `validators/index.js` | 聚合校验、写 warnings.log |
| `scripts/validate-harness.mjs` | CLI 入口 |
| `references/HARNESS_RULES.md` | Harness 规则文档 |
| `references/AGENTS.md.template` | 项目地图模板 |
| `references/cursorrules.snippet` | .cursorrules 追加片段 |
| `SKILL.md` | 编排技能 |
| `scripts/bootstrap-harness.ps1` | Windows 安装 |
| `scripts/bootstrap-harness.sh` | macOS/Linux 安装 |

---

### Task 1: 公共工具库

**Files:**
- Create: `.agents/skills/superpowers-harness/validators/lib/resolve-version.js`
- Create: `.agents/skills/superpowers-harness/validators/lib/discover-modules.js`
- Create: `.agents/skills/superpowers-harness/validators/lib/git-staged.js`
- Create: `.agents/skills/superpowers-harness/validators/lib/format-warning.js`
- Test: `.agents/skills/superpowers-harness/validators/__tests__/lib.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
// validators/__tests__/lib.spec.js
import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync, symlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { resolveSuperpowersVersion, resolveVersionDir } from '../lib/resolve-version.js'
import { discoverModules } from '../lib/discover-modules.js'

describe('resolveSuperpowersVersion', () => {
  it('reads current-version.txt', () => {
    const base = mkdtempSync(join(tmpdir(), 'sp-'))
    writeFileSync(join(base, 'current-version.txt'), 'v1.4.8\n')
    expect(resolveSuperpowersVersion(base)).toBe('v1.4.8')
  })

  it('normalizes two-part version', () => {
    const base = mkdtempSync(join(tmpdir(), 'sp-'))
    writeFileSync(join(base, 'current-version.txt'), 'v1.4\n')
    expect(resolveSuperpowersVersion(base)).toBe('v1.4.0')
  })
})

describe('discoverModules', () => {
  it('finds modules under type dirs', () => {
    const base = mkdtempSync(join(tmpdir(), 'sp-'))
    const mod = join(base, 'v1.0.0', 'feature', '测试模块')
    mkdirSync(join(mod, 'requirements'), { recursive: true })
    mkdirSync(join(mod, 'specs'), { recursive: true })
    const modules = discoverModules(join(base, 'v1.0.0'))
    expect(modules).toHaveLength(1)
    expect(modules[0].name).toBe('测试模块')
    expect(modules[0].type).toBe('feature')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
pnpm vitest run .agents/skills/superpowers-harness/validators/__tests__/lib.spec.js
```

Expected: FAIL — module not found

- [ ] **Step 3: 实现 resolve-version.js**

```javascript
// validators/lib/resolve-version.js
import { existsSync, readFileSync, lstatSync, readlinkSync } from 'node:fs'
import { join } from 'node:path'

export function normalizeVersion(ver) {
  const trimmed = ver.trim()
  if (/^v\d+\.\d+$/.test(trimmed)) return `${trimmed}.0`
  return trimmed
}

export function resolveSuperpowersVersion(superpowersBase) {
  const currentLink = join(superpowersBase, 'current')
  if (existsSync(currentLink) && lstatSync(currentLink).isSymbolicLink()) {
    return normalizeVersion(readlinkSync(currentLink).replace(/^\.\//, ''))
  }
  const versionFile = join(superpowersBase, 'current-version.txt')
  if (existsSync(versionFile)) {
    return normalizeVersion(readFileSync(versionFile, 'utf8'))
  }
  return 'v1.0.0'
}

export function resolveVersionDir(superpowersBase, version) {
  const normalized = normalizeVersion(version)
  if (existsSync(join(superpowersBase, normalized))) return normalized
  const legacy = normalized.replace(/\.0$/, '')
  if (legacy !== normalized && existsSync(join(superpowersBase, legacy))) return legacy
  return normalized
}
```

- [ ] **Step 4: 实现 discover-modules.js**

```javascript
// validators/lib/discover-modules.js
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const TYPES = ['feature', 'ui-style', 'api-adapter', 'fix']

export function discoverModules(versionRoot) {
  if (!existsSync(versionRoot)) return []
  const modules = []
  for (const type of TYPES) {
    const typeDir = join(versionRoot, type)
    if (!existsSync(typeDir)) continue
    for (const name of readdirSync(typeDir)) {
      const moduleRoot = join(typeDir, name)
      if (!statSync(moduleRoot).isDirectory()) continue
      modules.push({
        type,
        name,
        root: moduleRoot,
        hasSpec: existsSync(join(moduleRoot, 'specs', '01-dev-spec.md')),
        hasPlan: existsSync(join(moduleRoot, 'plans', '01-dev-plan.md')),
        dirs: ['requirements', 'specs', 'plans', 'archive'].map((d) => ({
          name: d,
          exists: existsSync(join(moduleRoot, d)),
        })),
      })
    }
  }
  return modules
}
```

- [ ] **Step 5: 实现 git-staged.js 与 format-warning.js**

```javascript
// validators/lib/git-staged.js
import { execSync } from 'node:child_process'

export function getStagedFiles(cwd = process.cwd()) {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd,
      encoding: 'utf8',
    })
    return out.split('\n').map((l) => l.trim()).filter(Boolean)
  } catch {
    return []
  }
}
```

```javascript
// validators/lib/format-warning.js
export function formatWarning(warning) {
  const lines = [
    `⚠️  [HARNESS:${warning.code}]`,
    `    ${warning.message}`,
    '',
    '    修复步骤：',
    ...warning.remediation.map((s, i) => `    ${i + 1}. ${s}`),
    '',
    `    模式：${warning.mode === 'strict' ? '严格（阻断提交）' : '宽松（不阻断提交）'}。自查：node scripts/validate-harness.mjs`,
  ]
  return lines.join('\n')
}
```

- [ ] **Step 6: 运行测试通过**

```bash
pnpm vitest run .agents/skills/superpowers-harness/validators/__tests__/lib.spec.js
```

Expected: PASS

---

### Task 2: workflow-gate 校验器

**Files:**
- Create: `.agents/skills/superpowers-harness/validators/workflow-gate.js`
- Test: `.agents/skills/superpowers-harness/validators/__tests__/workflow-gate.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
// validators/__tests__/workflow-gate.spec.js
import { describe, expect, it } from 'vitest'
import { checkWorkflowGate } from '../workflow-gate.js'

describe('checkWorkflowGate', () => {
  it('returns empty when no src changes', () => {
    expect(checkWorkflowGate([], [])).toEqual([])
  })

  it('warns when src changes but no active plan', () => {
    const warnings = checkWorkflowGate(['src/pages/foo.vue'], [
      { hasSpec: false, hasPlan: false },
    ])
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe('WORKFLOW_GATE_NO_PLAN')
  })

  it('passes when module has spec and plan', () => {
    const warnings = checkWorkflowGate(['src/pages/foo.vue'], [
      { hasSpec: true, hasPlan: true },
    ])
    expect(warnings).toEqual([])
  })

  it('warns when no modules exist', () => {
    const warnings = checkWorkflowGate(['src/pages/foo.vue'], [])
    expect(warnings[0].code).toBe('WORKFLOW_GATE_NO_MODULE')
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
pnpm vitest run .agents/skills/superpowers-harness/validators/__tests__/workflow-gate.spec.js
```

- [ ] **Step 3: 实现 workflow-gate.js**

```javascript
// validators/workflow-gate.js

/**
 * @param {string[]} stagedFiles
 * @param {{ hasSpec: boolean, hasPlan: boolean }[]} modules
 * @returns {Array<{ code: string, message: string, remediation: string[], files?: string[] }>}
 */
export function checkWorkflowGate(stagedFiles, modules) {
  const srcChanges = stagedFiles.filter((f) => f.startsWith('src/'))
  if (srcChanges.length === 0) return []

  if (modules.length === 0) {
    return [{
      code: 'WORKFLOW_GATE_NO_MODULE',
      message: `src/ 有 ${srcChanges.length} 个文件改动，但 superpowers 下找不到任何需求模块。`,
      files: srcChanges,
      remediation: [
        '运行 scripts\\create-demand.bat --type feature --name "你的模块名"',
        '将原始需求写入 requirements/',
        '执行 brainstorming 写 specs/01-dev-spec.md',
        '执行 writing-plans 写 plans/01-dev-plan.md',
      ],
    }]
  }

  const hasActivePlan = modules.some((m) => m.hasSpec && m.hasPlan)
  if (!hasActivePlan) {
    return [{
      code: 'WORKFLOW_GATE_NO_PLAN',
      message: `src/ 有 ${srcChanges.length} 个文件改动，但 superpowers 下找不到活跃的 spec/plan。`,
      files: srcChanges,
      remediation: [
        '运行 scripts\\create-demand.bat --type feature --name "你的模块名"',
        '执行 /brainstorming 写 specs/01-dev-spec.md',
        '执行 /writing-plans 写 plans/01-dev-plan.md',
      ],
    }]
  }

  return []
}
```

- [ ] **Step 4: 运行测试通过**

```bash
pnpm vitest run .agents/skills/superpowers-harness/validators/__tests__/workflow-gate.spec.js
```

---

### Task 3: doc-structure 校验器

**Files:**
- Create: `.agents/skills/superpowers-harness/validators/doc-structure.js`
- Test: `.agents/skills/superpowers-harness/validators/__tests__/doc-structure.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
// validators/__tests__/doc-structure.spec.js
import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { checkDocStructure } from '../doc-structure.js'

const LEGACY_PREFIXES = [
  'docs/superpowers/specs/',
  'docs/superpowers/plans/',
  'docs/superpowers/archive/',
  'docs/superpowers/reports/',
]

describe('checkDocStructure', () => {
  it('warns on legacy path writes', () => {
    const warnings = checkDocStructure(
      ['docs/superpowers/specs/new.md'],
      [],
      '/fake',
    )
    expect(warnings.some((w) => w.code === 'DOC_LEGACY_PATH')).toBe(true)
  })

  it('warns when spec missing Requirement link', () => {
    const base = mkdtempSync(join(tmpdir(), 'sp-'))
    const specPath = join(base, 'specs', '01-dev-spec.md')
    mkdirSync(join(base, 'specs'), { recursive: true })
    writeFileSync(specPath, '# spec\n\nno header\n')
    const mod = {
      root: base,
      name: '测试',
      type: 'feature',
      dirs: [
        { name: 'requirements', exists: true },
        { name: 'specs', exists: true },
        { name: 'plans', exists: true },
        { name: 'archive', exists: true },
      ],
    }
    const warnings = checkDocStructure([], [mod], base)
    expect(warnings.some((w) => w.code === 'DOC_MISSING_REQUIREMENT_LINK')).toBe(true)
  })
})
```

- [ ] **Step 2: 实现 doc-structure.js**

```javascript
// validators/doc-structure.js
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'

const LEGACY_PREFIXES = [
  'docs/superpowers/specs/',
  'docs/superpowers/plans/',
  'docs/superpowers/archive/',
  'docs/superpowers/reports/',
]

const REQUIREMENT_LINK_RE = /\*\*Requirement:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/
const SPEC_LINK_RE = /\*\*Spec:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/

export function checkDocStructure(stagedFiles, modules, _projectRoot) {
  const warnings = []

  for (const file of stagedFiles) {
    const normalized = file.replace(/\\/g, '/')
    if (LEGACY_PREFIXES.some((p) => normalized.startsWith(p))) {
      warnings.push({
        code: 'DOC_LEGACY_PATH',
        message: `禁止写入旧扁平路径：${normalized}`,
        remediation: [
          '使用 scripts\\create-demand.bat 创建模块目录',
          '写入 docs/superpowers/current/{type}/{模块名}/ 下对应子目录',
        ],
      })
    }
  }

  for (const mod of modules) {
    const missingDirs = mod.dirs.filter((d) => !d.exists).map((d) => d.name)
    if (missingDirs.length > 0) {
      warnings.push({
        code: 'DOC_INCOMPLETE_DIRS',
        message: `模块「${mod.name}」缺少目录：${missingDirs.join(', ')}`,
        remediation: ['重新运行 create-demand 或手动补齐四层目录'],
      })
    }

    const specPath = join(mod.root, 'specs', '01-dev-spec.md')
    if (existsSync(specPath)) {
      const content = readFileSync(specPath, 'utf8')
      const match = content.match(REQUIREMENT_LINK_RE)
      if (!match) {
        warnings.push({
          code: 'DOC_MISSING_REQUIREMENT_LINK',
          message: `spec 缺少 **Requirement:** 头部链接：${specPath}`,
          remediation: ['在 spec 头部添加：**Requirement:** [requirements/xxx.md](../requirements/xxx.md)'],
        })
      } else {
        const target = join(dirname(specPath), match[2])
        if (!existsSync(target)) {
          warnings.push({
            code: 'DOC_BROKEN_LINK',
            message: `spec 的 Requirement 链接目标不存在：${match[2]}`,
            remediation: ['创建对应 requirements 文件或修正链接路径'],
          })
        }
      }
    }

    const planPath = join(mod.root, 'plans', '01-dev-plan.md')
    if (existsSync(planPath)) {
      const content = readFileSync(planPath, 'utf8')
      const match = content.match(SPEC_LINK_RE)
      if (!match) {
        warnings.push({
          code: 'DOC_MISSING_SPEC_LINK',
          message: `plan 缺少 **Spec:** 头部链接：${planPath}`,
          remediation: ['在 plan 头部添加：**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)'],
        })
      } else {
        const target = join(dirname(planPath), match[2])
        if (!existsSync(target)) {
          warnings.push({
            code: 'DOC_BROKEN_LINK',
            message: `plan 的 Spec 链接目标不存在：${match[2]}`,
            remediation: ['创建 specs/01-dev-spec.md 或修正链接路径'],
          })
        }
      }
    }
  }

  return warnings
}
```

- [ ] **Step 3: 运行测试通过**

```bash
pnpm vitest run .agents/skills/superpowers-harness/validators/__tests__/doc-structure.spec.js
```

---

### Task 4: 聚合器与 CLI 入口

**Files:**
- Create: `.agents/skills/superpowers-harness/validators/index.js`
- Create: `.agents/skills/superpowers-harness/scripts/validate-harness.mjs`
- Test: `.agents/skills/superpowers-harness/validators/__tests__/index.spec.js`

- [ ] **Step 1: 实现 validators/index.js**

```javascript
// validators/index.js
import { join } from 'node:path'
import { mkdirSync, appendFileSync, existsSync } from 'node:fs'
import { resolveSuperpowersVersion, resolveVersionDir } from './lib/resolve-version.js'
import { discoverModules } from './lib/discover-modules.js'
import { getStagedFiles } from './lib/git-staged.js'
import { checkWorkflowGate } from './workflow-gate.js'
import { checkDocStructure } from './doc-structure.js'

export function runHarnessValidation(options = {}) {
  const { cwd = process.cwd(), strict = false } = options
  const superpowersBase = join(cwd, 'docs', 'superpowers')
  const version = resolveSuperpowersVersion(superpowersBase)
  const versionDir = resolveVersionDir(superpowersBase, version)
  const versionRoot = join(superpowersBase, versionDir)
  const modules = discoverModules(versionRoot)
  const staged = getStagedFiles(cwd)

  const mode = strict ? 'strict' : 'loose'
  const raw = [
    ...checkWorkflowGate(staged, modules),
    ...checkDocStructure(staged, modules, cwd),
  ].map((w) => ({ ...w, mode }))

  return { warnings: raw, staged, modules, mode }
}

export function writeWarningsLog(cwd, result) {
  const logDir = join(cwd, '.harness')
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })
  const entry = {
    timestamp: new Date().toISOString(),
    mode: result.mode,
    warnings: result.warnings.map(({ code, files }) => ({ code, files })),
    exitCode: result.warnings.length > 0 && result.mode === 'strict' ? 1 : 0,
  }
  appendFileSync(join(logDir, 'warnings.log'), JSON.stringify(entry) + '\n', 'utf8')
}
```

- [ ] **Step 2: 实现 validate-harness.mjs**

```javascript
#!/usr/bin/env node
// scripts/validate-harness.mjs
import { runHarnessValidation, writeWarningsLog } from '../validators/index.js'
import { formatWarning } from '../validators/lib/format-warning.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const strict = process.argv.includes('--strict')
const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = process.cwd()

// 从项目 scripts/ 运行时，validators 在同技能包内
const result = runHarnessValidation({ cwd: projectRoot, strict })

for (const w of result.warnings) {
  console.warn(formatWarning(w))
}

if (result.warnings.length > 0) {
  writeWarningsLog(projectRoot, result)
}

const exitCode = strict && result.warnings.length > 0 ? 1 : 0
process.exit(exitCode)
```

> **注意：** `validate-harness.mjs` 在 skill 包内通过相对路径 `../validators/` 引用；bootstrap 复制到项目 `scripts/` 时，须同时复制整个 `validators/` 目录到 `scripts/lib/harness-validators/`，或保持从 `.agents/skills/superpowers-harness/` 引用。推荐方案：**bootstrap 复制 `validate-harness.mjs` + `validators/` 到 `scripts/harness/`**，入口改为 `scripts/harness/validate-harness.mjs`。

- [ ] **Step 3: 调整目录布局（最终方案）**

```
scripts/harness/
├── validate-harness.mjs    # CLI 入口
└── validators/             # 从 skill 复制
    ├── index.js
    ├── workflow-gate.js
    ├── doc-structure.js
    └── lib/
```

package.json pre-commit 调用：`node scripts/harness/validate-harness.mjs || true`（宽松模式永不 fail hook）

- [ ] **Step 4: 写 index 集成测试**

```javascript
// validators/__tests__/index.spec.js
import { describe, expect, it } from 'vitest'
import { runHarnessValidation } from '../index.js'

describe('runHarnessValidation', () => {
  it('returns loose mode by default', () => {
    const result = runHarnessValidation({ cwd: process.cwd(), strict: false })
    expect(result.mode).toBe('loose')
  })
})
```

- [ ] **Step 5: 运行全部 harness 测试**

```bash
pnpm vitest run .agents/skills/superpowers-harness/validators/__tests__/
```

Expected: PASS

---

### Task 5: 参考文档与技能定义

**Files:**
- Create: `.agents/skills/superpowers-harness/references/HARNESS_RULES.md`
- Create: `.agents/skills/superpowers-harness/references/AGENTS.md.template`
- Create: `.agents/skills/superpowers-harness/references/cursorrules.snippet`
- Create: `.agents/skills/superpowers-harness/SKILL.md`

- [ ] **Step 1: 创建 HARNESS_RULES.md**

内容要点（完整写入文件）：
- 叠加 SUPERPOWERS_RULES，不替代
- 宽松模式说明
- 技能调用顺序表
- 阶段枚举与处理
- 升级路径（--strict）
- 自查命令：`node scripts/harness/validate-harness.mjs`

- [ ] **Step 2: 创建 AGENTS.md.template**

```markdown
# Agent 项目地图

## 技术栈
- {{FRAMEWORK}}
- {{UI_LIB}}
- {{STATE}}

## 目录导航
| 路径 | 用途 |
|------|------|
| src/pages/ | 页面组件 |
| src/components/ | 公共组件 |
| docs/superpowers/current/ | 当前版本需求文档 |

## 开发流程（强制）
1. 读取 docs/superpowers/HARNESS_RULES.md
2. 读取 docs/superpowers/SUPERPOWERS_RULES.md
3. 由 superpowers-harness 判断阶段
4. 完成 spec/plan 后再改 src/

## 禁止
- 写入 docs/superpowers/specs/ 等旧扁平路径
- 跳过 brainstorming 直接写代码（宽松模式下会警告）
```

- [ ] **Step 3: 创建 cursorrules.snippet**

```markdown
## Harness 门禁

开发类任务（新功能、改页面、修 bug、实现需求）前：
1. 读取 docs/superpowers/HARNESS_RULES.md
2. 使用 superpowers-harness 技能判断阶段
3. 未完成 spec/plan 时不得修改 src/
```

- [ ] **Step 4: 创建 SKILL.md**

frontmatter description 示例：

```yaml
name: superpowers-harness
description: >-
  Superpowers Harness 门禁与迁移：开发类任务入口，判断需求阶段（create-demand /
  brainstorming / writing-plans / 开发），防止 Agent 跳过 spec/plan 直接改代码。
  用户说新功能、改页面、修 bug、开发、实现时必须使用。与 superpowers-demand-workflow
  配合使用；新项目用 bootstrap-harness 安装。
```

正文包含：阶段判断逻辑、技能路由表、宽松模式行为、validate 自查、bootstrap 指引。

---

### Task 6: bootstrap-harness 安装脚本

**Files:**
- Create: `.agents/skills/superpowers-harness/scripts/bootstrap-harness.ps1`
- Create: `.agents/skills/superpowers-harness/scripts/bootstrap-harness.sh`

- [ ] **Step 1: 实现 bootstrap-harness.ps1 核心逻辑**

```powershell
# 1. 调用 demand-workflow bootstrap（同目录上级的 superpowers-demand-workflow）
$DemandBootstrap = Join-Path (Split-Path (Split-Path $PSScriptRoot)) "superpowers-demand-workflow\scripts\bootstrap.ps1"
& $DemandBootstrap -ProjectRoot $ProjectRoot

# 2. 复制 scripts/harness/
$HarnessSrc = Join-Path (Split-Path $PSScriptRoot) "scripts"
# 复制 validate-harness.mjs + validators/ → 项目 scripts/harness/

# 3. 复制 HARNESS_RULES.md → docs/superpowers/（已存在则跳过）

# 4. 从 AGENTS.md.template 生成 AGENTS.md（默认值：Vue 3 + Vite + TS / Element Plus / Pinia）

# 5. 合并 cursorrules.snippet（检测 Harness 门禁 已存在则跳过）

# 6. 复制 skill → .agents/skills/superpowers-harness/ 和 .cursor/skills/superpowers-harness/

# 7. 更新 package.json simple-git-hooks：
#    "pre-commit": "pnpm typecheck && node scripts/harness/validate-harness.mjs || exit 0"

# 8. .gitignore 追加 .harness/（已存在则跳过）

# 9. 打印安装报告
```

- [ ] **Step 2: 实现 bootstrap-harness.sh**（与 ps1 逻辑对等）

- [ ] **Step 3: 在临时目录验证 bootstrap**

```powershell
mkdir $env:TEMP\harness-test
cd $env:TEMP\harness-test
git init
powershell -File "e:\code\frontend\.agents\skills\superpowers-harness\scripts\bootstrap-harness.ps1"
```

Expected: 生成 docs/superpowers/、scripts/harness/、AGENTS.md、skills

---

### Task 7: 集成到本项目

**Files:**
- Modify: `.agents/skills/superpowers-demand-workflow/SKILL.md`
- Modify: `.cursorrules`
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `docs/superpowers/HARNESS_RULES.md`
- Create: `AGENTS.md`
- Sync: `.cursor/skills/superpowers-harness/`

- [ ] **Step 1: demand-workflow 新增衔接节**

在 `SKILL.md` 的「与 Superpowers 技能衔接」后追加：

```markdown
## 与 Harness 衔接

开发类任务入口由 `superpowers-harness` 判断阶段后调用本技能。
本技能专注目录与文档落位；不得在未完成 spec/plan 时引导修改 src/。
完整门禁规则见 docs/superpowers/HARNESS_RULES.md。
```

- [ ] **Step 2: 对本项目执行 bootstrap-harness**（或手动集成，不覆盖已有 superpowers 文件）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".agents\skills\superpowers-harness\scripts\bootstrap-harness.ps1"
```

- [ ] **Step 3: 更新 package.json pre-commit**

```json
"simple-git-hooks": {
  "pre-commit": "pnpm typecheck && node scripts/harness/validate-harness.mjs || exit 0"
}
```

- [ ] **Step 4: .gitignore 追加**

```
.harness/
```

- [ ] **Step 5: 同步 demand-workflow references**（若 HARNESS_RULES 有交叉引用则更新 GUIDE.md 一句说明）

---

### Task 8: 手工验收

- [ ] **验证宽松模式**

```bash
# 模拟：stage 一个 src 文件但不建 spec
git add src/some-file.vue
node scripts/harness/validate-harness.mjs
# Expected: 打印 WORKFLOW_GATE 警告，exit 0

node scripts/harness/validate-harness.mjs --strict
# Expected: 打印警告，exit 1
```

- [ ] **验证 spec 已有场景**

对 `docs/superpowers/v1.4.8/feature/Superpowers Harness门禁体系/` 有 spec+plan 时，仅改 harness 自身文件应无 workflow 警告。

- [ ] **勾选 spec §13.3 手工验收清单全部 6 项**

- [ ] **在模块 archive 写验收报告**

```
docs/superpowers/v1.4.8/feature/Superpowers Harness门禁体系/archive/v1-delivered/validation-report.md
```

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §3 宽松模式 | Task 4, 7 |
| §5 数据流 | Task 4, 5 (SKILL.md) |
| §6 文件清单 | Task 1-7 |
| §7 校验器规则 | Task 2, 3 |
| §8 错误处理 | Task 1 (format-warning), Task 4 (warnings.log) |
| §9 bootstrap | Task 6, 7 |
| §10-12 文档与技能 | Task 5 |
| §13 测试 | Task 1-4, 8 |
| §15 验收标准 | Task 8 |

## 不在本期（无 Task）

- Phase 2: strict 默认、CI、fix 豁免
- Phase 3: spec-quality、manifest、skill eval
