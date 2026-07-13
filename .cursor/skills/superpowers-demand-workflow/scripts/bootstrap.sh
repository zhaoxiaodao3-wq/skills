#!/usr/bin/env bash
# bootstrap.sh — 将 Superpowers 工作流安装到目标项目
set -eu
(set -o pipefail) 2>/dev/null && set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "${1:-.}" && pwd)"

TARGET_SCRIPTS="$PROJECT_ROOT/scripts"
TARGET_LIB="$TARGET_SCRIPTS/lib"
SUPERPOWERS_BASE="$PROJECT_ROOT/docs/superpowers"

echo "Superpowers 工作流安装"
echo "  项目: $PROJECT_ROOT"
echo ""

mkdir -p "$TARGET_SCRIPTS" "$TARGET_LIB"

for f in create-demand.sh create-demand.ps1 create-demand.bat \
         init-version.ps1 init-version.bat \
         lib/resolve-superpowers-version.sh; do
  src="$SCRIPT_DIR/$f"
  dst="$TARGET_SCRIPTS/$f"
  mkdir -p "$(dirname "$dst")"
  cp -f "$src" "$dst"
  echo "  [复制] scripts/$f"
done

mkdir -p "$SUPERPOWERS_BASE"

copy_if_missing() {
  local src="$1" dst="$2" label="$3"
  if [[ -f "$dst" ]]; then
    echo "  [跳过] $label 已存在"
  else
    cp "$src" "$dst"
    echo "  [创建] $label"
  fi
}

copy_if_missing "$SKILL_ROOT/references/SUPERPOWERS_RULES.md" \
  "$SUPERPOWERS_BASE/SUPERPOWERS_RULES.md" "docs/superpowers/SUPERPOWERS_RULES.md"
copy_if_missing "$SKILL_ROOT/references/GUIDE.md" \
  "$SUPERPOWERS_BASE/GUIDE.md" "docs/superpowers/GUIDE.md"

if [[ -f "$SUPERPOWERS_BASE/current-version.txt" ]]; then
  echo "  [跳过] current-version.txt 已存在"
else
  printf 'v1.0.0\n' > "$SUPERPOWERS_BASE/current-version.txt"
  echo "  [创建] docs/superpowers/current-version.txt -> v1.0.0"
fi

chmod +x "$TARGET_SCRIPTS/create-demand.sh" 2>/dev/null || true
bash "$TARGET_SCRIPTS/create-demand.sh" --init-version --version v1.0.0

echo ""
echo "安装完成。"
echo "  建需求: ./scripts/create-demand.sh --type feature --name \"模块名\""
echo "  AI 规则: docs/superpowers/SUPERPOWERS_RULES.md"
