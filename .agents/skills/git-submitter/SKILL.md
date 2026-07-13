---
name: git-submitter
description: 专门用于将本地项目的修改提交到 Git。当用户输入关键字“push”时，请务必使用此技能。它会自动进行 ESLint 修复、分析改动、生成中文提交信息，并在确认后执行提交和推送操作。
---

# Git Submitter 技能

此技能用于实现“质量检查 -> 自动修复 -> 提交信息确认 -> 推送”的流程。

## 核心要求

1.  **触发关键字**: 仅在大佬说“push”或相关表达时触发。
2.  **Lint 自动修复**: 运行脚本 `node .agents/skills/git-submitter/scripts/lint-and-report.js` 时应设置为 `SafeToAutoRun: true` 以节省大佬时间。
3.  **信息确认 (CRITICAL)**: 在执行 `git commit` 之前，必须先将生成的提交信息（Conventional Commits 格式 + 中文描述）呈现给大佬，并询问“大佬，这个提交信息可以吗？确认后我将为您执行 commit 和 push”。
4.  **Conventional Commits**: 必须严格遵守格式（例如 `feat:`, `fix:`, `refactor:` 等）。
5.  **中文描述**: 冒号后的内容必须使用中文。
6.  **自动推送**: 大佬确认 commit 信息后，必须执行 `git push`（如果是新分支，使用 `git push -u origin [分支名]`）。
7.  **按需分枝**: 仅在用户明确说明“创建新分支并推送”时才通过 `git checkout -b` 创建分支。

## 操作流程

### 1. 识别改动与分支需求
- 检查当前 Git 状态 `git status`。
- 如果大佬要求创建新分支，执行 `git checkout -b [分支名]`。

### 2. 代码规范检测与自动修复
- **全自动执行**: 运行辅助脚本 `node .agents/skills/git-submitter/scripts/lint-and-report.js` (SafeToAutoRun: true)。
- **报告结果**: 根据脚本输出，告知大佬哪些文件被自动修改了。
- 如果脚本以非 0 状态退出（有无法修复的错误），必须停止。

### 3. 生成与确认提交信息
- 分析 `git diff` 结果。
- 生成格式：`<type>: <中文描述>`。
- **询问确认**: “大佬，生成的提交信息为 `[信息内容]`，可以吗？”

### 4. 执行 Git 操作
- 得到大佬确认后：
- `git add .`
- `git commit -m "[信息内容]"`
- `git push`

## 错误处理
- 若 `git push` 失败，检查是否需要先 `git pull`。
