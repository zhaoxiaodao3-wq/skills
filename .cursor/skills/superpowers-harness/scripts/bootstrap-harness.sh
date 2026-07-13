#!/usr/bin/env bash
# bootstrap-harness.sh — 在 superpowers-demand-workflow 基础上安装 Harness 层
set -euo pipefail

PROJECT_ROOT="${1:-$(pwd)}"
PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"

HARNESS_SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
HARNESS_ROOT="$(dirname "$HARNESS_SCRIPTS")"
AGENTS_SKILLS="$(dirname "$HARNESS_ROOT")"

echo "Superpowers Harness 安装"
echo "  项目: $PROJECT_ROOT"
echo ""

# Step 1: demand-workflow bootstrap
DEMAND_BOOTSTRAP="$AGENTS_SKILLS/superpowers-demand-workflow/scripts/bootstrap.sh"
if [[ -f "$DEMAND_BOOTSTRAP" ]]; then
  bash "$DEMAND_BOOTSTRAP" "$PROJECT_ROOT"
else
  echo "  [警告] 未找到 demand-workflow bootstrap，跳过"
fi

# Step 2: scripts/harness/
TARGET_HARNESS="$PROJECT_ROOT/scripts/harness"
mkdir -p "$TARGET_HARNESS"
rm -rf "$TARGET_HARNESS/validators"
cp -R "$HARNESS_ROOT/validators" "$TARGET_HARNESS/validators"
sed "s|from '../validators/|from './validators/|g; s|from \"../validators/|from \"./validators/|g" \
  "$HARNESS_SCRIPTS/validate-harness.mjs" > "$TARGET_HARNESS/validate-harness.mjs"
chmod +x "$TARGET_HARNESS/validate-harness.mjs"
echo "  [复制] scripts/harness/"

# Step 3: HARNESS_RULES.md
SUPERPOWERS_BASE="$PROJECT_ROOT/docs/superpowers"
mkdir -p "$SUPERPOWERS_BASE"
if [[ ! -f "$SUPERPOWERS_BASE/HARNESS_RULES.md" ]]; then
  cp "$HARNESS_ROOT/references/HARNESS_RULES.md" "$SUPERPOWERS_BASE/HARNESS_RULES.md"
  echo "  [创建] docs/superpowers/HARNESS_RULES.md"
else
  echo "  [跳过] HARNESS_RULES.md 已存在"
fi

# Step 4: AGENTS.md
if [[ ! -f "$PROJECT_ROOT/AGENTS.md" ]]; then
  sed -e 's/{{FRAMEWORK}}/Vue 3 + Vite + TypeScript/g' \
      -e 's/{{UI_LIB}}/Element Plus/g' \
      -e 's/{{STATE}}/Pinia/g' \
    "$HARNESS_ROOT/references/AGENTS.md.template" > "$PROJECT_ROOT/AGENTS.md"
  echo "  [创建] AGENTS.md"
else
  echo "  [跳过] AGENTS.md 已存在"
fi

# Step 5: .cursorrules
SNIPPET="$HARNESS_ROOT/references/cursorrules.snippet"
if [[ -f "$PROJECT_ROOT/.cursorrules" ]]; then
  if ! grep -q 'Harness 门禁' "$PROJECT_ROOT/.cursorrules"; then
    printf '\n%s\n' "$(cat "$SNIPPET")" >> "$PROJECT_ROOT/.cursorrules"
    echo "  [追加] .cursorrules Harness 片段"
  else
    echo "  [跳过] .cursorrules 已含 Harness 片段"
  fi
else
  cp "$SNIPPET" "$PROJECT_ROOT/.cursorrules"
  echo "  [创建] .cursorrules"
fi

# Step 6: 同步 skill
for TARGET in "$PROJECT_ROOT/.agents/skills/superpowers-harness" "$PROJECT_ROOT/.cursor/skills/superpowers-harness"; do
  mkdir -p "$(dirname "$TARGET")"
  rm -rf "$TARGET"
  cp -R "$HARNESS_ROOT" "$TARGET"
  echo "  [同步] $TARGET"
done

# Step 7: .gitignore
if [[ -f "$PROJECT_ROOT/.gitignore" ]] && ! grep -q '\.harness/' "$PROJECT_ROOT/.gitignore"; then
  printf '\n.harness/\n' >> "$PROJECT_ROOT/.gitignore"
  echo "  [追加] .gitignore .harness/"
fi

echo ""
echo "Harness 安装完成。"
echo "  自查: node scripts/harness/validate-harness.mjs"
echo "  注意: 请手动更新 package.json simple-git-hooks pre-commit"
