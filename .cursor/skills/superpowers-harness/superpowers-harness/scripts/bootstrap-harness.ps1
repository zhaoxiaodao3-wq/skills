# bootstrap-harness.ps1 — 在 superpowers-demand-workflow 基础上安装 Harness 层
param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Write-Utf8File {
    param([string]$Path, [string]$Content)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Read-Utf8File {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, $Utf8NoBom)
}

$HarnessScripts = $PSScriptRoot
$HarnessRoot = Split-Path -Parent $HarnessScripts
$AgentsSkills = Split-Path -Parent $HarnessRoot
$ProjectRoot = (Resolve-Path $ProjectRoot).Path

Write-Host "Superpowers Harness 安装" -ForegroundColor Cyan
Write-Host "  项目: $ProjectRoot"
Write-Host ""

# Step 1: demand-workflow bootstrap
$DemandBootstrap = Join-Path $AgentsSkills "superpowers-demand-workflow\scripts\bootstrap.ps1"
if (Test-Path $DemandBootstrap) {
    & $DemandBootstrap -ProjectRoot $ProjectRoot
} else {
    Write-Host "  [警告] 未找到 demand-workflow bootstrap，跳过" -ForegroundColor Yellow
}

# Step 2: 复制 scripts/harness/
$TargetHarness = Join-Path $ProjectRoot "scripts\harness"
New-Item -ItemType Directory -Force -Path $TargetHarness | Out-Null

$ValidatorsSrc = Join-Path $HarnessRoot "validators"
$ValidatorsDst = Join-Path $TargetHarness "validators"
if (Test-Path $ValidatorsDst) { Remove-Item -Recurse -Force $ValidatorsDst }
Copy-Item -Path $ValidatorsSrc -Destination $ValidatorsDst -Recurse -Force
Write-Host "  [复制] scripts\harness\validators\" -ForegroundColor Green

$CliSrc = Join-Path $HarnessScripts "validate-harness.mjs"
$CliDst = Join-Path $TargetHarness "validate-harness.mjs"
$cliContent = Read-Utf8File $CliSrc
$cliContent = $cliContent -replace "from '\.\./validators/", "from './validators/"
$cliContent = $cliContent -replace 'from "\.\./validators/', 'from "./validators/'
Write-Utf8File $CliDst $cliContent
Write-Host "  [复制] scripts\harness\validate-harness.mjs" -ForegroundColor Green

# Step 3: HARNESS_RULES.md
$SuperpowersBase = Join-Path $ProjectRoot "docs\superpowers"
New-Item -ItemType Directory -Force -Path $SuperpowersBase | Out-Null
$RulesSrc = Join-Path $HarnessRoot "references\HARNESS_RULES.md"
$RulesDst = Join-Path $SuperpowersBase "HARNESS_RULES.md"
if (-not (Test-Path $RulesDst)) {
    Copy-Item $RulesSrc $RulesDst
    Write-Host "  [创建] docs\superpowers\HARNESS_RULES.md" -ForegroundColor Green
} else {
    Write-Host "  [跳过] HARNESS_RULES.md 已存在" -ForegroundColor DarkGray
}

# Step 4: AGENTS.md
$AgentsDst = Join-Path $ProjectRoot "AGENTS.md"
if (-not (Test-Path $AgentsDst)) {
    $Template = Read-Utf8File (Join-Path $HarnessRoot "references\AGENTS.md.template")
    $Agents = $Template -replace '\{\{FRAMEWORK\}\}', 'Vue 3 + Vite + TypeScript'
    $Agents = $Agents -replace '\{\{UI_LIB\}\}', 'Element Plus'
    $Agents = $Agents -replace '\{\{STATE\}\}', 'Pinia'
    Write-Utf8File $AgentsDst $Agents
    Write-Host "  [创建] AGENTS.md" -ForegroundColor Green
} else {
    Write-Host "  [跳过] AGENTS.md 已存在" -ForegroundColor DarkGray
}

# Step 5: .cursorrules 片段
$CursorRules = Join-Path $ProjectRoot ".cursorrules"
$Snippet = Read-Utf8File (Join-Path $HarnessRoot "references\cursorrules.snippet")
if (Test-Path $CursorRules) {
    $Existing = Read-Utf8File $CursorRules
    if ($Existing -notmatch 'Harness 门禁') {
        Write-Utf8File $CursorRules ($Existing.TrimEnd() + "`n`n" + $Snippet.Trim())
        Write-Host "  [追加] .cursorrules Harness 片段" -ForegroundColor Green
    } else {
        Write-Host "  [跳过] .cursorrules 已含 Harness 片段" -ForegroundColor DarkGray
    }
} else {
    Write-Utf8File $CursorRules $Snippet
    Write-Host "  [创建] .cursorrules" -ForegroundColor Green
}

# Step 6: 同步 skill
foreach ($Target in @(
    (Join-Path $ProjectRoot ".agents\skills\superpowers-harness"),
    (Join-Path $ProjectRoot ".cursor\skills\superpowers-harness")
)) {
    $Parent = Split-Path $Target -Parent
    New-Item -ItemType Directory -Force -Path $Parent | Out-Null
    if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
    Copy-Item -Path $HarnessRoot -Destination $Target -Recurse -Force
    Write-Host "  [同步] $Target" -ForegroundColor Green
}

# Step 7: package.json pre-commit
$PkgPath = Join-Path $ProjectRoot "package.json"
if (Test-Path $PkgPath) {
    $Pkg = Read-Utf8File $PkgPath | ConvertFrom-Json
    $hook = 'node scripts/harness/validate-harness.mjs || exit 0'
    if ($Pkg.'simple-git-hooks'.'pre-commit') {
        $existing = $Pkg.'simple-git-hooks'.'pre-commit'
        if ($existing -notmatch 'validate-harness') {
            $Pkg.'simple-git-hooks'.'pre-commit' = "$existing && $hook"
        }
    } else {
        $Pkg | Add-Member -NotePropertyName 'simple-git-hooks' -NotePropertyValue (@{ 'pre-commit' = $hook }) -Force
    }
    Write-Utf8File $PkgPath ($Pkg | ConvertTo-Json -Depth 10)
    Write-Host "  [更新] package.json pre-commit" -ForegroundColor Green
}

# Step 8: .gitignore
$Gitignore = Join-Path $ProjectRoot ".gitignore"
if (Test-Path $Gitignore) {
    $Gi = Read-Utf8File $Gitignore
    if ($Gi -notmatch '\.harness/') {
        Write-Utf8File $Gitignore ($Gi.TrimEnd() + "`n.harness/`n")
        Write-Host "  [追加] .gitignore .harness/" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Harness 安装完成。" -ForegroundColor Green
Write-Host "  自查: node scripts/harness/validate-harness.mjs"
Write-Host "  规则: docs\superpowers\HARNESS_RULES.md"
Write-Host "  技能: superpowers-harness"
