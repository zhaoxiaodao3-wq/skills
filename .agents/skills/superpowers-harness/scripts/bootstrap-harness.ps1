# bootstrap-harness.ps1 — 在 superpowers-demand-workflow 基础上安装 Harness 层
param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

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
Write-Host '  [复制] scripts\harness\validators\' -ForegroundColor Green

$CliSrc = Join-Path $HarnessScripts "validate-harness.mjs"
$CliDst = Join-Path $TargetHarness "validate-harness.mjs"
$cliContent = [System.IO.File]::ReadAllText($CliSrc, [System.Text.Encoding]::UTF8)
$cliContent = $cliContent.Replace("from '../validators/", "from './validators/")
$cliContent = $cliContent.Replace('from "../validators/', 'from "./validators/')
[System.IO.File]::WriteAllText($CliDst, $cliContent, [System.Text.UTF8Encoding]::new($false))
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
    $Template = [System.IO.File]::ReadAllText((Join-Path $HarnessRoot "references\AGENTS.md.template"), [System.Text.Encoding]::UTF8)
    $Agents = $Template.Replace('{{FRAMEWORK}}', 'Vue 3 + Vite + TypeScript')
    $Agents = $Agents.Replace('{{UI_LIB}}', 'Element Plus')
    $Agents = $Agents.Replace('{{STATE}}', 'Pinia')
    [System.IO.File]::WriteAllText($AgentsDst, $Agents, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [创建] AGENTS.md" -ForegroundColor Green
} else {
    Write-Host "  [跳过] AGENTS.md 已存在" -ForegroundColor DarkGray
}

# Step 5: .cursorrules 片段
$CursorRules = Join-Path $ProjectRoot ".cursorrules"
$Snippet = [System.IO.File]::ReadAllText((Join-Path $HarnessRoot "references\cursorrules.snippet"), [System.Text.Encoding]::UTF8)
if (Test-Path $CursorRules) {
    $Existing = [System.IO.File]::ReadAllText($CursorRules, [System.Text.Encoding]::UTF8)
    if ($Existing -notmatch 'Harness 门禁') {
        [System.IO.File]::AppendAllText($CursorRules, "`n$Snippet", [System.Text.UTF8Encoding]::new($false))
        Write-Host "  [追加] .cursorrules Harness 片段" -ForegroundColor Green
    } else {
        Write-Host "  [跳过] .cursorrules 已含 Harness 片段" -ForegroundColor DarkGray
    }
} else {
    [System.IO.File]::WriteAllText($CursorRules, $Snippet, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [创建] .cursorrules" -ForegroundColor Green
}

# Step 6: 同步 skill（跳过源目录自身）
$HarnessRootResolved = (Resolve-Path $HarnessRoot).Path
foreach ($Target in @(
    (Join-Path $ProjectRoot ".agents\skills\superpowers-harness"),
    (Join-Path $ProjectRoot ".cursor\skills\superpowers-harness")
)) {
    $TargetResolved = (Resolve-Path $Target -ErrorAction SilentlyContinue)
    if ($TargetResolved -and $TargetResolved.Path -eq $HarnessRootResolved) {
        Write-Host "  [跳过] 源目录与目标相同: $Target" -ForegroundColor DarkGray
        continue
    }
    $Parent = Split-Path $Target -Parent
    New-Item -ItemType Directory -Force -Path $Parent | Out-Null
    if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
    Copy-Item -Path $HarnessRoot -Destination $Target -Recurse -Force
    Write-Host "  [同步] $Target" -ForegroundColor Green
}

# Step 7: package.json pre-commit
$PkgPath = Join-Path $ProjectRoot "package.json"
if (Test-Path $PkgPath) {
    $Pkg = Get-Content $PkgPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $hook = 'node scripts/harness/validate-harness.mjs || exit 0'
    if ($Pkg.'simple-git-hooks'.'pre-commit') {
        $existing = $Pkg.'simple-git-hooks'.'pre-commit'
        if ($existing -notmatch 'validate-harness') {
            $Pkg.'simple-git-hooks'.'pre-commit' = ($existing + ' && ' + $hook)
        }
    } else {
        $Pkg | Add-Member -NotePropertyName 'simple-git-hooks' -NotePropertyValue (@{ 'pre-commit' = $hook }) -Force
    }
    $Pkg | ConvertTo-Json -Depth 10 | Set-Content $PkgPath -Encoding UTF8
    Write-Host "  [更新] package.json pre-commit" -ForegroundColor Green
}

# Step 8: .gitignore
$Gitignore = Join-Path $ProjectRoot ".gitignore"
if (Test-Path $Gitignore) {
    $Gi = [System.IO.File]::ReadAllText($Gitignore, [System.Text.Encoding]::UTF8)
    if ($Gi -notmatch '\.harness/') {
        [System.IO.File]::AppendAllText($Gitignore, "`n.harness/`n", [System.Text.UTF8Encoding]::new($false))
        Write-Host "  [追加] .gitignore .harness/" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Harness 安装完成。" -ForegroundColor Green
Write-Host "  自查: node scripts/harness/validate-harness.mjs"
Write-Host "  规则: docs\superpowers\HARNESS_RULES.md"
Write-Host "  技能: superpowers-harness"
