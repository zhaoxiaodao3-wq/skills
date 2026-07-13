# bootstrap.ps1 — 将 Superpowers 工作流安装到目标项目
param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$SkillScripts = $PSScriptRoot
$SkillRoot = Split-Path -Parent $SkillScripts
$ProjectRoot = (Resolve-Path $ProjectRoot).Path

$TargetScripts = Join-Path $ProjectRoot "scripts"
$TargetLib = Join-Path $TargetScripts "lib"
$SuperpowersBase = Join-Path $ProjectRoot "docs\superpowers"

Write-Host "Superpowers 工作流安装" -ForegroundColor Cyan
Write-Host "  项目: $ProjectRoot"
Write-Host ""

# 复制脚本
New-Item -ItemType Directory -Force -Path $TargetScripts, $TargetLib | Out-Null
$files = @(
    "create-demand.sh", "create-demand.ps1", "create-demand.bat",
    "init-version.ps1", "init-version.bat",
    "lib\resolve-superpowers-version.sh"
)
foreach ($f in $files) {
    $src = Join-Path $SkillScripts $f
    $dst = Join-Path $TargetScripts $f
    $dstDir = Split-Path -Parent $dst
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "  [复制] scripts\$f" -ForegroundColor Green
}

# 创建 docs/superpowers
New-Item -ItemType Directory -Force -Path $SuperpowersBase | Out-Null

$rulesSrc = Join-Path $SkillRoot "references\SUPERPOWERS_RULES.md"
$guideSrc = Join-Path $SkillRoot "references\GUIDE.md"
$rulesDst = Join-Path $SuperpowersBase "SUPERPOWERS_RULES.md"
$guideDst = Join-Path $SuperpowersBase "GUIDE.md"
$versionTxt = Join-Path $SuperpowersBase "current-version.txt"

if (-not (Test-Path $rulesDst)) {
    Copy-Item $rulesSrc $rulesDst
    Write-Host "  [创建] docs\superpowers\SUPERPOWERS_RULES.md" -ForegroundColor Green
} else {
    Write-Host "  [跳过] SUPERPOWERS_RULES.md 已存在" -ForegroundColor DarkGray
}

if (-not (Test-Path $guideDst)) {
    Copy-Item $guideSrc $guideDst
    Write-Host "  [创建] docs\superpowers\GUIDE.md" -ForegroundColor Green
} else {
    Write-Host "  [跳过] GUIDE.md 已存在" -ForegroundColor DarkGray
}

if (-not (Test-Path $versionTxt)) {
    [System.IO.File]::WriteAllText($versionTxt, "v1.0.0`n", [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [创建] docs\superpowers\current-version.txt -> v1.0.0" -ForegroundColor Green
} else {
    Write-Host "  [跳过] current-version.txt 已存在" -ForegroundColor DarkGray
}

# 初始化 v1.0.0 骨架
& (Join-Path $TargetScripts "create-demand.ps1") -InitVersion -Version v1.0.0

Write-Host ""
Write-Host "安装完成。" -ForegroundColor Green
Write-Host "  建需求: scripts\create-demand.bat"
Write-Host "  新版本: scripts\init-version.bat"
Write-Host "  AI 规则: docs\superpowers\SUPERPOWERS_RULES.md"
